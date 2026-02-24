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
      locationId,
      businessType = 'company',
      country = 'US',
      email,
      businessProfile 
    } = await req.json();

    if (!locationId) {
      return Response.json({ error: 'Location ID is required' }, { status: 400 });
    }

    const Stripe = (await import('npm:stripe@17.5.0')).default;
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // Get location information
    const locations = await base44.asServiceRole.entities.Location.filter({ 
      id: locationId 
    });
    
    if (locations.length === 0) {
      return Response.json({ error: 'Location not found' }, { status: 404 });
    }

    const location = locations[0];

    // Check if connected account already exists
    if (location.stripe_connect_account_id) {
      // Return existing account
      const account = await stripe.accounts.retrieve(location.stripe_connect_account_id);
      return Response.json({ 
        accountId: account.id,
        status: account.requirements?.currently_due?.length === 0 ? 'verified' : 'pending',
        account 
      });
    }

    // Create connected account
    const accountData = {
      type: 'express',
      country: country,
      email: email || location.email || user.email,
      business_type: businessType,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: businessProfile?.name || location.name,
        url: businessProfile?.url || location.website,
        product_description: businessProfile?.product_description || 'Children coding education and classes',
        support_email: businessProfile?.support_email || location.email || user.email,
        support_phone: businessProfile?.support_phone || location.phone,
      },
      metadata: {
        location_id: locationId,
        base44_user_id: user.id,
        location_name: location.name,
      },
    };

    // Add individual details if not a company
    if (businessType === 'individual') {
      accountData.individual = {
        email: email || location.email || user.email,
      };
    }

    const account = await stripe.accounts.create(accountData);

    // Update location with Stripe Connect account ID
    await base44.asServiceRole.entities.Location.update(locationId, {
      stripe_connect_account_id: account.id,
      stripe_status: 'pending',
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${Deno.env.get('BASE44_APP_URL') || 'http://localhost:3000'}/LocationsManager`,
      return_url: `${Deno.env.get('BASE44_APP_URL') || 'http://localhost:3000'}/LocationsManager`,
      type: 'account_onboarding',
    });

    return Response.json({ 
      accountId: account.id,
      accountLinkUrl: accountLink.url,
      status: 'pending',
      account 
    });

  } catch (error) {
    console.error('Error creating connected account:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});