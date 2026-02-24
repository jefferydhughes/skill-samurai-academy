import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = user?.userRole || user?.role || 'parent';
    if (!['admin', 'instructor', 'owner'].includes(userRole)) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { 
      amount,
      destinationAccountId,
      sourceTransactionId,
      metadata = {},
      description,
      transferGroup
    } = await req.json();

    if (!amount || !destinationAccountId) {
      return Response.json({ error: 'Amount and destination account ID are required' }, { status: 400 });
    }

    const Stripe = (await import('npm:stripe@17.5.0')).default;
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // Calculate platform fee before transfer
    const platformFeeResponse = await fetch(`${Deno.env.get('BASE44_API_URL')}/functions/calculatePlatformFee`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization'),
      },
      body: JSON.stringify({
        amount,
        locationId: metadata.location_id,
        productType: metadata.product_type,
      }),
    });

    let platformFeeData;
    try {
      platformFeeData = await platformFeeResponse.json();
    } catch (error) {
      console.log('Could not calculate platform fee, using default');
      platformFeeData = { platform_fee_amount: Math.round(amount * 0.10) };
    }

    // Create transfer with platform fee
    const transferData = {
      amount: platformFeeData.net_amount_to_location || Math.round(amount * 0.90), // Net amount to location
      currency: 'usd',
      destination: destinationAccountId,
      description: description || `Transfer from Skill Samurai Platform`,
      metadata: {
        ...metadata,
        platform_fee_amount: platformFeeData.platform_fee_amount || Math.round(amount * 0.10),
        total_amount: amount,
        transfer_date: new Date().toISOString(),
        processed_by: user.id,
        processed_by_email: user.email,
      },
    };

    if (transferGroup) {
      transferData.transfer_group = transferGroup;
    }

    if (sourceTransactionId) {
      transferData.source_transaction = sourceTransactionId;
    }

    const transfer = await stripe.transfers.create(transferData);

    // Create application fee record for tracking
    try {
      await base44.asServiceRole.entities.PlatformFee.create({
        transfer_id: transfer.id,
        destination_account_id: destinationAccountId,
        total_amount: amount,
        platform_fee_amount: platformFeeData.platform_fee_amount || Math.round(amount * 0.10),
        net_amount_to_location: platformFeeData.net_amount_to_location || Math.round(amount * 0.90),
        currency: 'usd',
        transfer_date: new Date().toISOString(),
        processed_by: user.id,
        metadata: metadata,
        stripe_transfer_id: transfer.id,
        status: 'completed',
      });
    } catch (error) {
      console.log('Could not create platform fee record:', error.message);
    }

    // Update location's transfer history if location_id is provided
    if (metadata.location_id) {
      try {
        const locations = await base44.asServiceRole.entities.Location.filter({ 
          id: metadata.location_id 
        });
        
        if (locations.length > 0) {
          const location = locations[0];
          const currentTotal = location.total_transfers || 0;
          await base44.asServiceRole.entities.Location.update(
            metadata.location_id,
            { 
              total_transfers: currentTotal + platformFeeData.net_amount_to_location,
              last_transfer_date: new Date().toISOString(),
            }
          );
        }
      } catch (error) {
        console.log('Could not update location transfer history:', error.message);
      }
    }

    return Response.json({ 
      transferId: transfer.id,
      amount: transfer.amount,
      destination: transfer.destination,
      status: transfer.status,
      arrivalDate: transfer.arrival_date,
      platformFee: platformFeeData.platform_fee_amount || Math.round(amount * 0.10),
      netAmount: platformFeeData.net_amount_to_location || Math.round(amount * 0.90),
      transferGroup: transfer.transfer_group,
      metadata: transfer.metadata,
    });

  } catch (error) {
    console.error('Error creating transfer:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});