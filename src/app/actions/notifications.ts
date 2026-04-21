
'use server';

import { sendCustomEmail } from '@/lib/mail';

/**
 * Notify user about plan activation.
 */
export async function notifyPlanActivation(email: string, planName: string) {
  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #16a34a; margin: 0; font-size: 28px;">AntiPay</h1>
        <p style="color: #64748b; font-size: 14px;">Your Automated Payment Infrastructure</p>
      </div>
      
      <div style="border-top: 4px solid #16a34a; padding-top: 30px;">
        <h2 style="color: #0f172a; font-size: 20px;">Plan Activated Successfully!</h2>
        <p style="color: #334155; font-size: 16px; line-height: 1.6;">
          Hello Merchant,<br><br>
          Great news! Your <strong>${planName}</strong> plan is now active on your AntiPay account. 
          You can now start verifying payments and managing your brands instantly.
        </p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #16a34a;">
          <p style="margin: 0; font-size: 14px; color: #475569;">
            <strong>Subscription Details:</strong><br>
            Plan: ${planName}<br>
            Status: Active
          </p>
        </div>

        <div style="text-align: center;">
          <a href="https://antipay.io/dashboard" 
             style="display: inline-block; background-color: #16a34a; color: #ffffff; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
             Go to Dashboard
          </a>
        </div>
      </div>

      <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
        <p style="font-size: 11px; color: #94a3b8;">
          This is an automated notification from AntiPay. Please do not reply directly to this email.
        </p>
      </div>
    </div>
  `;

  return sendCustomEmail({
    to: email,
    subject: `Success: ${planName} Plan Activated - AntiPay`,
    html
  });
}

/**
 * Notify user that their plan has expired.
 */
export async function notifyPlanExpiration(email: string, planName: string) {
  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fee2e2; padding: 40px; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #dc2626; margin: 0; font-size: 28px;">AntiPay</h1>
        <p style="color: #64748b; font-size: 14px;">Action Required: Plan Expired</p>
      </div>
      
      <div style="border-top: 4px solid #dc2626; padding-top: 30px;">
        <h2 style="color: #0f172a; font-size: 20px;">Your Subscription Has Expired</h2>
        <p style="color: #334155; font-size: 16px; line-height: 1.6;">
          Hello Merchant,<br><br>
          We wanted to let you know that your <strong>${planName}</strong> plan has expired. 
          To prevent any disruption in your automated payment verification services, please renew your plan as soon as possible.
        </p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #dc2626;">
          <p style="margin: 0; font-size: 14px; color: #991b1b;">
            <strong>Status Update:</strong><br>
            Previous Plan: ${planName}<br>
            Access: Limited (Verification Paused)
          </p>
        </div>

        <div style="text-align: center;">
          <a href="https://antipay.io/dashboard/plans" 
             style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
             Renew Subscription Now
          </a>
        </div>
      </div>

      <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
        <p style="font-size: 11px; color: #94a3b8;">
          If you have already renewed, please ignore this email. Need help? Contact supports.antipay@gmail.com
        </p>
      </div>
    </div>
  `;

  return sendCustomEmail({
    to: email,
    subject: `Urgent: Your AntiPay Plan (${planName}) has Expired`,
    html
  });
}
