'use server';

/**
 * Handles communication with the third-party AntiPay payment gateway.
 * Used for merchants to upgrade their own infrastructure plans.
 */

export async function createPlanPaymentSession(userId: string, planId: string, amount: number) {
  const apiKey = process.env.ANTIPAY_GATEWAY_API_KEY;
  const gatewayUrl = process.env.ANTIPAY_GATEWAY_URL;
  const domain = process.env.APP_DOMAIN;

  if (!apiKey || !gatewayUrl) {
    throw new Error('Payment gateway configuration is missing.');
  }

  // Normalize URL: strip trailing slashes and ensure it ends with /create
  const base = gatewayUrl.replace(/\/+$/, "");
  const endpoint = `${base}/create`;

  // val_id encodes userId and planId so the webhook knows what to activate
  const val_id = `${userId}|${planId}`;
  
  // Construct the absolute webhook URL
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

    // Check if the response is actually JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textError = await response.text();
      console.error('GATEWAY ERROR LOG:', {
        status: response.status,
        url: endpoint,
        responseSnippet: textError.substring(0, 200)
      });
      throw new Error(`Gateway returned non-JSON response (${response.status}). The endpoint might be incorrect.`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create payment session');
    }

    return { paymentUrl: data.paymentUrl };
  } catch (error: any) {
    console.error('GATEWAY FETCH FAILED:', error);
    throw new Error(error.message || 'Payment gateway unreachable or misconfigured');
  }
}
