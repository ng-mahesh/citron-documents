import Link from "next/link";
import { Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto bg-slate-50 border-t border-slate-200 pb-16 lg:pb-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-0 lg:py-10">
        <div className="flex flex-col items-center gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div className="text-center lg:text-left">
            <p className="text-sm font-semibold text-slate-900 leading-snug">
              Citron Phase 2 C &amp; D Co-operative Housing Society Ltd.
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              &copy; {new Date().getFullYear()} All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-5">
            <a
              href="mailto:office@citronsociety.in"
              className="flex items-center gap-1.5 text-slate-600 hover:text-[#175a00] transition-colors"
            >
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm">
                office@citronsociety.in
              </span>
            </a>
            <a
              href="tel:+919673639643"
              className="flex items-center gap-1.5 text-slate-600 hover:text-[#175a00] transition-colors"
            >
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm">+91 96736 39643</span>
            </a>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link
              href="/privacy"
              className="hover:text-[#175a00] transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-slate-300">|</span>
            <Link
              href="/terms"
              className="hover:text-[#175a00] transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
