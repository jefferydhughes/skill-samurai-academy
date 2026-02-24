import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const Stripe = (await import('npm:stripe@17.5.0')).default;
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    
    const { 
      accountId, 
      items, 
      upsells = [], 
      customerEmail,
      taxRateId,
      metadata = {}
    } = await req.json();

    if (!accountId || !items || items.length === 0) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create or retrieve customer on connected account
    const customers = await stripe.customers.list({
      email: customerEmail || user.email,
      limit: 1,
    }, {
      stripeAccount: accountId,
    });

    let customerId = customers.data[0]?.id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: customerEmail || user.email,
        metadata: { 
          base44_user_id: user.id,
          base44_email: user.email 
        },
      }, {
        stripeAccount: accountId,
      });
      customerId = customer.id;
    }

    // Build line items
    const lineItems = items.map(item => {
      if (item.stripePriceId) {
        // Use existing Stripe price
        return {
          price: item.stripePriceId,
          quantity: item.quantity || 1,
        };
      } else {
        // Create price on the fly
        return {
          price_data: {
            currency: item.currency || 'usd',
            product_data: {
              name: item.name,
              description: item.description,
              metadata: item.metadata || {},
            },
            unit_amount: item.price,
            ...(item.recurring ? { recurring: { interval: item.recurring } } : {}),
          },
          quantity: item.quantity || 1,
        };
      }
    });

    // Add upsells
    const upsellPrices = {
      early_dropoff: 1500,
      late_pickup: 1500,
      lunch_program: 2000,
      tshirt: 2500,
    };

    upsells.forEach(upsell => {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: upsell.replace('_', ' ').toUpperCase(),
          },
          unit_amount: upsellPrices[upsell],
        },
        quantity: 1,
      });
    });

    // Determine mode
    const hasSubscription = items.some(i => i.type === 'subscription' || i.recurring);
    const mode = hasSubscription ? 'subscription' : 'payment';

    // Create checkout session with platform fees
    const sessionData = {
      mode,
      customer: customerId,
      line_items: lineItems,
      success_url: `${Deno.env.get('BASE44_APP_URL') || 'http://localhost:3000'}/CheckoutSuccess?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get('BASE44_APP_URL') || 'http://localhost:3000'}/ProgramsBrowser`,
      payment_intent_data: mode === 'payment' ? {
        transfer_data: {
          destination: accountId,
        },
        application_fee_amount: 0, // Will be calculated and processed separately
      } : {},
      subscription_data: mode === 'subscription' ? {
        transfer_data: {
          destination: accountId,
        },
        application_fee_percent: 10, // 10% platform fee for subscriptions
      } : {},
      metadata: {
        base44_user_id: user.id,
        items: JSON.stringify(items),
        upsells: JSON.stringify(upsells),
        destination_account_id: accountId,
        ...metadata,
      },
    };

    if (taxRateId) {
      sessionData.line_items = lineItems.map(item => ({
        ...item,
        tax_rates: [taxRateId],
      }));
    }

    const session = await stripe.checkout.sessions.create(sessionData, {
      stripeAccount: accountId,
    });

    return Response.json({ 
      url: session.url, 
      sessionId: session.id,
      mode 
    });
  } catch (error) {
    console.error('Error creating checkout:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});