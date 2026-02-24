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
      customerId, 
      priceId, 
      metadata = {} 
    } = await req.json();

    if (!accountId || !customerId || !priceId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create subscription with incomplete payment behavior
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        base44_user_id: user.id,
        ...metadata,
      },
    }, {
      stripeAccount: accountId,
    });

    return Response.json({ 
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});