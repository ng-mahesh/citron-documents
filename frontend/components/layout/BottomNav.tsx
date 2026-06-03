"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Users, FileCheck, Search } from "lucide-react";

const navItems = [
  { href: "/share-certificate", label: "Cert", icon: FileText },
  { href: "/nomination", label: "Nomination", icon: Users },
  { href: "/noc-request", label: "NOC", icon: FileCheck },
  { href: "/status", label: "Track", icon: Search },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white border-t border-slate-200"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 gap-0.5 transition-colors min-h-[44px] relative ${
                isActive
                  ? "text-[#175a00] bg-green-50"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {isActive && (
                <span className="absolute top-1.5 w-1 h-1 rounded-full bg-[#175a00]" />
              )}
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-semibold leading-tight">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
