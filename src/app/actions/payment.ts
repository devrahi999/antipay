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

  // val_id encodes userId and planId so the webhook knows what to activate
  const val_id = `${userId}|${planId}`;
  const webhook_url = `${domain}/api/webhook`;

  try {
    const response = await fetch(`${gatewayUrl}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'antipay-api-key': apiKey,
      },
      body: JSON.stringify({
        amount: Number(amount),
        val_id,
        webhook_url,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create payment session');
    }

    return { paymentUrl: data.paymentUrl };
  } catch (error: any) {
    console.error('GATEWAY ERROR:', error);
    throw new Error(error.message || 'Payment gateway unreachable');
  }
}
