"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { storeSocietyToken } from "@/lib/auth";

function SsoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const returnUrl = searchParams.get("returnUrl") || "/share-certificate";
  const [error, setError] = useState<string | null>(
    token ? null : "No authentication token provided."
  );

  useEffect(() => {
    if (!token) return;

    api
      .post("/sso/exchange", { bridgeToken: token })
      .then((res) => {
        const accessToken = res.data?.data?.accessToken;
        if (!accessToken) throw new Error("No access token in response");
        storeSocietyToken(accessToken);
        router.replace(returnUrl);
      })
      .catch(() => {
        setError(
          "Your session link has expired or is invalid. Please return to the Society Management app and try again."
        );
      });
  }, [router, token, returnUrl]);

  const societyUrl =
    process.env.NEXT_PUBLIC_SOCIETY_APP_URL || "https://citronsociety.in";

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Session Error
            </h2>
            <p className="text-slate-600 text-sm mb-6">{error}</p>
            <a
              href={societyUrl}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl px-6 py-3 text-sm transition-colors"
            >
              Return to Society Management
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-green-700 mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Authenticating…</p>
      </div>
    </div>
  );
}

const SsoFallback = () => (
  <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-green-700 mx-auto mb-4"></div>
      <p className="text-slate-600 font-medium">Loading…</p>
    </div>
  </div>
);

export default function SsoPage() {
  return (
    <Suspense fallback={<SsoFallback />}>
      <SsoContent />
    </Suspense>
  );
}
