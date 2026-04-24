'use server';

/**
 * Handles communication with the third-party AntiPay payment gateway.
 * Returns both the redirect URL and the raw text response for debugging.
 */
export async function createPlanPaymentSession(userId: string, planId: string, amount: number) {
  const apiKey = process.env.ANTIPAY_GATEWAY_API_KEY;
  const gatewayUrl = process.env.ANTIPAY_GATEWAY_URL;
  const domain = process.env.APP_DOMAIN;

  if (!apiKey || !gatewayUrl) {
    throw new Error('Payment gateway configuration is missing.');
  }

  const base = gatewayUrl.replace(/\/+$/, "");
  const endpoint = `${base}/create`;
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

    // Capture raw text first to avoid stream consumption issues
    const rawText = await response.text();
    console.log("RAW GATEWAY RESPONSE:", rawText);

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
        error: "Invalid JSON received from gateway", 
        debug: rawText 
      };
    }

    const paymentUrl = data.payment_url || data.paymentUrl;

    if (!paymentUrl) {
      return { 
        success: false, 
        error: "Gateway response missing redirect URL", 
        debug: JSON.stringify(data, null, 2) 
      };
    }

    return { success: true, paymentUrl, debug: JSON.stringify(data, null, 2) };
  } catch (error: any) {
    console.error('GATEWAY FETCH FAILED:', error);
    return { 
      success: false, 
      error: error.message || 'Payment gateway unreachable', 
      debug: 'Network error or DNS failure' 
    };
  }
}
