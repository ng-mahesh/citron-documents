"use client";

import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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
  ArrowRight,
} from "lucide-react";
import React from "react";

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

function StatusBadge({ status }: { status: FeatureStatus }) {
  if (status === "deadline-closed") {
    return (
      <span className="absolute top-4 right-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        Closed
      </span>
    );
  }
  if (status === "coming-soon") {
    return (
      <span className="absolute top-4 right-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
        Coming Soon
      </span>
    );
  }
  return null;
}

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
      <div className="cursor-not-allowed h-full">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 h-full flex flex-col opacity-50 pointer-events-none relative">
          <StatusBadge status={status} />
          <div className="h-12 w-12 bg-slate-200 rounded-xl flex items-center justify-center mb-4">
            {icon}
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed flex-grow">
            {description}
          </p>
          <div className="flex items-center gap-1 text-slate-400 font-medium text-sm mt-5">
            {cta} <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={href} className="group h-full">
      <div
        className={`bg-white rounded-2xl p-6 border border-slate-200 hover:border-green-300 hover:shadow-lg transition-all duration-200 h-full flex flex-col relative`}
      >
        {deadlineLabel && (
          <span className="absolute top-4 right-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            Till {deadlineLabel}
          </span>
        )}
        <div
          className={`h-12 w-12 ${theme.iconBg.primary} rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-sm`}
        >
          {icon}
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed flex-grow">
          {description}
        </p>
        <div className="flex items-center gap-1 text-[#175a00] font-semibold text-sm mt-5 group-hover:gap-2 transition-all">
          {cta}{" "}
          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

const features = [
  {
    icon: <CheckCircle className="h-5 w-5 text-white" />,
    title: "Quick & Simple",
    description: "Submit applications without visiting the office",
    color: theme.iconBg.primary,
  },
  {
    icon: <Clock className="h-5 w-5 text-white" />,
    title: "Always Available",
    description: "Access the portal 24/7 from any device",
    color: theme.iconBg.blue,
  },
  {
    icon: <Shield className="h-5 w-5 text-white" />,
    title: "Safe & Secure",
    description: "Your documents are encrypted and protected",
    color: theme.iconBg.purple,
  },
];

const steps = [
  {
    n: "1",
    title: "Fill Details",
    desc: "Complete your application form online",
  },
  { n: "2", title: "Upload Files", desc: "Submit required documents securely" },
  { n: "3", title: "Get Confirmed", desc: "Receive acknowledgement via email" },
  { n: "4", title: "Track Progress", desc: "Monitor your application status" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <ShareCertificateRegistrationModal />
      <Header />

      {/* Hero */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-14 md:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-xs font-semibold text-[#175a00] mb-6">
                <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                Citron Phase 2 — Official Portal
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-5 leading-tight tracking-tight">
                Manage Your Society
                <span
                  className={`block mt-1 bg-gradient-to-r ${theme.colors.gradients.text} bg-clip-text text-transparent`}
                >
                  Documents Online
                </span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Apply for share certificates, register nominations, request NOC
                for flat transfers, and track applications — all from home.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/status"
                  className={`inline-flex items-center gap-2 px-5 h-11 ${theme.button.primary.bg} text-white font-semibold rounded-xl shadow-sm hover:shadow-md ${theme.button.primary.hover} transition-all text-sm`}
                >
                  <Search className="h-4 w-4" />
                  Track Application
                </Link>
                <Link
                  href="/share-certificate"
                  className="inline-flex items-center gap-2 px-5 h-11 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all text-sm"
                >
                  Apply Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="flex justify-center items-center order-1 lg:order-2">
              <div className="relative">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${theme.colors.background.blur} rounded-full blur-3xl opacity-15 scale-110`}
                />
                <div className="relative h-56 w-56 sm:h-72 sm:w-72 md:h-80 md:w-80">
                  <Image
                    src="/logo.png"
                    alt="Citron Society Logo"
                    width={320}
                    height={320}
                    className="rounded-3xl object-contain drop-shadow-xl"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service tiles */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Services</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Select a service to get started
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <FeatureTile
            href="/share-certificate"
            icon={<FileText className="h-6 w-6 text-white" />}
            title="Share Certificate"
            description="Apply for your share certificate with online document submission"
            cta="Apply Now"
            status={shareCertStatus}
            deadline={process.env.NEXT_PUBLIC_FEATURE_SHARE_CERT_DEADLINE}
          />
          <FeatureTile
            href="/nomination"
            icon={<Users className="h-6 w-6 text-white" />}
            title="Nomination Form"
            description="Register your nominees for share certificate inheritance"
            cta="Submit Form"
            status={nominationStatus}
            deadline={process.env.NEXT_PUBLIC_FEATURE_NOMINATION_DEADLINE}
          />
          <FeatureTile
            href="/noc-request"
            icon={<FileCheck className="h-6 w-6 text-white" />}
            title="NOC Request"
            description="Request No Objection Certificate for flat transfer or sale"
            cta="Request NOC"
            status={nocRequestStatus}
            deadline={process.env.NEXT_PUBLIC_FEATURE_NOC_REQUEST_DEADLINE}
          />
          <Link href="/status" className="group h-full">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-green-300 hover:shadow-lg transition-all duration-200 h-full flex flex-col">
              <div
                className={`h-12 w-12 ${theme.iconBg.primary} rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-sm`}
              >
                <Search className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Track Status
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed flex-grow">
                Check real-time status of your submitted applications
              </p>
              <div className="flex items-center gap-1 text-[#175a00] font-semibold text-sm mt-5 group-hover:gap-2 transition-all">
                Track Now{" "}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Features strip */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div
                  className={`h-11 w-11 ${f.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}
                >
                  {f.icon}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">
                    {f.title}
                  </h4>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process steps */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-14">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
          <p className="text-sm text-slate-500 mt-1">
            Four simple steps to complete your application
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div key={step.n} className="relative">
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-6 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-slate-200" />
              )}
              <div className="text-center">
                <div
                  className={`h-12 w-12 bg-gradient-to-br ${theme.colors.gradients.primary} text-white rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-lg shadow-md shadow-green-200/60`}
                >
                  {step.n}
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
