'use server';

import { sendCustomEmail } from '@/lib/mail';

const getHtmlLayout = (title: string, content: string, actionLabel?: string, actionUrl?: string) => `
  <div style="font-family: 'Inter', sans-serif; background-color: #f1f5f9; padding: 40px 10px; color: #1e293b;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
      <!-- Header -->
      <div style="padding: 30px; text-align: center; border-bottom: 1px solid #f1f5f9;">
        <img src="https://i.imgur.com/Chozuv5.png" alt="AntiPay" style="height: 45px; width: auto; margin-bottom: 10px;">
        <p style="color: #64748b; margin: 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Automated Payment Infrastructure</p>
      </div>
      
      <!-- Body -->
      <div style="padding: 40px 30px;">
        <h2 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 16px; text-align: center;">${title}</h2>
        <div style="color: #475569; font-size: 16px; line-height: 1.7; margin-bottom: 35px; text-align: center;">
          ${content}
        </div>
        
        ${actionLabel && actionUrl ? `
          <div style="text-align: center; margin-top: 10px;">
            <a href="${actionUrl}" style="display: inline-block; background-color: #16a34a; color: #ffffff; padding: 16px 45px; border-radius: 16px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 10px 20px rgba(22,163,74,0.2);">
              ${actionLabel}
            </a>
          </div>
        ` : ''}
      </div>

      <!-- Footer -->
      <div style="padding: 30px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #94a3b8; font-weight: 500;">
          &copy; 2024 AntiPay Ltd. Dhaka, Bangladesh.
        </p>
        <p style="margin: 12px 0 0; font-size: 11px; color: #94a3b8;">
          Questions? Reach out to <a href="mailto:supports.antipay@gmail.com" style="color: #16a34a; text-decoration: none; font-weight: 600;">supports.antipay@gmail.com</a>
        </p>
      </div>
    </div>
  </div>
`;

export async function notifyWelcome(email: string, name: string) {
  const content = `
    Hi <strong>${name}</strong>,<br><br>
    Welcome to the AntiPay ecosystem! We are excited to help you automate your business payments for bKash, Nagad, and Rocket instantly.<br><br>
    Please verify your account identity via the separate link we sent to start your merchant journey.
  `;
  const html = getHtmlLayout("Welcome to the Future of Payments! 👋", content, "Access Merchant Dashboard", "https://antipay.site/dashboard");

  return sendCustomEmail({ to: email, subject: `Welcome to AntiPay, ${name}!`, html });
}

export async function notifyPlanActivation(email: string, planName: string) {
  const content = `
    Success! Your <strong>${planName}</strong> plan is now active.<br><br>
    Your account quotas have been updated instantly. You can now manage brands and connected devices according to your plan limits.
  `;
  const html = getHtmlLayout("Infrastructure Plan Activated! ✨", content, "View Your Subscription", "https://antipay.site/dashboard/subscription");

  return sendCustomEmail({ to: email, subject: `AntiPay: ${planName} Plan Active`, html });
}

export async function notifyPlanExpiration(email: string, planName: string) {
  const content = `
    Urgent: Your <strong>${planName}</strong> subscription has expired.<br><br>
    To maintain real-time verification and prevent node disruption, please renew your plan immediately.
  `;
  const html = getHtmlLayout("Action Required: Plan Expired ⚠️", content, "Renew Subscription Now", "https://antipay.site/dashboard/plans");

  return sendCustomEmail({ to: email, subject: `Urgent: AntiPay Plan Expired`, html });
}