import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      amount,
      locationId,
      productType = 'class',
      customFeePercentage 
    } = await req.json();

    if (!amount || !locationId) {
      return Response.json({ error: 'Amount and location ID are required' }, { status: 400 });
    }

    // Get location to determine platform fee
    const locations = await base44.asServiceRole.entities.Location.filter({ 
      id: locationId 
    });
    
    if (locations.length === 0) {
      return Response.json({ error: 'Location not found' }, { status: 404 });
    }

    const location = locations[0];

    // Default platform fee structure (can be customized per location)
    let platformFeePercentage = 0.10; // 10% default platform fee
    
    // Custom fee percentage if provided
    if (customFeePercentage) {
      platformFeePercentage = customFeePercentage;
    }
    // Location-specific fee
    else if (location.platform_fee_percentage) {
      platformFeePercentage = location.platform_fee_percentage;
    }
    // Product-specific fee structure
    else {
      switch (productType) {
        case 'camp':
          platformFeePercentage = 0.08; // 8% for camps
          break;
        case 'subscription':
          platformFeePercentage = 0.12; // 12% for recurring subscriptions
          break;
        case 'trial':
          platformFeePercentage = 0.00; // 0% for free trials
          break;
        default:
          platformFeePercentage = 0.10; // 10% for regular classes
      }
    }

    // Calculate platform fee in cents
    const platformFee = Math.round(amount * platformFeePercentage);
    const netAmount = amount - platformFee;

    // Minimum fee $2.00
    const minimumFee = 200;
    const finalPlatformFee = Math.max(platformFee, minimumFee);
    const finalNetAmount = amount - finalPlatformFee;

    const feeBreakdown = {
      original_amount: amount,
      platform_fee_percentage: platformFeePercentage,
      platform_fee_amount: finalPlatformFee,
      net_amount_to_location: finalNetAmount,
      fee_breakdown: {
        platform_fee: finalPlatformFee,
        stripe_processing_fee: Math.round(amount * 0.029 + 30), // 2.9% + $0.30
        total_fees: finalPlatformFee + Math.round(amount * 0.029 + 30),
      },
      currency: 'usd',
    };

    return Response.json(feeBreakdown);

  } catch (error) {
    console.error('Error calculating platform fee:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});