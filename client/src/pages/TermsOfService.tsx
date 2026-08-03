export function TermsOfService() {
    return (
        <div className="min-h-screen">
            <section className="w-full px-20 py-10 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
                    <p className="text-sm text-neutral-500">Last updated: August 3, 2026</p>
                </div>

                <p>
                    Welcome to Trackly! By accessing or using our website and mobile application, you agree to comply with and be bound by the following Terms of Service. Please read them carefully before using the app.
                </p>

                <div>
                    <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
                    <p>
                        By creating an account or using Trackly in any way, you confirm that you accept these Terms of Service and agree to be bound by them. If you do not agree, please do not use the app.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold">2. Description of Service</h2>
                    <p>
                        Trackly is a personal activity tracking application that allows users to create custom categories and log daily activities to view patterns, streaks, and statistics over time.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold">3. User Accounts</h2>
                    <p>
                        You may create an account using an email and password, or by logging in through a third-party provider such as Facebook. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold">4. User Content</h2>
                    <p>
                        Any data you input into Trackly (categories, activity logs, notes) remains yours. By using the service, you grant us permission to store and process this data solely for the purpose of providing the app's functionality to you.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold">5. Acceptable Use</h2>
                    <p>
                        You agree not to misuse Trackly, including but not limited to: attempting unauthorized access to our systems, interfering with the service's normal operation, or using the app for any unlawful purpose.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold">6. Third-Party Login (Facebook)</h2>
                    <p>
                        If you choose to log in via Facebook, we receive limited profile information (name and email) from Facebook to create or identify your Trackly account. We do not post to your Facebook account or access any other Facebook data.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold">7. Service Availability</h2>
                    <p>
                        We strive to keep Trackly available at all times, but we do not guarantee uninterrupted access. We may modify, suspend, or discontinue any part of the service at any time without prior notice.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold">8. Limitation of Liability</h2>
                    <p>
                        Trackly is provided "as is" without warranties of any kind. We are not liable for any loss of data, indirect damages, or issues arising from your use of the service, to the fullest extent permitted by law.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold">9. Changes to These Terms</h2>
                    <p>
                        We may update these Terms of Service from time to time. Continued use of Trackly after changes are posted constitutes your acceptance of the revised terms.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold">10. Contact Us</h2>
                    <p>
                        If you have any questions about these Terms of Service, please contact us at{" "}
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