export function PrivacyPolicy() {
    return (
        <div className="min-h-screen">

            <section className="w-full px-20 py-10 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
                    <p className="text-sm text-neutral-500">Last updated: August 3, 2026</p>
                </div>

                <p>
                    Trackly ("we", "us", or "our") respects your privacy. This Privacy Policy explains what information we collect, how we use it, and the choices you have regarding your data.
                </p>

                <div>
                    <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
                    <p>
                        We collect the following information when you use Trackly:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Your name and email address (provided during registration, or received from Facebook if you log in via Facebook)</li>
                        <li>Activity data you input yourself, such as categories, entries, values, dates, and notes</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
                    <p>
                        We use your information solely to provide the core functionality of Trackly: storing and displaying your activity history, statistics, and progress over time. We do not sell or share your personal data with third parties for advertising purposes.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold">3. Login via Facebook</h2>
                    <p>
                        If you choose to log in using Facebook, we only receive your name and email address to create or identify your Trackly account. We do not post on your behalf or access any other data from your Facebook account.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold">4. Data Storage and Security</h2>
                    <p>
                        Your data is stored securely in our database (PostgreSQL hosted via Supabase) and served through our application hosted on Vercel. We take reasonable technical measures to protect your information from unauthorized access.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold">5. Data Retention</h2>
                    <p>
                        We retain your data for as long as your account remains active. You may request deletion of your account and associated data at any time.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold">6. Your Rights</h2>
                    <p>
                        You have the right to access, correct, or delete your personal data. To request deletion of your account and all associated data, please see our{" "}
                        <a href="/data-deletion" className="underline">
                            Data Deletion Instructions
                        </a>
                        .
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold">7. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. Continued use of Trackly after changes are posted constitutes your acceptance of the revised policy.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold">8. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at{" "}
                        <a href="mailto:your-email@example.com" className="underline">
                            your-email@example.com
                        </a>
                        .
                    </p>
                </div>
            </section>

        </div>
    );
}