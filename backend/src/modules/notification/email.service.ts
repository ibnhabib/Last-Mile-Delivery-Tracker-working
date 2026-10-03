import { Resend } from 'resend';
import { env } from '../../config/env';
import nodemailer from 'nodemailer';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

// Fallback to Nodemailer if Resend is not configured (e.g., local dev without key)
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    if (resend) {
      // Use Resend
      await resend.emails.send({
        from: 'LastMileUS <onboarding@resend.dev>', // Replace with custom domain in production
        to,
        subject,
        html,
      });
      console.log(`[RESEND SENT] To: ${to}, Subject: ${subject}`);
      return true;
    } else if (env.SMTP_HOST && env.SMTP_PASS) {
      // Fallback to SMTP
      await transporter.sendMail({
        from: env.SMTP_FROM || 'noreply@lastmileus.com',
        to,
        subject,
        html,
      });
      console.log(`[SMTP SENT] To: ${to}, Subject: ${subject}`);
      return true;
    } else {
      console.log(`[EMAIL SKIPPED] No Resend API Key or SMTP configured. Would send to ${to}: ${subject}`);
      return false;
    }
  } catch (error) {
    console.error(`[EMAIL FAILED] To: ${to}, Error:`, error);
    return false;
  }
}