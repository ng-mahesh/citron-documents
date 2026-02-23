"use client";

import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { ShareCertificateRegistrationModal } from "@/components/modals/ShareCertificateRegistrationModal";
import { theme } from "@/lib/theme";
import {
  getFeatureStatus,
  formatDeadline,
  type FeatureStatus,
} from "@/lib/featureFlags";
import {
  FileText,
  Users,
  Search,
  CheckCircle,
  Clock,
  FileCheck,
  Shield,
} from "lucide-react";
import React from "react";

// ─── Feature statuses (resolved at runtime from env vars) ──────────────────
const shareCertStatus: FeatureStatus = getFeatureStatus(
  process.env.NEXT_PUBLIC_FEATURE_SHARE_CERT,
  process.env.NEXT_PUBLIC_FEATURE_SHARE_CERT_DEADLINE
);

const nominationStatus: FeatureStatus = getFeatureStatus(
  process.env.NEXT_PUBLIC_FEATURE_NOMINATION,
  process.env.NEXT_PUBLIC_FEATURE_NOMINATION_DEADLINE
);

const nocRequestStatus: FeatureStatus = getFeatureStatus(
  process.env.NEXT_PUBLIC_FEATURE_NOC_REQUEST,
  process.env.NEXT_PUBLIC_FEATURE_NOC_REQUEST_DEADLINE
);

// ─── Reusable disabled tile badge ──────────────────────────────────────────
function StatusBadge({ status }: { status: FeatureStatus }) {
  if (status === "deadline-closed") {
    return (
      <div className="absolute top-4 right-4 bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full">
        Registration Closed
      </div>
    );
  }
  if (status === "coming-soon") {
    return (
      <div className="absolute top-4 right-4 bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full">
        Announcing Soon
      </div>
    );
  }
  return null;
}

// ─── Tile helpers ──────────────────────────────────────────────────────────
interface TileProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  status: FeatureStatus;
  deadline?: string;
}

function FeatureTile({
  href,
  icon,
  title,
  description,
  cta,
  status,
  deadline,
}: TileProps) {
  const deadlineLabel = deadline ? formatDeadline(deadline) : "";

  if (status !== "enabled") {
    return (
      <div className="h-full cursor-not-allowed">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 transition-all duration-300 h-full flex flex-col items-center sm:items-start text-center sm:text-left opacity-50 pointer-events-none relative">
          <StatusBadge status={status} />
          <div className="h-14 w-14 bg-slate-400 rounded-xl flex items-center justify-center mb-5">
            {icon}
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
          <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
            {description}
          </p>
          <div className="flex items-center text-slate-500 font-medium text-sm">
            {cta}
            <span className="inline-block">→</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={href} className="group h-full">
      <div
        className={`bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 ${theme.card.borderHover} hover:shadow-xl ${theme.card.shadowHover} transition-all duration-300 h-full flex flex-col items-center sm:items-start text-center sm:text-left relative`}
      >
        {deadlineLabel && (
          <div className="absolute top-4 right-4 bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
            Till {deadlineLabel}
          </div>
        )}
        <div
          className={`h-14 w-14 ${theme.iconBg.primary} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
        >
          {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
          {description}
        </p>
        <div className="flex items-center text-[#175a00] font-medium text-sm group-hover:gap-2 transition-all">
          {cta}
          <span className="inline-block group-hover:translate-x-1 transition-transform">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <ShareCertificateRegistrationModal />
      <Header />

      {/* Hero Section */}
      <section
        className={`relative overflow-hidden ${theme.colors.background.section}`}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Manage Your Society
                <span
                  className={`block mt-2 bg-gradient-to-r ${theme.colors.gradients.text} bg-clip-text text-transparent`}
                >
                  Documents Online
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed">
                Apply for share certificates, register nominations, request NOC
                for flat transfers, and track applications—all from the comfort
                of your home.
              </p>
            </div>

            {/* Right Side - Logo */}
            <div className="flex justify-center items-center order-1 lg:order-2">
              <div className="relative">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${theme.colors.background.blur} rounded-full blur-3xl opacity-20 scale-110`}
                ></div>
                <div className="relative h-64 w-64 sm:h-80 sm:w-80 md:h-96 md:w-96">
                  <Image
                    src="/logo.png"
                    alt="Citron Society Logo"
                    width={384}
                    height={384}
                    className="rounded-3xl object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Cards */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureTile
            href="/share-certificate"
            icon={<FileText className="h-7 w-7 text-white" />}
            title="Share Certificate"
            description="Apply for your share certificate with online document submission"
            cta="Apply Now"
            status={shareCertStatus}
            deadline={process.env.NEXT_PUBLIC_FEATURE_SHARE_CERT_DEADLINE}
          />

          <FeatureTile
            href="/nomination"
            icon={<Users className="h-7 w-7 text-white" />}
            title="Nomination Form"
            description="Register your nominees for share certificate inheritance"
            cta="Submit Form"
            status={nominationStatus}
            deadline={process.env.NEXT_PUBLIC_FEATURE_NOMINATION_DEADLINE}
          />

          <FeatureTile
            href="/noc-request"
            icon={<FileCheck className="h-7 w-7 text-white" />}
            title="NOC Request"
            description="Request No Objection Certificate for flat transfer or sale"
            cta="Request NOC"
            status={nocRequestStatus}
            deadline={process.env.NEXT_PUBLIC_FEATURE_NOC_REQUEST_DEADLINE}
          />

          {/* Track Status — always enabled */}
          <Link href="/status" className="group h-full">
            <div
              className={`bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 ${theme.card.borderHover} hover:shadow-xl ${theme.card.shadowHover} transition-all duration-300 h-full flex flex-col items-center sm:items-start text-center sm:text-left`}
            >
              <div
                className={`h-14 w-14 ${theme.iconBg.primary} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
              >
                <Search className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Track Status
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
                Check real-time status of your applications
              </p>
              <div className="flex items-center text-[#175a00] font-medium text-sm group-hover:gap-2 transition-all">
                Track Now
                <span className="inline-block group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
          <h3 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div
                className={`h-12 w-12 ${theme.iconBg.primary} rounded-xl flex items-center justify-center mx-auto mb-4`}
              >
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Quick & Simple</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Submit applications without office visits
              </p>
            </div>
            <div className="text-center">
              <div
                className={`h-12 w-12 ${theme.iconBg.primary} rounded-xl flex items-center justify-center mx-auto mb-4`}
              >
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">
                Always Available
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Access portal 24/7 from anywhere
              </p>
            </div>
            <div className="text-center">
              <div
                className={`h-12 w-12 ${theme.iconBg.primary} rounded-xl flex items-center justify-center mx-auto mb-4`}
              >
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Safe & Secure</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Your data is encrypted and protected
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <h3 className="text-3xl font-bold text-slate-900 mb-12 text-center">
          Simple Application Process
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="relative">
            <div className="text-center">
              <div
                className={`h-16 w-16 bg-gradient-to-br ${theme.colors.gradients.primary} text-white rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-2xl shadow-lg ${theme.colors.shadows.primary}`}
              >
                1
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Fill Details</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Complete your application form online
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="text-center">
              <div
                className={`h-16 w-16 bg-gradient-to-br ${theme.colors.gradients.primary} text-white rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-2xl shadow-lg ${theme.colors.shadows.primary}`}
              >
                2
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Upload Files</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Submit required documents securely
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="text-center">
              <div
                className={`h-16 w-16 bg-gradient-to-br ${theme.colors.gradients.primary} text-white rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-2xl shadow-lg ${theme.colors.shadows.primary}`}
              >
                3
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Get Confirmed</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Receive acknowledgement via email
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="text-center">
              <div
                className={`h-16 w-16 bg-gradient-to-br ${theme.colors.gradients.primary} text-white rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-2xl shadow-lg ${theme.colors.shadows.primary}`}
              >
                4
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Track Progress</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Monitor your application status
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-2">
              Need help? We&apos;re here for you
            </p>
            <p className="text-sm font-medium text-slate-900">
              office@citronsociety.in • +91 9673639643
            </p>
            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-slate-600 hover:text-[#175a00] transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-slate-300">|</span>
              <Link
                href="/terms"
                className="text-slate-600 hover:text-[#175a00] transition-colors"
              >
                Terms of Service
              </Link>
            </div>
            <p className="mt-6 text-xs text-slate-500">
              &copy; 2025 Citron Phase 2 C & D Co-operative Housing Society
              Limited. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
