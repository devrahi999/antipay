
'use server';

import { sendCustomEmail } from '@/lib/mail';

/**
 * Common HTML Wrapper for all business emails
 */
const getHtmlLayout = (title: string, content: string, actionLabel?: string, actionUrl?: string) => `
  <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f7f6; padding: 40px 20px; color: #1a202c;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
      <!-- Header -->
      <div style="background-color: #16a34a; padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">AntiPay</h1>
        <p style="color: #dcfce7; margin: 5px 0 0; font-size: 14px; font-weight: 500;">Automated Payment Infrastructure</p>
      </div>
      
      <!-- Body -->
      <div style="padding: 40px;">
        <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin-bottom: 20px;">${title}</h2>
        <div style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          ${content}
        </div>
        
        ${actionLabel && actionUrl ? `
          <div style="text-align: center; margin-top: 20px;">
            <a href="${actionUrl}" style="display: inline-block; background-color: #16a34a; color: #ffffff; padding: 14px 35px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; transition: background-color 0.3s ease;">
              ${actionLabel}
            </a>
          </div>
        ` : ''}
      </div>

      <!-- Footer -->
      <div style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
          &copy; 2024 AntiPay Ltd. Dhaka, Bangladesh.
        </p>
        <p style="margin: 10px 0 0; font-size: 11px; color: #9ca3af;">
          If you have any questions, contact us at <a href="mailto:supports.antipay@gmail.com" style="color: #16a34a; text-decoration: none;">supports.antipay@gmail.com</a>
        </p>
      </div>
    </div>
  </div>
`;

/**
 * Notify user on successful signup.
 */
export async function notifyWelcome(email: string, name: string) {
  const content = `
    Hello <strong>${name}</strong>,<br><br>
    Welcome to the AntiPay ecosystem! We are excited to help you automate your business payments.<br><br>
    You can now log in to your dashboard to create your first brand and start verifying payments for bKash, Nagad, and Rocket instantly.
  `;
  const html = getHtmlLayout("Welcome to AntiPay! 👋", content, "Access Dashboard", "https://antipay.io/dashboard");

  return sendCustomEmail({
    to: email,
    subject: `Welcome to AntiPay, ${name}!`,
    html
  });
}

/**
 * Notify user about plan activation.
 */
export async function notifyPlanActivation(email: string, planName: string) {
  const content = `
    Great news! Your <strong>${planName}</strong> plan is now active.<br><br>
    Your account quotas have been updated. You can now connect more devices and create more brand identities according to your plan limits.
  `;
  const html = getHtmlLayout("Plan Activated Successfully! ✨", content, "View Subscription", "https://antipay.io/dashboard/subscription");

  return sendCustomEmail({
    to: email,
    subject: `Success: ${planName} Plan is now Active - AntiPay`,
    html
  });
}

/**
 * Notify user that their plan has expired.
 */
export async function notifyPlanExpiration(email: string, planName: string) {
  const content = `
    Your <strong>${planName}</strong> subscription has expired.<br><br>
    To avoid any disruption in your payment verification services, please renew your plan as soon as possible. Your current verification nodes might be paused until renewal.
  `;
  const html = getHtmlLayout("Action Required: Plan Expired ⚠️", content, "Renew Now", "https://antipay.io/dashboard/plans");

  return sendCustomEmail({
    to: email,
    subject: `Urgent: Your AntiPay Plan (${planName}) has Expired`,
    html
  });
}
