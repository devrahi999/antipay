'use server';

/**
 * Handles communication with the third-party AntiPay payment gateway.
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
  
  // The val_id contains both userId and the target planId separated by a pipe
  const val_id = `${userId}|${planId}`;
  
  // Construct the webhook URL using the domain from .env
  const cleanDomain = (domain || "").replace(/\/+$/, "");
  const webhook_url = `${cleanDomain}/api/webhook`;

  console.log("--- CREATING PAYMENT SESSION ---", { userId, planId, webhook_url });

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

    const rawText = await response.text();
    console.log("GATEWAY CREATE RESPONSE:", rawText);

    if (!response.ok) {
      return { success: false, error: `Gateway Error (${response.status})`, debug: rawText };
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      return { success: false, error: "Gateway returned non-JSON data.", debug: rawText };
    }

    const paymentUrl = data.payment_url || data.paymentUrl;

    if (!paymentUrl) {
      return { success: false, error: "Gateway response missing payment_url", debug: JSON.stringify(data, null, 2) };
    }

    return { success: true, paymentUrl, debug: JSON.stringify(data, null, 2) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Payment gateway unreachable', debug: 'Network failure' };
  }
}

/**
 * Verifies a payment session directly with the gateway.
 */
export async function verifyPaymentSession(sessionId: string, trxId: string) {
  const apiKey = process.env.ANTIPAY_GATEWAY_API_KEY;
  const gatewayUrl = process.env.ANTIPAY_GATEWAY_URL;

  if (!apiKey || !gatewayUrl) throw new Error('Configuration missing');

  const base = gatewayUrl.replace(/\/+$/, "");
  const endpoint = `${base}/verify`;

  try {
    const payload = { 
      sessionId, 
      session_id: sessionId,
      trxId, 
      trx_id: trxId 
    };
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    if (data.status === 'verified' || data.status === 'success' || data.success === true) {
      return { success: true, data };
    }
    return { success: false, error: data.message || data.error || 'Payment not verified yet.' };
  } catch (error: any) {
    console.error("VERIFY ACTION CRASH:", error);
    return { success: false, error: 'Verification service unreachable' };
  }
}
