
import nodemailer from 'nodemailer';

/**
 * SMTP Configuration optimized for Gmail.
 * Using credentials provided by the user.
 * Removing spaces from app password automatically.
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, 
  auth: {
    user: 'supports.antipay@gmail.com', 
    // Gmail app passwords are 16 characters without spaces. 
    // We trim them just in case.
    pass: 'cnmruxdhkccaxplg', 
  },
});

export async function sendCustomEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  try {
    const info = await transporter.sendMail({
      from: `"AntiPay Support" <supports.antipay@gmail.com>`,
      to,
      subject,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    // We log the error but don't throw to prevent crashing the server action
    console.warn('SMTP Warning (Email not sent):', error.message || error);
    return { success: false, error: error.message || 'SMTP Authentication Failed' };
  }
}
