import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Keep the sender configurable so a verified Resend domain can be swapped
// without editing code. The default matches the production domain.
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Trackly <noreply@trackly.web.id>';

// Used by reminder links. Normalize it once so a trailing slash cannot create
// an accidental double slash in the email URL.
const frontendURL = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');

/**
 * Sends the passwordless login code. The raw code only exists in memory and
 * in this email; the database stores an HMAC hash instead.
 */
export const sendLoginCodeEmail = async (toEmail, code) => {
  if (!resend) {
    console.warn('RESEND_API_KEY is not configured. Skipping login code email.');
    return { ok: false, skipped: true, reason: 'Missing RESEND_API_KEY' };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: 'Your Trackly login code',
      text: [
        `Your Trackly login code is ${code}.`,
        'It expires in 10 minutes and can only be used once.',
        'If you did not request this code, you can safely ignore this email.',
      ].join('\n\n'),
      html: `
        <!DOCTYPE html>
        <html>
          <body style="margin:0; padding:0; background-color:#f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding: 40px 16px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px; background-color:#ffffff; border-radius:12px; border:1px solid #e5e5e5; overflow:hidden;">
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
                    <tr>
                      <td style="padding:24px 32px 8px 32px;">
                        <h1 style="margin:0 0 12px 0; font-size:18px; font-weight:600; color:#0a0a0a;">
                          Your login code
                        </h1>
                        <p style="margin:0 0 20px 0; font-size:14px; line-height:22px; color:#525252;">
                          Enter this code to sign in to Trackly. It expires in <strong>10 minutes</strong>.
                        </p>
                        <div style="padding:18px 20px; background-color:#fff7f3; border:1px solid #ffd9cc; border-radius:10px; text-align:center;">
                          <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size:30px; font-weight:700; letter-spacing:8px; color:#0a0a0a;">
                            ${code}
                          </span>
                        </div>
                        <p style="margin:20px 0 0 0; font-size:13px; line-height:20px; color:#737373;">
                          This code can only be used once. If you did not request it, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:20px 32px 28px 32px; border-top:1px solid #e5e5e5;">
                        <p style="margin:0; font-size:12px; line-height:18px; color:#a3a3a3;">
                          Trackly will never ask you for this code outside the sign-in page.
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

    if (error) {
      throw new Error(error.message || 'Resend rejected the login code email');
    }

    return { ok: true };
  } catch (error) {
    console.error('Detail Error Resend (login code):', JSON.stringify(error, null, 2));
    // The route deletes the unusable code when this throws, so the user can retry.
    throw new Error('Failed to send login code email');
  }
};

export const sendReminderEmail = async (toEmail, userName) => {
  if (!resend) {
    console.warn('RESEND_API_KEY is not configured. Skipping email send.');
    return { ok: false, skipped: true, reason: 'Missing RESEND_API_KEY' };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: 'Jangan lupa log aktivitasmu hari ini!',
      html: `
        <!DOCTYPE html>
        <html>
          <body style="margin:0; padding:0; background-color:#f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding: 40px 16px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px; background-color:#ffffff; border-radius:12px; border:1px solid #e5e5e5; overflow:hidden;">
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
                    <tr>
                      <td style="padding:24px 32px 8px 32px;">
                        <h1 style="margin:0 0 12px 0; font-size:18px; font-weight:600; color:#0a0a0a;">
                          Hai ${userName}, belum ada catatan hari ini 👀
                        </h1>
                        <p style="margin:0 0 24px 0; font-size:14px; line-height:22px; color:#525252;">
                          Jangan sampai kelewat — luangkan waktu sebentar buat catat aktivitasmu hari ini di Trackly.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0 32px 28px 32px;">
                        <table role="presentation" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="background-color:#F0653E; border-radius:8px;">
                              <a href="${frontendURL}/log" target="_blank" style="display:inline-block; padding:11px 22px; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none;">
                                Catat Sekarang
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:20px 32px 28px 32px; border-top:1px solid #e5e5e5;">
                        <p style="margin:0; font-size:12px; line-height:18px; color:#a3a3a3;">
                          Kamu menerima email ini karena mengaktifkan reminder harian di Trackly.
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

    if (error) {
      throw new Error(error.message || 'Resend rejected the reminder email');
    }

    return { ok: true };
  } catch (error) {
    console.error('Detail Error Resend (reminder):', JSON.stringify(error, null, 2));
    // Jangan throw — satu email gagal gak boleh gagalin proses reminder buat user lain
    return { ok: false, error: error.message };
  }
};
