
import nodemailer from 'nodemailer';

/**
 * SMTP Configuration optimized for Gmail.
 * Using credentials provided by the user.
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    // Hardcoded as requested because user couldn't set env vars
    user: 'supports.antipay@gmail.com', 
    pass: 'cnmr uxdh kcca xplg', 
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
    console.log('Email sent successfully:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('SMTP Error:', error);
    return { success: false, error };
  }
}
