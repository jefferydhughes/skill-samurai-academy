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
    
    const { accountId, displayName, percentage, inclusive = false } = await req.json();

    if (!accountId || !displayName || percentage === undefined) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const taxRate = await stripe.taxRates.create({
      display_name: displayName,
      percentage,
      inclusive,
    }, {
      stripeAccount: accountId,
    });

    return Response.json({ taxRate });
  } catch (error) {
    console.error('Error creating tax rate:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});