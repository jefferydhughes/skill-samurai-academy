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
      amount, 
      currency, 
      metadata = {},
      customerId 
    } = await req.json();

    if (!accountId || !amount || !currency) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create payment intent on connected account
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      customer: customerId,
      metadata: {
        base44_user_id: user.id,
        ...metadata,
      },
    }, {
      stripeAccount: accountId,
    });

    return Response.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id 
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});