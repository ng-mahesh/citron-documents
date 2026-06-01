"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, FileText, Search } from "lucide-react";
import { theme } from "@/lib/theme";

const navLinks = [
  { href: "/share-certificate", label: "Share Certificate" },
  { href: "/nomination", label: "Nomination" },
  { href: "/noc-request", label: "NOC Request" },
  {
    href: "/status",
    label: "Track Status",
    icon: <Search className="h-3.5 w-3.5" />,
  },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div
              className={`h-9 w-9 ${theme.iconBg.primary} rounded-xl flex items-center justify-center shadow-md ${theme.colors.shadows.primary} flex-shrink-0`}
            >
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-tight">
                Citron Phase - 2
              </p>
              <p className="text-xs text-slate-500 leading-tight">
                Documents Portal
              </p>
            </div>
          </Link>

          {/* Nav links — hidden on mobile */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-green-50 text-[#175a00]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Admin button */}
          <Link
            href="/admin/login"
            className={`flex items-center gap-1.5 px-4 h-9 ${theme.button.primary.bg} text-white text-sm font-semibold rounded-xl shadow-sm ${theme.button.primary.hover} transition-all`}
          >
            <Shield className="h-4 w-4" />
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
