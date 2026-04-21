
import nodemailer from 'nodemailer';

/**
 * SMTP Configuration for custom emails.
 * Make sure to set these environment variables in your deployment.
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true, 
  auth: {
    user: process.env.SMTP_USER, // Your email
    pass: process.env.SMTP_PASS, // Your app password
  },
});

export async function sendCustomEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  try {
    const info = await transporter.sendMail({
      from: `"AntiPay Support" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent: %s', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Email Error:', error);
    return { success: false, error };
  }
}
