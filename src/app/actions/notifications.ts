
'use server';

import { sendCustomEmail } from '@/lib/mail';

const getHtmlLayout = (title: string, content: string, actionLabel?: string, actionUrl?: string) => `
  <div style="font-family: 'Inter', sans-serif; background-color: #f4f7f6; padding: 50px 10px; color: #1a202c;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 40px 60px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
      <!-- Header -->
      <div style="padding: 40px 30px; text-align: center; border-bottom: 1px solid #f7fafc; background: linear-gradient(to bottom, #ffffff, #fcfdfc);">
        <img src="https://i.imgur.com/Chozuv5.png" alt="AntiPay" style="height: 55px; width: auto; margin-bottom: 12px;">
        <p style="color: #16a34a; margin: 0; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.25em;">Premium Payment Infrastructure</p>
      </div>
      
      <!-- Body -->
      <div style="padding: 50px 40px;">
        <h2 style="color: #111827; font-size: 28px; font-weight: 800; margin-bottom: 20px; text-align: center; line-height: 1.2;">${title}</h2>
        <div style="color: #4b5563; font-size: 17px; line-height: 1.8; margin-bottom: 40px; text-align: center;">
          ${content}
        </div>
        
        ${actionLabel && actionUrl ? `
          <div style="text-align: center;">
            <a href="${actionUrl}" style="display: inline-block; background-color: #16a34a; color: #ffffff; padding: 18px 50px; border-radius: 20px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 15px 30px rgba(22,163,74,0.25);">
              ${actionLabel}
            </a>
          </div>
        ` : ''}
      </div>

      <!-- Features Snapshot -->
      <div style="padding: 30px 40px; background-color: #f9fafb; text-align: center;">
        <div style="display: inline-block; margin: 0 10px;">
          <p style="font-size: 11px; color: #9ca3af; font-weight: 700; margin: 0;">99.9% UPTIME</p>
        </div>
        <div style="display: inline-block; margin: 0 10px;">
          <p style="font-size: 11px; color: #9ca3af; font-weight: 700; margin: 0;">INSTANT VERIFICATION</p>
        </div>
        <div style="display: inline-block; margin: 0 10px;">
          <p style="font-size: 11px; color: #9ca3af; font-weight: 700; margin: 0;">24/7 SUPPORT</p>
        </div>
      </div>

      <!-- Footer -->
      <div style="padding: 40px 30px; background-color: #ffffff; border-top: 1px solid #f3f4f6; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af; font-weight: 600;">
          &copy; 2024 AntiPay Ltd. Dhaka, Bangladesh.
        </p>
        <p style="margin: 15px 0 0; font-size: 11px; color: #9ca3af;">
          Need help? <a href="mailto:supports.antipay@gmail.com" style="color: #16a34a; text-decoration: none; font-weight: 700;">Contact Merchant Support</a>
        </p>
      </div>
    </div>
  </div>
`;

export async function notifyWelcome(email: string, name: string) {
  const content = `
    Hi <strong>${name}</strong>,<br><br>
    Welcome to the AntiPay ecosystem! We are excited to help you automate your business payments for bKash, Nagad, and Rocket instantly.<br><br>
    Start by logging in to your dashboard to register your first brand and generate your API key.
  `;
  const html = getHtmlLayout("Welcome to the Future of Payments! 👋", content, "Access Merchant Dashboard", "https://antipay.site/dashboard");

  return sendCustomEmail({ to: email, subject: `Welcome to AntiPay, ${name}!`, html });
}

export async function notifyPlanActivation(email: string, planName: string) {
  const content = `
    Success! Your <strong>${planName}</strong> infrastructure plan is now active.<br><br>
    Your account quotas for Brand Identities and Android Nodes have been updated instantly. You can now process transactions according to your new plan limits.
  `;
  const html = getHtmlLayout("Infrastructure Plan Activated! ✨", content, "View Your Subscription", "https://antipay.site/dashboard/subscription");

  return sendCustomEmail({ to: email, subject: `AntiPay: ${planName} Plan Active`, html });
}

export async function notifyPlanExpiration(email: string, planName: string) {
  const content = `
    Urgent: Your <strong>${planName}</strong> subscription has expired.<br><br>
    To maintain real-time verification and prevent node disruption, please renew your plan immediately from your upgrade center.
  `;
  const html = getHtmlLayout("Action Required: Plan Expired ⚠️", content, "Renew Subscription Now", "https://antipay.site/dashboard/plans");

  return sendCustomEmail({ to: email, subject: `Urgent: AntiPay Plan Expired`, html });
}
