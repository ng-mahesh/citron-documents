"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { Button } from "@/components/ui/Button";
import { AlertCircle, Calendar } from "lucide-react";
import Link from "next/link";
import { theme } from "@/lib/theme";

export const ShareCertificateRegistrationModal: React.FC = () => {
  const targetDate = new Date("2026-01-31T23:59:59");
  const currentDate = new Date();

  const [isOpen, setIsOpen] = useState(() => {
    return currentDate <= targetDate;
  });

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      title={
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 bg-gradient-to-br ${theme.colors.gradients.primary} rounded-xl flex items-center justify-center shadow-lg ${theme.colors.shadows.primary}`}
          >
            <AlertCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Important Notice
            </h2>
            <p className="text-sm text-slate-500">
              Share Certificate Registration
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex gap-3">
            <Calendar className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-slate-700 leading-relaxed">
              <p className="font-semibold text-slate-900 mb-1">
                Dear Resident,
              </p>
              <p className="text-sm">
                Complete your share certificate registration/application before{" "}
                <span className="font-bold text-amber-700">31 Jan 2026</span>.
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700 mb-3">
            Time Remaining:
          </p>
          <CountdownTimer targetDate={targetDate} />
        </div>

        <div className="flex gap-3 pt-2">
          <Link
            href="/share-certificate"
            onClick={handleClose}
            className="flex-1"
          >
            <Button variant="primary" size="lg" className="w-full">
              Proceed to Share Certificate
            </Button>
          </Link>
          <Button variant="outline" size="lg" onClick={handleClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
