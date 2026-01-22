"use client";

import { Header } from "@/components/layout/Header";
import { Shield, Eye, Lock, FileText, Mail, AlertCircle } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="h-20 w-20 bg-gradient-to-br from-[#175a00] to-[#185900] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-600">Last Updated: January 2025</p>
        </div>

        <div className="space-y-8">
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <FileText className="h-6 w-6 text-[#175a00]" />
              Introduction
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Citron Phase 2 C & D Co-operative Housing Society Limited
              (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed
              to protecting your privacy. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you
              use our document management portal for share certificates,
              nominations, and NOC requests.
            </p>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Eye className="h-6 w-6 text-[#175a00]" />
              Information We Collect
            </h2>
            <div className="space-y-4 text-slate-700">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  Personal Information
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Full name, contact details (email, phone number)</li>
                  <li>
                    Residential address (flat number, wing, society details)
                  </li>
                  <li>
                    Nominee details (name, relationship, contact information)
                  </li>
                  <li>Buyer/Seller information for NOC requests</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Documents</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Identity proof (Aadhaar card, PAN card)</li>
                  <li>Address proof documents</li>
                  <li>Property documents and agreements</li>
                  <li>Photographs and supporting materials</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  Application Data
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Application forms and submitted information</li>
                  <li>Application status and history</li>
                  <li>Payment information (transaction IDs, amounts)</li>
                  <li>Communication records and acknowledgements</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <FileText className="h-6 w-6 text-[#175a00]" />
              How We Use Your Information
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              <li>Processing and managing your applications</li>
              <li>Verifying your identity and eligibility</li>
              <li>
                Generating and issuing documents (share certificates, NOCs)
              </li>
              <li>Communicating application status and updates</li>
              <li>Managing payments and receipts</li>
              <li>Maintaining accurate society records</li>
              <li>Complying with legal and regulatory requirements</li>
              <li>Improving our services and user experience</li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Lock className="h-6 w-6 text-[#175a00]" />
              Data Security
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We implement robust security measures to protect your information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              <li>
                <strong>Encryption:</strong> All data is encrypted in transit
                and at rest using industry-standard protocols
              </li>
              <li>
                <strong>Secure Storage:</strong> Documents are stored securely
                on AWS S3 with access controls
              </li>
              <li>
                <strong>Access Control:</strong> Only authorized personnel can
                access your information
              </li>
              <li>
                <strong>Authentication:</strong> Secure login mechanisms with
                role-based access
              </li>
              <li>
                <strong>Regular Updates:</strong> Security systems are regularly
                updated to protect against threats
              </li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Mail className="h-6 w-6 text-[#175a00]" />
              Information Sharing
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We do not sell, rent, or trade your personal information. We may
              share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              <li>
                <strong>Society Officials:</strong> Authorized committee members
                for application processing
              </li>
              <li>
                <strong>Service Providers:</strong> Third-party services that
                assist in operations (e.g., AWS for hosting, email services)
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law or to
                protect our rights
              </li>
              <li>
                <strong>Business Transfers:</strong> In case of merger,
                acquisition, or sale of assets
              </li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-[#175a00]" />
              Your Rights
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              <li>
                <strong>Access:</strong> Request a copy of your personal
                information
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate
                information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal
                information (subject to legal obligations)
              </li>
              <li>
                <strong>Objection:</strong> Object to processing of your
                personal information
              </li>
              <li>
                <strong>Withdraw Consent:</strong> Withdraw consent where
                processing is based on consent
              </li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Data Retention
            </h2>
            <p className="text-slate-700 leading-relaxed">
              We retain your personal information only as long as necessary for
              the purposes outlined in this policy. For society records and
              compliance with legal requirements, certain information may be
              retained for longer periods as mandated by applicable laws.
            </p>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Changes to This Policy
            </h2>
            <p className="text-slate-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will
              notify you of any material changes by posting the new policy on
              our website and sending you an email notification. Your continued
              use of our services after such changes constitutes acceptance of
              the updated policy.
            </p>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Contact Us
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or your personal information, please contact us:
            </p>
            <div className="bg-gradient-to-br from-green-50 to-slate-50 border border-green-200 rounded-xl p-6">
              <p className="text-slate-900 font-medium mb-2">
                Citron Phase 2 C & D Co-operative Housing Society Limited
              </p>
              <p className="text-slate-700 mb-1">
                <strong>Email:</strong> office@citronsociety.in
              </p>
              <p className="text-slate-700 mb-1">
                <strong>Phone:</strong> +91 9673639643
              </p>
            </div>
          </section>
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-slate-600 mb-2">
            Need help? We&apos;re here for you
          </p>
          <p className="text-sm font-medium text-slate-900">
            office@citronsociety.in • +91 9673639643
          </p>
        </div>
      </div>
    </div>
  );
}
