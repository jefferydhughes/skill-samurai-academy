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

    const { accountId } = await req.json();

    if (!accountId) {
      return Response.json({ error: 'Account ID is required' }, { status: 400 });
    }

    const Stripe = (await import('npm:stripe@17.5.0')).default;
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // Retrieve account details
    const account = await stripe.accounts.retrieve(accountId);

    // Get login link for the connected account
    let loginLink = null;
    try {
      loginLink = await stripe.accounts.createLoginLink(accountId);
    } catch (error) {
      // Login link might not be available for all account types
      console.log('Could not create login link:', error.message);
    }

    // Check verification status
    const requirements = account.requirements || {};
    const currentlyDue = requirements.currently_due || [];
    const eventuallyDue = requirements.eventually_due || [];
    const pastDue = requirements.past_due || [];

    const isVerified = currentlyDue.length === 0 && pastDue.length === 0;
    const needsAttention = currentlyDue.length > 0 || pastDue.length > 0;

    // Get balance if account is verified
    let balance = null;
    if (isVerified) {
      try {
        balance = await stripe.balance.retrieve({
          stripeAccount: accountId,
        });
      } catch (error) {
        console.log('Could not retrieve balance:', error.message);
      }
    }

    // Get recent transfers
    let transfers = [];
    if (isVerified) {
      try {
        const transfersResponse = await stripe.transfers.list({
          destination: accountId,
          limit: 10,
        });
        transfers = transfersResponse.data;
      } catch (error) {
        console.log('Could not retrieve transfers:', error.message);
      }
    }

    const statusInfo = {
      id: account.id,
      business_profile: account.business_profile,
      capabilities: account.capabilities,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      requirements: {
        currently_due: currentlyDue,
        eventually_due: eventuallyDue,
        past_due: pastDue,
      },
      verification_status: isVerified ? 'verified' : (needsAttention ? 'needs_attention' : 'pending'),
      is_verified: isVerified,
      needs_attention: needsAttention,
      created: account.created,
      metadata: account.metadata,
      login_link: loginLink?.url || null,
      balance: balance,
      recent_transfers: transfers,
    };

    // Update location status if needed
    if (account.metadata?.location_id) {
      const locations = await base44.asServiceRole.entities.Location.filter({ 
        id: account.metadata.location_id 
      });
      
      if (locations.length > 0) {
        const newStatus = isVerified ? 'verified' : (needsAttention ? 'needs_attention' : 'pending');
        if (locations[0].stripe_status !== newStatus) {
          await base44.asServiceRole.entities.Location.update(
            account.metadata.location_id,
            { 
              stripe_status: newStatus,
              stripe_connect_account_id: account.id,
            }
          );
        }
      }
    }

    return Response.json(statusInfo);

  } catch (error) {
    console.error('Error getting account status:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});