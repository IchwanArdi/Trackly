# Trackly Privacy Policy

Last updated: November 2026 · Trackly Data Governance

Trackly is committed to providing a calm, private activity-tracking environment. This Privacy Policy outlines what information we store, how it is secured, and your rights over your personal history.

## 01. Information We Collect

We collect the minimum necessary information to provide personal habit tracking:

- Account identifiers: your name and email address. Email sign-in is verified with a one-time code; Google Sign-In provides your basic profile.
- Activity history: categories, entries, numeric values, completion logs, and personal notes.
- Technical data: aggregate analytics about how the website is used, described in section 04.

## 02. How We Use Your Information

We use your data solely to calculate statistics, streaks, and heatmap charts for your personal workspace, to authenticate you, and to keep the service reliable. We never sell, rent, or trade personal data to third parties or advertising networks.

## 03. Passwordless Sign-In & Google OAuth

Trackly does not use passwords for authentication. You can sign in with a six-digit code sent to your email or with Google OAuth. Email codes expire after 10 minutes, can be used once, and are stored only as a keyed hash.

When you use Google Sign-In, we receive your basic profile (name and email) to authorize your account. We request no additional Google scopes. A Google account is linked to an existing Trackly account only when Google confirms that the email address is verified.

## 04. Analytics & Cookies

We use Google Analytics 4 to understand aggregate usage and improve the product. It may set first-party cookies such as `_ga` and collect the page path, device/browser information, approximate region, and interaction events such as calls-to-action.

Query strings are removed before analytics events are sent, so sign-in codes and email addresses do not appear in Google Analytics. We do not send habit entries, notes, or account identifiers to Google Analytics.

You can limit analytics with browser privacy settings or the [Google Analytics Opt-out Browser Add-on](https://tools.google.com/dlpage/gaoptout).

## 05. Data Storage & Security

Data is stored in PostgreSQL database instances hosted via Supabase, served securely through Vercel over TLS. Passwords are not used for authentication; password hashes from before the passwordless migration are retained only for rollback and are never used to sign in. One-time login codes are stored only as HMAC hashes with a short expiry, and session tokens expire after seven days.

## 06. Data Retention & Control

Your records remain active for as long as your account exists. You maintain full rights to export your data or delete your account permanently at any time.

## 07. Your Rights & Data Deletion

You have full rights to request complete deletion of your account and logs. Visit our [Data Deletion Instructions](https://tracklyid.vercel.app/data-deletion) for step-by-step guidance.

## Contact & Inquiries

For any questions regarding privacy or data handling, contact [ichwanpwt22@gmail.com](mailto:ichwanpwt22@gmail.com).

---

- [Trackly home](https://tracklyid.vercel.app/)
- [Terms of Service](https://tracklyid.vercel.app/terms-of-service)
- [Help Center](https://tracklyid.vercel.app/help)
