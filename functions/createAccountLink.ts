import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin permissions
    const userRole = user?.userRole || user?.role || 'parent';
    if (!['admin', 'instructor', 'owner'].includes(userRole)) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { 
      accountId,
      return_url,
      refresh_url,
      type = 'account_onboarding'
    } = await req.json();

    if (!accountId) {
      return Response.json({ error: 'Account ID is required' }, { status: 400 });
    }

    const Stripe = (await import('npm:stripe@17.5.0')).default;
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    const accountLinkData = {
      account: accountId,
      type: type,
      refresh_url: refresh_url || `${Deno.env.get('BASE44_APP_URL') || 'http://localhost:3000'}/LocationsManager`,
      return_url: return_url || `${Deno.env.get('BASE44_APP_URL') || 'http://localhost:3000'}/LocationsManager`,
    };

    // Add collection options for different types
    if (type === 'account_update') {
      accountLinkData.collection_options = {
        fields: 'eventually_due',
      };
    }

    const accountLink = await stripe.accountLinks.create(accountLinkData);

    return Response.json({ 
      accountLinkUrl: accountLink.url,
      expiresAt: accountLink.expires_at,
    });

  } catch (error) {
    console.error('Error creating account link:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});