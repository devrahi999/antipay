
'use server';

import { sendCustomEmail } from '@/lib/mail';

/**
 * Server action to notify user about plan activation via custom SMTP.
 */
export async function notifyPlanActivation(email: string, planName: string) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h2 style="color: #16a34a;">AntiPay - Plan Activated!</h2>
      <p>Hello Merchant,</p>
      <p>Congratulations! Your <strong>${planName}</strong> plan is now active.</p>
      <p>You can now start using our API and nodes to automate your payments instantly.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #666;">This is an automated notification from AntiPay. Please do not reply.</p>
    </div>
  `;

  return sendCustomEmail({
    to: email,
    subject: `Plan Activated: ${planName} - AntiPay`,
    html
  });
}
