import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Shield, FileText } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-5">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900">
                <span className="hidden sm:inline">Citron Phase - 2</span>
                <span className="sm:hidden">Citron Phase - 2</span>
              </h1>
              <p className="text-xs text-slate-500">Documents Portal</p>
            </div>
          </Link>
          <Link href="/admin/login">
            <Button variant="outline" size="sm" className="gap-2">
              <Shield className="h-4 w-4" />
              Admin
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
