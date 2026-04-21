
import nodemailer from 'nodemailer';

/**
 * SMTP Configuration optimized for Gmail.
 * Using credentials from environment variables for security.
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, 
  auth: {
    user: process.env.SMTP_USER || 'supports.antipay@gmail.com', 
    // Gmail app passwords are 16 characters. We remove any spaces provided in the env.
    pass: (process.env.SMTP_PASS || 'nynl muik mktr yyyk').replace(/\s+/g, ''), 
  },
});

export async function sendCustomEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  try {
    const info = await transporter.sendMail({
      from: `"AntiPay Support" <${process.env.SMTP_USER || 'supports.antipay@gmail.com'}>`,
      to,
      subject,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    // Log detailed error to server console for debugging
    console.error('CRITICAL SMTP ERROR:', error.message || error);
    return { success: false, error: error.message || 'SMTP Authentication Failed' };
  }
}
