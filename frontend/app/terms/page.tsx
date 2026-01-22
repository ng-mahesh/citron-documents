"use client";

import { Header } from "@/components/layout/Header";
import {
  FileCheck,
  Shield,
  AlertTriangle,
  Users,
  Scale,
  Mail,
} from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="h-20 w-20 bg-gradient-to-br from-[#175a00] to-[#185900] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
            <FileCheck className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-slate-600">Last Updated: January 2025</p>
        </div>

        <div className="space-y-8">
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <FileCheck className="h-6 w-6 text-[#175a00]" />
              Acceptance of Terms
            </h2>
            <p className="text-slate-700 leading-relaxed">
              By accessing and using the Citron Phase 2 C & D Co-operative
              Housing Society Limited document management portal (&quot;the
              Service&quot;), you agree to be bound by these Terms of Service
              (&quot;Terms&quot;). If you do not agree to these Terms, please do
              not use the Service. These Terms constitute a legally binding
              agreement between you and Citron Phase 2 C & D Co-operative
              Housing Society Limited.
            </p>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Users className="h-6 w-6 text-[#175a00]" />
              Eligibility
            </h2>
            <div className="space-y-4 text-slate-700">
              <p className="leading-relaxed">
                To use the Service, you must meet the following criteria:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  Be a member of Citron Phase 2 C & D Co-operative Housing
                  Society
                </li>
                <li>Be at least 18 years of age</li>
                <li>
                  Have the legal capacity to enter into binding agreements
                </li>
                <li>Provide accurate, complete, and current information</li>
                <li>Maintain the security of your account credentials</li>
              </ul>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <FileCheck className="h-6 w-6 text-[#175a00]" />
              Services Provided
            </h2>
            <div className="space-y-4 text-slate-700">
              <p className="leading-relaxed">
                The Service provides the following features:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Share Certificate Application:</strong> Apply for
                  share certificates with online document submission
                </li>
                <li>
                  <strong>Nomination Form:</strong> Register nominees for share
                  certificate inheritance
                </li>
                <li>
                  <strong>NOC Request:</strong> Request No Objection Certificate
                  for flat transfer or sale
                </li>
                <li>
                  <strong>Status Tracking:</strong> Monitor the real-time status
                  of your applications
                </li>
              </ul>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Shield className="h-6 w-6 text-[#175a00]" />
              User Responsibilities
            </h2>
            <div className="space-y-4 text-slate-700">
              <p className="leading-relaxed">
                As a user of the Service, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Provide only accurate and truthful information</li>
                <li>
                  Submit genuine and valid documents as required for each
                  application
                </li>
                <li>Maintain confidentiality of your account credentials</li>
                <li>
                  Not share your account with others or allow unauthorized
                  access
                </li>
                <li>
                  Notify us immediately of any unauthorized use of your account
                </li>
                <li>Use the Service only for legitimate purposes</li>
                <li>
                  Not attempt to circumvent any security measures or technical
                  limitations
                </li>
                <li>
                  Not use the Service for any illegal or prohibited activities
                </li>
              </ul>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-[#175a00]" />
              Prohibited Activities
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              You are strictly prohibited from:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              <li>Submitting false, misleading, or fraudulent information</li>
              <li>Uploading fake or forged documents</li>
              <li>Impersonating any person or entity</li>
              <li>Interfering with or disrupting the Service</li>
              <li>Accessing the Service through unauthorized means</li>
              <li>
                Reverse engineering or attempting to extract the source code
              </li>
              <li>
                Using automated tools to access the Service (bots, scrapers,
                etc.)
              </li>
              <li>
                Violating any applicable local, state, national, or
                international law
              </li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <FileCheck className="h-6 w-6 text-[#175a00]" />
              Application Process
            </h2>
            <div className="space-y-4 text-slate-700">
              <p className="leading-relaxed">
                The application process includes:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  Online submission of application forms with required details
                </li>
                <li>Upload of supporting documents in specified formats</li>
                <li>Review and verification by society officials</li>
                <li>
                  Approval or rejection based on society rules and regulations
                </li>
                <li>Issuance of documents upon approval</li>
              </ul>
              <p className="leading-relaxed mt-4">
                Processing times may vary depending on the type of application
                and completeness of submitted documents. Typical processing time
                is 7-10 business days.
              </p>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Scale className="h-6 w-6 text-[#175a00]" />
              Fees and Payments
            </h2>
            <div className="space-y-4 text-slate-700">
              <p className="leading-relaxed">
                <strong>NOC Processing Fee:</strong> A non-refundable processing
                fee of ₹26,000 applies to NOC requests. Payment details and
                instructions will be provided during the application process.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Fees are subject to change with prior notice</li>
                <li>All payments must be made through approved channels</li>
                <li>Receipts will be provided for all successful payments</li>
                <li>Fees are non-refundable once processing has begun</li>
              </ul>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Shield className="h-6 w-6 text-[#175a00]" />
              Privacy and Data Protection
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Your use of the Service is also governed by our Privacy Policy,
              which explains how we collect, use, and protect your personal
              information. By using the Service, you consent to the collection
              and use of your information as described in the Privacy Policy.
            </p>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-[#175a00]" />
              Disclaimer of Warranties
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              The Service is provided on an &quot;AS IS&quot; and &quot;AS
              AVAILABLE&quot; basis. We make no representations or warranties of
              any kind, express or implied, including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              <li>Uninterrupted or error-free operation of the Service</li>
              <li>Accuracy or completeness of information</li>
              <li>Results obtained from the use of the Service</li>
              <li>Security or privacy of data transmitted</li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Limitation of Liability
            </h2>
            <p className="text-slate-700 leading-relaxed">
              To the maximum extent permitted by law, Citron Phase 2 C & D
              Co-operative Housing Society Limited shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages,
              including but not limited to loss of profits, data, use, goodwill,
              or other intangible losses, resulting from your use of the
              Service.
            </p>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-[#175a00]" />
              Indemnification
            </h2>
            <p className="text-slate-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Citron Phase 2 C
              & D Co-operative Housing Society Limited, its officers, directors,
              employees, and agents from any claims, damages, liabilities,
              costs, and expenses arising from your use of the Service or
              violation of these Terms.
            </p>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Modification of Terms
            </h2>
            <p className="text-slate-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will
              notify users of material changes by posting the updated Terms on
              our website and sending email notifications. Your continued use of
              the Service after such modifications constitutes acceptance of the
              updated Terms.
            </p>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Termination
            </h2>
            <p className="text-slate-700 leading-relaxed">
              We reserve the right to suspend or terminate your access to the
              Service at our sole discretion, without prior notice, for
              violation of these Terms or any other reason. Upon termination,
              your right to use the Service will immediately cease.
            </p>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Governing Law
            </h2>
            <p className="text-slate-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with
              the laws of India. Any disputes arising under these Terms shall be
              subject to the exclusive jurisdiction of the courts in
              [City/State], India.
            </p>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Mail className="h-6 w-6 text-[#175a00]" />
              Contact Us
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              If you have any questions, concerns, or requests regarding these
              Terms of Service, please contact us:
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
