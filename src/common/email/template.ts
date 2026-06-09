type OtpTemplateParams = {
  otp: string;
  recipientName?: string;
  expiresInMinutes?: number;
  appUrl?: string;
};

export const buildOtpEmailTemplate = ({
  otp,
  recipientName,
  expiresInMinutes = 10,
  appUrl = '#',
}: OtpTemplateParams) => {
  const greeting = recipientName ? `Hi ${recipientName},` : 'Hi there,';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Shwe Nyar Myay - OTP Verification</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f7fb; font-family: 'Segoe UI', Arial, sans-serif; color:#1f2a37;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f7fb; padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="width:600px; max-width:92%; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 8px 24px rgba(31,42,55,0.08);">
            <tr>
              <td style="background:linear-gradient(135deg,#8346FF,#a472ff); padding:28px 32px;">
                <div style="font-size:20px; font-weight:700; color:#ffffff; letter-spacing:0.4px;">Shwe Nyar Myay</div>
                <div style="font-size:14px; color:#e7f3ff; margin-top:6px;">Secure sign-in verification</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <div style="font-size:16px; line-height:1.6;">${greeting}</div>
                <div style="font-size:18px; font-weight:600; margin:12px 0 6px;">Your one-time password is:</div>
                <div style="font-size:32px; font-weight:700; letter-spacing:6px; color:#8346FF; background:#f5f0ff; padding:16px 20px; display:inline-block; border-radius:12px; margin:12px 0 20px;">${otp}</div>
                <div style="font-size:14px; color:#4b5563; line-height:1.6;">
                  This code expires in ${expiresInMinutes} minutes. If you did not request this code, you can ignore this email.
                </div>
                <div style="margin-top:26px;">
                  <a href="${appUrl}" style="display:inline-block; background-color:#8346FF; color:#ffffff; text-decoration:none; padding:12px 20px; border-radius:10px; font-weight:600;">Open Shwe Nyar Myay</a>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px; background-color:#f8fafc; font-size:12px; color:#6b7280; line-height:1.6;">
                Need help? Contact support from the app. This is an automated message; please do not reply.
              </td>
            </tr>
          </table>
          <div style="font-size:12px; color:#9ca3af; margin-top:16px;">Shwe Nyar Myay</div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};
