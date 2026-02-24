import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Helper function to process platform fees
async function processPlatformFee(paymentIntentId, locationId, productType, metadata) {
  try {
    const Stripe = (await import('npm:stripe@17.5.0')).default;
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // Get location details for destination account
    const locations = await base44.asServiceRole.entities.Location.filter({ 
      id: locationId 
    });
    
    if (locations.length === 0 || !locations[0].stripe_connect_account_id) {
      console.log('Location or Stripe Connect account not found for platform fee processing');
      return null;
    }

    const location = locations[0];
    const destinationAccountId = location.stripe_connect_account_id;

    // Get payment intent details
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Calculate platform fee
    const platformFeeResponse = await fetch(`${Deno.env.get('BASE44_API_URL')}/functions/calculatePlatformFee`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`,
      },
      body: JSON.stringify({
        amount: paymentIntent.amount,
        locationId: locationId,
        productType: productType,
      }),
    });

    let platformFeeData;
    try {
      platformFeeData = await platformFeeResponse.json();
    } catch (error) {
      console.log('Could not calculate platform fee, using default');
      platformFeeData = { 
        platform_fee_amount: Math.round(paymentIntent.amount * 0.10),
        net_amount_to_location: Math.round(paymentIntent.amount * 0.90)
      };
    }

    // Create transfer to location with platform fee
    const transfer = await stripe.transfers.create({
      amount: platformFeeData.net_amount_to_location,
      currency: 'usd',
      destination: destinationAccountId,
      source_transaction: paymentIntentId,
      description: `Platform transfer for ${productType} payment`,
      transfer_group: `platform_${productType}_${locationId}`,
      metadata: {
        payment_intent_id: paymentIntentId,
        location_id: locationId,
        product_type: productType,
        platform_fee_amount: platformFeeData.platform_fee_amount,
        total_amount: paymentIntent.amount,
        ...metadata,
      },
    });

    // Create platform fee record
    try {
      await base44.asServiceRole.entities.PlatformFee.create({
        payment_intent_id: paymentIntentId,
        transfer_id: transfer.id,
        destination_account_id: destinationAccountId,
        total_amount: paymentIntent.amount,
        platform_fee_amount: platformFeeData.platform_fee_amount,
        net_amount_to_location: platformFeeData.net_amount_to_location,
        currency: 'usd',
        transfer_date: new Date().toISOString(),
        product_type: productType,
        location_id: locationId,
        metadata: metadata,
        stripe_transfer_id: transfer.id,
        status: 'pending',
      });
    } catch (error) {
      console.log('Could not create platform fee record:', error.message);
    }

    // Update location's transfer history
    try {
      const currentTotal = location.total_transfers || 0;
      await base44.asServiceRole.entities.Location.update(
        locationId,
        { 
          total_transfers: currentTotal + platformFeeData.net_amount_to_location,
          last_transfer_date: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.log('Could not update location transfer history:', error.message);
    }

    return transfer;
  } catch (error) {
    console.error('Error processing platform fee:', error);
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    const Stripe = (await import('npm:stripe@17.5.0')).default;
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    
    // Verify webhook signature
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        Deno.env.get('STRIPE_WEBHOOK_SECRET')
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Initialize base44 with service role
    const base44 = createClientFromRequest(req);
    
    // Handle events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const metadata = session.metadata;
        
        if (session.mode === 'subscription') {
          const items = JSON.parse(metadata.items || '[]');
          const subscriptionItem = items.find(i => i.type === 'subscription');
          
          if (subscriptionItem) {
            // Create membership record
            const membership = await base44.asServiceRole.entities.Membership.create({
              student_id: subscriptionItem.studentId,
              parent_id: metadata.base44_user_id,
              plan: subscriptionItem.plan,
              slots: subscriptionItem.slots || [],
              status: 'active',
              stripe_subscription_id: session.subscription,
              stripe_customer_id: session.customer,
              location_id: subscriptionItem.locationId,
              start_date: new Date().toISOString().split('T')[0],
              amount: session.amount_total,
              currency: session.currency?.toUpperCase() || 'USD',
            });

            // Process platform fee for subscription
            if (session.payment_intent) {
              await processPlatformFee(session.payment_intent, subscriptionItem.locationId, 'subscription', metadata);
            }
          }
        } else if (session.mode === 'payment') {
          const items = JSON.parse(metadata.items || '[]');
          
          // Process all camp bookings and other payments
          for (const item of items) {
            if (item.type === 'camp') {
              // Get camp event to get dates and title
              const campEvents = await base44.asServiceRole.entities.CampEvent.filter({ 
                id: item.campEventId 
              });
              const campEvent = campEvents[0];
              
              // Get or create student record
              let student = null;
              const students = await base44.asServiceRole.entities.Student.filter({
                parent_id: metadata.base44_user_id,
                full_name: item.studentName,
              });
              
              if (students.length > 0) {
                student = students[0];
              } else {
                // Create new student record
                student = await base44.asServiceRole.entities.Student.create({
                  parent_id: metadata.base44_user_id,
                  location_id: item.locationId,
                  full_name: item.studentName,
                  dob: item.studentDob,
                });
              }
              
              // Create camp booking
              const booking = await base44.asServiceRole.entities.CampBooking.create({
                camp_event_id: item.campEventId,
                student_id: student.id,
                parent_id: metadata.base44_user_id,
                location_id: item.locationId,
                stripe_payment_intent_id: session.payment_intent,
                amount: session.amount_total,
                currency: session.currency?.toUpperCase() || 'USD',
                status: 'confirmed',
                camp_title: campEvent?.title || item.name,
                camp_dates: campEvent ? `${campEvent.start_datetime} - ${campEvent.end_datetime}` : null,
              });
              
              // Update camp enrolled count
              if (campEvent) {
                await base44.asServiceRole.entities.CampEvent.update(campEvent.id, {
                  enrolled_count: (campEvent.enrolled_count || 0) + 1,
                });
              }

              // Process platform fee for camp booking
              if (session.payment_intent) {
                await processPlatformFee(session.payment_intent, item.locationId, 'camp', metadata);
              }
            } else if (item.type === 'class' || item.type === 'weekly_class') {
              // Handle weekly class bookings
              const booking = await base44.asServiceRole.entities.ClassBooking.create({
                student_id: item.studentId,
                parent_id: metadata.base44_user_id,
                location_id: item.locationId,
                stripe_payment_intent_id: session.payment_intent,
                amount: item.price || session.amount_total,
                currency: session.currency?.toUpperCase() || 'USD',
                status: 'confirmed',
                class_type: item.plan,
                slots: item.slots || [],
              });

              // Process platform fee for class booking
              if (session.payment_intent) {
                await processPlatformFee(session.payment_intent, item.locationId, 'class', metadata);
              }
            }
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        
        // Process any additional platform fee handling if needed
        if (paymentIntent.transfer_data?.destination) {
          console.log('Transfer processed to:', paymentIntent.transfer_data.destination);
        }
        break;
      }

      // Stripe Connect events
      case 'account.updated': {
        const account = event.data.object;
        console.log('Connected account updated:', account.id);
        
        // Update location status based on account requirements
        if (account.metadata?.location_id) {
          const requirements = account.requirements || {};
          const currentlyDue = requirements.currently_due || [];
          const pastDue = requirements.past_due || [];
          const isVerified = currentlyDue.length === 0 && pastDue.length === 0;
          
          const newStatus = isVerified ? 'verified' : (currentlyDue.length > 0 ? 'needs_attention' : 'pending');
          
          await base44.asServiceRole.entities.Location.update(
            account.metadata.location_id,
            { 
              stripe_status: newStatus,
              charges_enabled: account.charges_enabled,
              payouts_enabled: account.payouts_enabled,
            }
          );
        }
        break;
      }

      case 'payout.created':
      case 'payout.paid':
      case 'payout.failed': {
        const payout = event.data.object;
        console.log('Payout event:', event.type, payout.id);
        
        // Create payout record for tracking
        try {
          await base44.asServiceRole.entities.Payout.create({
            stripe_payout_id: payout.id,
            destination_account_id: payout.destination,
            amount: payout.amount,
            currency: payout.currency.toUpperCase(),
            status: event.type.replace('payout.', '').replace('_', ''),
            arrival_date: new Date(payout.arrival_date * 1000).toISOString(),
            created: new Date(payout.created * 1000).toISOString(),
            metadata: payout.metadata || {},
          });
        } catch (error) {
          console.log('Could not create payout record:', error.message);
        }
        break;
      }

      case 'transfer.created': {
        const transfer = event.data.object;
        console.log('Transfer created:', transfer.id);
        
        // Update transfer record status
        try {
          await base44.asServiceRole.entities.PlatformFee.update(
            { stripe_transfer_id: transfer.id },
            { 
              status: 'in_transit',
              arrival_date: new Date(transfer.arrival_date * 1000).toISOString(),
            }
          );
        } catch (error) {
          console.log('Could not update transfer record:', error.message);
        }
        break;
      }

      case 'transfer.paid': {
        const transfer = event.data.object;
        console.log('Transfer paid:', transfer.id);
        
        // Mark transfer as completed
        try {
          await base44.asServiceRole.entities.PlatformFee.update(
            { stripe_transfer_id: transfer.id },
            { 
              status: 'completed',
              completed_date: new Date().toISOString(),
            }
          );
        } catch (error) {
          console.log('Could not update transfer record:', error.message);
        }
        break;
      }

      case 'application_fee.created': {
        const applicationFee = event.data.object;
        console.log('Application fee created:', applicationFee.id);
        
        // Track application fees for reporting
        try {
          await base44.asServiceRole.entities.ApplicationFee.create({
            stripe_fee_id: applicationFee.id,
            amount: applicationFee.amount,
            currency: applicationFee.currency.toUpperCase(),
            charge_id: applicationFee.charge,
            created: new Date(applicationFee.created * 1000).toISOString(),
            metadata: applicationFee.metadata || {},
          });
        } catch (error) {
          console.log('Could not create application fee record:', error.message);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'invoice.paid': {
        console.log('Subscription/invoice event:', event.type);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await base44.asServiceRole.entities.Membership.update(
          { stripe_subscription_id: subscription.id },
          {
            status: 'cancelled',
            end_date: new Date().toISOString().split('T')[0],
          }
        );
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});