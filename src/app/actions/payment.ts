'use server';

/**
 * Handles communication with the third-party AntiPay payment gateway.
 * Strictly sends amount, unique val_id, and webhook_url.
 */
export async function createPlanPaymentSession(userId: string, planId: string, amount: number) {
  const apiKey = process.env.ANTIPAY_GATEWAY_API_KEY;
  const gatewayUrl = process.env.ANTIPAY_GATEWAY_URL;
  const domain = process.env.APP_DOMAIN;

  if (!apiKey || !gatewayUrl) {
    throw new Error('Payment gateway configuration is missing.');
  }

  // Ensure clean URLs without extra slashes
  const base = gatewayUrl.replace(/\/+$/, "");
  const endpoint = `${base}/create`;
  
  // val_id is the unique bridge connecting the user and the plan after payment
  const val_id = `${userId}|${planId}`;
  const cleanDomain = (domain || "").replace(/\/+$/, "");
  const webhook_url = `${cleanDomain}/api/webhook`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        amount: Number(amount),
        val_id,
        webhook_url,
      }),
    });

    // Capture raw response for UI debugging as requested
    const rawText = await response.text();
    console.log("GATEWAY RAW RESPONSE:", rawText);

    if (!response.ok) {
      return { 
        success: false, 
        error: `Gateway Error (${response.status})`, 
        debug: rawText 
      };
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      return { 
        success: false, 
        error: "Gateway returned non-JSON data.", 
        debug: rawText 
      };
    }

    // Look for payment_url field in the gateway response
    const paymentUrl = data.payment_url || data.paymentUrl;

    if (!paymentUrl) {
      return { 
        success: false, 
        error: "Gateway response missing payment_url", 
        debug: JSON.stringify(data, null, 2) 
      };
    }

    return { 
      success: true, 
      paymentUrl, 
      debug: JSON.stringify(data, null, 2) 
    };

  } catch (error: any) {
    console.error('GATEWAY INITIATION FAILED:', error);
    return { 
      success: false, 
      error: error.message || 'Payment gateway unreachable', 
      debug: 'Check network connectivity or gateway status.' 
    };
  }
}
