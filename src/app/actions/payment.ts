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

  // Ensure URL ends correctly
  const base = gatewayUrl.replace(/\/+$/, "");
  const endpoint = `${base}/create`;

  // val_id encodes userId and planId
  const val_id = `${userId}|${planId}`;
  
  // Construct absolute webhook URL
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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gateway Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    // The gateway returns the URL in 'payment_url' field
    const redirectUrl = data.payment_url || data.paymentUrl;

    if (!redirectUrl) {
      console.error('GATEWAY RESPONSE MISSING URL:', data);
      throw new Error('Gateway did not provide a redirect URL.');
    }

    return { paymentUrl: redirectUrl };
  } catch (error: any) {
    console.error('GATEWAY FETCH FAILED:', error);
    throw new Error(error.message || 'Payment gateway unreachable');
  }
}
