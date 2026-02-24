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
    
    const { accountId, name, unitAmount, currency, interval, metadata = {} } = await req.json();

    if (!accountId || !name || !unitAmount || !currency) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if product already exists with this metadata
    const existingProducts = await stripe.products.search({
      query: `metadata['base44_product_id']:'${metadata.base44_product_id || ''}' AND metadata['location_id']:'${metadata.location_id || ''}'`,
    }, {
      stripeAccount: accountId,
    });

    if (existingProducts.data.length > 0) {
      const existingProduct = existingProducts.data[0];
      const prices = await stripe.prices.list({
        product: existingProduct.id,
      }, {
        stripeAccount: accountId,
      });
      
      return Response.json({ 
        product: existingProduct, 
        price: prices.data[0],
        existed: true 
      });
    }

    // Create new product
    const product = await stripe.products.create({
      name,
      metadata,
    }, {
      stripeAccount: accountId,
    });

    // Create price
    const priceData = {
      product: product.id,
      unit_amount: unitAmount,
      currency,
    };

    if (interval) {
      priceData.recurring = { interval };
    }

    const price = await stripe.prices.create(priceData, {
      stripeAccount: accountId,
    });

    return Response.json({ product, price, existed: false });
  } catch (error) {
    console.error('Error creating product/price:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});