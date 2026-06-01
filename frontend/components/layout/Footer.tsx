import Link from "next/link";
import { Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto bg-white border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-slate-900 mb-1">
              Citron Phase 2 C & D Co-operative Housing Society Limited
            </p>
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-slate-600">
            <a
              href="mailto:office@citronsociety.in"
              className="flex items-center gap-1.5 hover:text-[#175a00] transition-colors"
            >
              <Mail className="h-4 w-4" />
              office@citronsociety.in
            </a>
            <a
              href="tel:+919673639643"
              className="flex items-center gap-1.5 hover:text-[#175a00] transition-colors"
            >
              <Phone className="h-4 w-4" />
              +91 96736 39643
            </a>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <Link
              href="/privacy"
              className="text-slate-500 hover:text-[#175a00] transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-slate-200">|</span>
            <Link
              href="/terms"
              className="text-slate-500 hover:text-[#175a00] transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
