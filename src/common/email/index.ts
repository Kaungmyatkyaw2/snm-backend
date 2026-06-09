import { Resend } from 'resend';

type EmailPayloadType = {
  to: string;
  subject: string;
  text: string;
};

export const sendEmail = async (payload: EmailPayloadType) => {
  const apiKey = process.env.MAIL_RESEND_API;
  const endpoint = process.env.MAIL_ENDPOINT;

  if (!apiKey) {
    throw new Error('MAIL_RESEND_API is not configured.');
  }

  if (!endpoint) {
    throw new Error('MAIL_ENDPOINT is not configured.');
  }

  // Initialize after Nest has loaded environment variables.
  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from: `Shwe Nyar Myay <${endpoint}>`,
    to: payload.to,
    subject: payload.subject,
    html: payload.text,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return {
    success: true,
    message: 'Email sent successfully',
    data,
  };
};
