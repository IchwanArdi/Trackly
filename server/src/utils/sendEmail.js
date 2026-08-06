import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendResetPasswordEmail = async (toEmail, resetLink) => {
  try {
    await resend.emails.send({
      from: 'Trackly <onboarding@resend.dev>',
      to: toEmail,
      subject: 'Reset Password Trackly',
      html: `
        <!DOCTYPE html>
        <html>
          <body style="margin:0; padding:0; background-color:#f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding: 40px 16px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px; background-color:#ffffff; border-radius:12px; border:1px solid #e5e5e5; overflow:hidden;">

                    <!-- Header / Logo -->
                    <tr>
                      <td style="padding:32px 32px 0 32px;">
                        <table role="presentation" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width:28px; height:28px; background-color:#F0653E; border-radius:6px; text-align:center; vertical-align:middle;">
                              <span style="color:#ffffff; font-size:14px; font-weight:700; line-height:28px;">T</span>
                            </td>
                            <td style="padding-left:8px; font-size:14px; font-weight:600; color:#0a0a0a;">Trackly</td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:24px 32px 8px 32px;">
                        <h1 style="margin:0 0 12px 0; font-size:18px; font-weight:600; color:#0a0a0a;">
                          Reset password kamu
                        </h1>
                        <p style="margin:0 0 24px 0; font-size:14px; line-height:22px; color:#525252;">
                          Kami menerima permintaan untuk reset password akun Trackly kamu. Klik tombol di bawah untuk membuat password baru. Link ini berlaku selama <strong>1 jam</strong>.
                        </p>
                      </td>
                    </tr>

                    <!-- CTA Button -->
                    <tr>
                      <td style="padding:0 32px 28px 32px;">
                        <table role="presentation" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="background-color:#F0653E; border-radius:8px;">
                              <a href="${resetLink}" target="_blank" style="display:inline-block; padding:11px 22px; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none;">
                                Reset Password
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Fallback link -->
                    <tr>
                      <td style="padding:0 32px 28px 32px; border-bottom:1px solid #e5e5e5;">
                        <p style="margin:0; font-size:12px; line-height:18px; color:#a3a3a3; word-break:break-all;">
                          Kalau tombolnya gak berfungsi, copy-paste link ini ke browser kamu:<br/>
                          <a href="${resetLink}" style="color:#F0653E; text-decoration:underline;">${resetLink}</a>
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding:20px 32px 28px 32px;">
                        <p style="margin:0; font-size:12px; line-height:18px; color:#a3a3a3;">
                          Kalau kamu tidak meminta reset password ini, abaikan saja email ini — password kamu tidak akan berubah.
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error('Detail Error Resend:', JSON.stringify(error, null, 2));
    throw new Error('Failed to send reset password email');
  }
};
