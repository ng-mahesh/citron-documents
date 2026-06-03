"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSocietyUser } from "@/lib/auth";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FileUpload } from "@/components/forms/FileUpload";
import { nocRequestAPI, uploadAPI } from "@/lib/api";
import { NocType } from "@/lib/types";
import { CheckCircle, Download, Info } from "lucide-react";
import { InlineLoader } from "@/components/ui/Loader";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { theme } from "@/lib/theme";
import { ToastContainer } from "@/components/ui/Toast";
import type { ToastType } from "@/components/ui/Toast";
import {
  NOC_TYPE_CONFIGS,
  NOC_TYPE_OPTIONS,
  getDocumentLabel,
} from "@/lib/noc-type-config";

export default function NocRequestPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    // Seller Information
    sellerName: "",
    sellerEmail: "",
    sellerMobileNumber: "",
    sellerAlternateMobile: "",
    flatNumber: "",
    wing: "" as "C" | "D" | "",

    // NOC Type
    nocType: "" as NocType | "",
    purposeDescription: "", // For "Other Purpose"
    expectedTransferDate: "",

    // Buyer Information (conditional)
    buyerName: "",
    buyerMobileNumber: "",
    buyerEmail: "",

    // Declaration
    digitalSignature: "",
    declarationAccepted: false,
    isResaleProperty: false,
  });

  const [nocFiles, setNocFiles] = useState<{
    agreementFile?: File;
    shareCertificateFile?: File;
    maintenanceReceipt1File?: File;
    maintenanceReceipt2File?: File;
    maintenanceReceipt3File?: File;
    buyerAadhaarFile?: File;
    buyerPanFile?: File;
    identityProofFile?: File;
    currentElectricityBillFile?: File;
    supportingDocsFile?: File;
  }>({});

  const docFieldToFileKey: Record<string, keyof typeof nocFiles> = {
    agreementDocument: "agreementFile",
    shareCertificateDocument: "shareCertificateFile",
    maintenanceReceiptDocument: "maintenanceReceipt1File",
    buyerAadhaarDocument: "buyerAadhaarFile",
    identityProofDocument: "identityProofFile",
    currentElectricityBillDocument: "currentElectricityBillFile",
    supportingDocuments: "supportingDocsFile",
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [acknowledgementNumber, setAcknowledgementNumber] = useState("");
  const [paymentDetails, setPaymentDetails] = useState<{
    nocFees: number;
    transferFees: number;
    totalAmount: number;
  } | null>(null);
  const [checkingPending, setCheckingPending] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  // Auth guard — redirect to society app if no valid session
  useEffect(() => {
    if (getSocietyUser()) return;
    const base =
      process.env.NEXT_PUBLIC_SOCIETY_APP_URL ?? "http://localhost:3002";
    window.location.href = `${base}/documents?returnUrl=/noc-request`;
  }, []);

  // Pre-fill from society management SSO session
  useEffect(() => {
    const user = getSocietyUser();
    if (!user) return;
    const mobile = user.phone?.replace(/^\+?91/, "") ?? "";
    setFormData((prev) => ({
      ...prev,
      sellerName: prev.sellerName || user.fullName || "",
      sellerEmail: prev.sellerEmail || user.email || "",
      sellerMobileNumber:
        prev.sellerMobileNumber || (/^[6-9]\d{9}$/.test(mobile) ? mobile : ""),
      flatNumber: prev.flatNumber || user.unitNumber || "",
      wing: prev.wing || (user.wing as "C" | "D" | "") || "",
    }));
  }, []);

  // Computed values based on selected NOC type
  const currentTypeConfig = formData.nocType
    ? NOC_TYPE_CONFIGS[formData.nocType]
    : null;
  const requiresBuyerInfo = currentTypeConfig?.requiresBuyerInfo || false;
  const requiresPurposeDescription =
    currentTypeConfig?.requiresPurposeDescription || false;
  const totalFees = currentTypeConfig
    ? currentTypeConfig.nocFees + currentTypeConfig.transferFees
    : 0;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    // For flat number, only allow integer numbers
    if (name === "flatNumber") {
      if (value !== "" && !/^\d+$/.test(value)) {
        return; // Don't update if not a valid integer
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Remove the error key entirely so isFormValid() doesn't see ghost empty-string errors
    if (errors[name]) {
      setErrors((prev) => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  // Real-time validation on field blur — shows errors immediately so users know what to fix
  const handleFieldBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let msg = "";

    switch (name) {
      case "sellerEmail":
        if (!value.trim()) msg = "Seller email is required";
        else if (!/^\S+@\S+\.\S+$/.test(value))
          msg = "Please enter a valid email";
        break;
      case "sellerMobileNumber":
        if (!value.trim()) msg = "Mobile number is required";
        else if (!/^[6-9]\d{9}$/.test(value))
          msg = "Please enter a valid 10-digit mobile number";
        break;
      case "sellerAlternateMobile":
        if (value.trim() && !/^[6-9]\d{9}$/.test(value))
          msg = "Please enter a valid 10-digit mobile number";
        break;
      case "buyerEmail":
        if (requiresBuyerInfo) {
          if (!value.trim()) msg = "Buyer email is required";
          else if (!/^\S+@\S+\.\S+$/.test(value))
            msg = "Please enter a valid buyer email";
        }
        break;
      case "buyerMobileNumber":
        if (requiresBuyerInfo) {
          if (!value.trim()) msg = "Buyer mobile number is required";
          else if (!/^[6-9]\d{9}$/.test(value))
            msg = "Please enter a valid 10-digit buyer mobile number";
        }
        break;
    }

    setErrors((prev) => {
      if (msg) return { ...prev, [name]: msg };
      const { [name]: _, ...rest } = prev;
      return rest;
    });
  };

  const checkPendingRequest = async () => {
    if (!formData.flatNumber || !formData.wing) {
      return;
    }

    if (!/^\d+$/.test(formData.flatNumber)) {
      return;
    }

    setCheckingPending(true);
    try {
      const response = await nocRequestAPI.checkPending(
        formData.flatNumber,
        formData.wing
      );
      if (response.data.data.exists) {
        setErrors((prev) => ({
          ...prev,
          wing: response.data.data.message,
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.wing;
          return newErrors;
        });
      }
    } catch (error) {
      console.error("Error checking pending request:", error);
    } finally {
      setCheckingPending(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Seller Information (always required)
    if (!formData.sellerName.trim())
      newErrors.sellerName = "Seller name is required";
    if (!formData.sellerEmail.trim())
      newErrors.sellerEmail = "Seller email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.sellerEmail))
      newErrors.sellerEmail = "Please enter a valid email";
    if (!formData.sellerMobileNumber.trim())
      newErrors.sellerMobileNumber = "Mobile number is required";
    else if (!/^[6-9]\d{9}$/.test(formData.sellerMobileNumber))
      newErrors.sellerMobileNumber =
        "Please enter a valid 10-digit mobile number";
    if (
      formData.sellerAlternateMobile.trim() &&
      !/^[6-9]\d{9}$/.test(formData.sellerAlternateMobile)
    )
      newErrors.sellerAlternateMobile =
        "Please enter a valid 10-digit mobile number";
    if (!formData.flatNumber.trim())
      newErrors.flatNumber = "Flat number is required";
    else if (!/^\d+$/.test(formData.flatNumber))
      newErrors.flatNumber = "Flat number must contain only numbers";
    if (!formData.wing) newErrors.wing = "Wing is required";

    // NOC Type
    if (!formData.nocType) newErrors.nocType = "NOC type is required";

    // Conditional: Buyer Information (only for Flat Transfer)
    if (requiresBuyerInfo) {
      if (!formData.buyerName.trim())
        newErrors.buyerName = "Buyer name is required";
      if (!formData.buyerEmail.trim())
        newErrors.buyerEmail = "Buyer email is required";
      else if (!/^\S+@\S+\.\S+$/.test(formData.buyerEmail))
        newErrors.buyerEmail = "Please enter a valid buyer email";
      if (!formData.buyerMobileNumber.trim())
        newErrors.buyerMobileNumber = "Buyer mobile number is required";
      else if (!/^[6-9]\d{9}$/.test(formData.buyerMobileNumber))
        newErrors.buyerMobileNumber =
          "Please enter a valid 10-digit buyer mobile number";
    }

    // Conditional: Purpose Description (only for Other)
    if (requiresPurposeDescription && !formData.purposeDescription.trim()) {
      newErrors.purposeDescription = "Purpose description is required";
    }

    // Conditional: Expected Transfer Date (only for Flat Transfer)
    if (
      formData.nocType === "Flat Transfer/Sale/Purchase" &&
      !formData.expectedTransferDate
    ) {
      newErrors.expectedTransferDate = "Expected transfer date is required";
    }

    // Type-specific document validation
    if (currentTypeConfig) {
      currentTypeConfig.requiredDocuments.forEach((docField) => {
        const fileKey = docFieldToFileKey[docField];
        if (!fileKey || !nocFiles[fileKey]) {
          newErrors[docField] = `${getDocumentLabel(docField)} is required`;
        }
      });
    }

    // Declaration
    if (!formData.digitalSignature.trim())
      newErrors.digitalSignature = "Digital signature is required";
    if (!formData.declarationAccepted)
      newErrors.declarationAccepted = "You must accept the declaration";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    // Use .some(Boolean) so ghost empty-string error keys don't block submission
    if (Object.values(errors).some(Boolean)) return false;

    // Seller information (always required)
    if (!formData.sellerName.trim()) return false;
    if (
      !formData.sellerEmail.trim() ||
      !/^\S+@\S+\.\S+$/.test(formData.sellerEmail)
    )
      return false;
    if (
      !formData.sellerMobileNumber.trim() ||
      !/^[6-9]\d{9}$/.test(formData.sellerMobileNumber)
    )
      return false;
    if (!formData.flatNumber.trim() || !/^\d+$/.test(formData.flatNumber))
      return false;
    if (!formData.wing) return false;

    // NOC Type
    if (!formData.nocType) return false;

    // Conditional: Buyer Information
    if (requiresBuyerInfo) {
      if (!formData.buyerName.trim()) return false;
      if (
        !formData.buyerEmail.trim() ||
        !/^\S+@\S+\.\S+$/.test(formData.buyerEmail)
      )
        return false;
      if (
        !formData.buyerMobileNumber.trim() ||
        !/^[6-9]\d{9}$/.test(formData.buyerMobileNumber)
      )
        return false;
    }

    // Conditional: Purpose Description
    if (requiresPurposeDescription && !formData.purposeDescription.trim()) {
      return false;
    }

    // Conditional: Expected Transfer Date
    if (
      formData.nocType === "Flat Transfer/Sale/Purchase" &&
      !formData.expectedTransferDate
    ) {
      return false;
    }

    // Type-specific document validation
    if (currentTypeConfig) {
      for (const docField of currentTypeConfig.requiredDocuments) {
        const fileKey = docFieldToFileKey[docField];
        if (!fileKey || !nocFiles[fileKey]) return false;
      }
    }

    // Declaration
    if (!formData.digitalSignature.trim()) return false;
    if (!formData.declarationAccepted) return false;

    return true;
  };

  const uploadNocFile = async (file: File, documentType: string) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("flatNumber", formData.flatNumber);
    fd.append("documentType", documentType);
    fd.append("fullName", formData.sellerName);
    const response = await uploadAPI.upload(fd);
    return response.data.data || response.data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const [
        agreementMeta,
        shareCertMeta,
        receipt1Meta,
        receipt2Meta,
        receipt3Meta,
        buyerAadhaarMeta,
        buyerPanMeta,
        identityProofMeta,
        electricityBillMeta,
        supportingDocsMeta,
      ] = await Promise.all([
        nocFiles.agreementFile
          ? uploadNocFile(nocFiles.agreementFile, "agreement")
          : Promise.resolve(undefined),
        nocFiles.shareCertificateFile
          ? uploadNocFile(nocFiles.shareCertificateFile, "share-certificate")
          : Promise.resolve(undefined),
        nocFiles.maintenanceReceipt1File
          ? uploadNocFile(
              nocFiles.maintenanceReceipt1File,
              "maintenance-receipt"
            )
          : Promise.resolve(undefined),
        nocFiles.maintenanceReceipt2File
          ? uploadNocFile(
              nocFiles.maintenanceReceipt2File,
              "maintenance-receipt-2"
            )
          : Promise.resolve(undefined),
        nocFiles.maintenanceReceipt3File
          ? uploadNocFile(
              nocFiles.maintenanceReceipt3File,
              "maintenance-receipt-3"
            )
          : Promise.resolve(undefined),
        nocFiles.buyerAadhaarFile
          ? uploadNocFile(nocFiles.buyerAadhaarFile, "buyer-aadhaar")
          : Promise.resolve(undefined),
        nocFiles.buyerPanFile
          ? uploadNocFile(nocFiles.buyerPanFile, "buyer-pan")
          : Promise.resolve(undefined),
        nocFiles.identityProofFile
          ? uploadNocFile(nocFiles.identityProofFile, "identity-proof")
          : Promise.resolve(undefined),
        nocFiles.currentElectricityBillFile
          ? uploadNocFile(
              nocFiles.currentElectricityBillFile,
              "electricity-bill"
            )
          : Promise.resolve(undefined),
        nocFiles.supportingDocsFile
          ? uploadNocFile(nocFiles.supportingDocsFile, "supporting-docs")
          : Promise.resolve(undefined),
      ]);

      const submissionData = {
        ...formData,
        agreementDocument: agreementMeta,
        shareCertificateDocument: shareCertMeta,
        maintenanceReceiptDocument: receipt1Meta,
        maintenanceReceipt2Document: receipt2Meta,
        maintenanceReceipt3Document: receipt3Meta,
        buyerAadhaarDocument: buyerAadhaarMeta,
        buyerPanDocument: buyerPanMeta,
        identityProofDocument: identityProofMeta,
        currentElectricityBillDocument: electricityBillMeta,
        supportingDocuments: supportingDocsMeta,
      };

      const response = await nocRequestAPI.create(submissionData);

      if (response.data.success) {
        setAcknowledgementNumber(response.data.data.acknowledgementNumber);
        setPaymentDetails(response.data.data.paymentDetails);
        setSuccess(true);
      }
    } catch (error) {
      console.error("Error submitting NOC request:", error);
      const err = error as { response?: { data?: { message?: string } } };
      setToast({
        message:
          err.response?.data?.message ||
          "Failed to submit NOC request. Please try again.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!acknowledgementNumber) return;

    try {
      const response = await nocRequestAPI.downloadPdf(acknowledgementNumber);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `NOC_Request_${acknowledgementNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      setToast({
        message: "Failed to download PDF. Please try again.",
        type: "error",
      });
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl px-5 py-8 sm:p-10 text-center">
            <div
              className={`h-20 w-20 ${theme.states.success.bg} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${theme.states.success.shadow}`}
            >
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Successfully Submitted!
            </h2>
            <p className="text-slate-600 mb-6">Your acknowledgement number:</p>
            <div
              className={`${theme.status.approved.bg} border-2 ${theme.status.approved.border} rounded-xl p-5 mb-8`}
            >
              <p
                className={`text-xl sm:text-3xl font-bold ${theme.status.approved.text} tracking-wide`}
              >
                {acknowledgementNumber}
              </p>
            </div>

            {paymentDetails && (
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-left">
                    <h3 className="text-base font-bold text-gray-900 mb-2">
                      Payment Required
                    </h3>
                    <div className="space-y-1.5 bg-white rounded-lg p-3 mb-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">NOC Fees:</span>
                        <span className="font-bold text-gray-900">
                          ₹{paymentDetails.nocFees}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Transfer Fees:</span>
                        <span className="font-bold text-gray-900">
                          ₹{paymentDetails.transferFees}
                        </span>
                      </div>
                      <div className="border-t border-yellow-300 pt-1.5 flex justify-between items-center">
                        <span className="font-bold text-gray-900">
                          Total Amount:
                        </span>
                        <span
                          className={`font-bold ${theme.status.approved.text} text-lg`}
                        >
                          ₹{paymentDetails.totalAmount}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-700 bg-yellow-100/50 p-2 rounded">
                      Payment instructions will be sent to your email shortly.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-sm text-slate-600 mb-8 leading-relaxed">
              Save this number for tracking. A confirmation email has been sent
              to your inbox.
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={handleDownloadPdf} className="w-full gap-2">
                <Download className="h-5 w-5" />
                Download Application Form
              </Button>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="flex-1 sm:flex-initial"
                >
                  Home
                </Button>
                <Button
                  onClick={() => router.push("/status")}
                  variant="outline"
                  className="flex-1 sm:flex-initial"
                >
                  Track Status
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1 sm:flex-initial"
                >
                  Submit Another
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-16 lg:pb-0">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            NOC Request & Flat Transfer
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Submit your No Objection Certificate request for flat ownership
            transfer
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seller Information Section */}
          <Card>
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Seller / Owner Information
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="sellerName"
                value={formData.sellerName}
                onChange={handleInputChange}
                error={errors.sellerName}
                placeholder="Enter full name"
                required
              />
              <Input
                label="Email Address"
                name="sellerEmail"
                type="email"
                value={formData.sellerEmail}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={errors.sellerEmail}
                placeholder="Enter email address"
                required
              />
              <Input
                label="Mobile Number (WhatsApp)"
                name="sellerMobileNumber"
                value={formData.sellerMobileNumber}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={errors.sellerMobileNumber}
                placeholder="9876543210"
                required
              />
              <Input
                label="Alternate Mobile Number (Optional)"
                name="sellerAlternateMobile"
                value={formData.sellerAlternateMobile}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={errors.sellerAlternateMobile}
                placeholder="9876543210"
              />
              <Select
                label="Wing"
                name="wing"
                value={formData.wing}
                onChange={handleInputChange}
                onBlur={checkPendingRequest}
                error={errors.wing}
                helperText={
                  checkingPending ? (
                    <span className="flex items-center gap-2 text-blue-600">
                      <InlineLoader className="h-4 w-4" />
                      Checking for pending NOC requests...
                    </span>
                  ) : undefined
                }
                options={[
                  { value: "C", label: "C" },
                  { value: "D", label: "D" },
                ]}
                required
              />
              <Input
                label="Flat Number"
                name="flatNumber"
                type="text"
                inputMode="numeric"
                value={formData.flatNumber}
                onChange={handleInputChange}
                onBlur={checkPendingRequest}
                error={errors.flatNumber}
                placeholder="e.g., 302"
                required
              />
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isResaleProperty"
                    checked={formData.isResaleProperty}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Resale Property{" "}
                    <span className="text-slate-500 font-normal">
                      (Check if this is a resale flat)
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </Card>

          {/* NOC Type & Details Section */}
          <Card>
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                NOC Type & Details
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <Select
                label="NOC Type"
                name="nocType"
                value={formData.nocType}
                onChange={handleInputChange}
                error={errors.nocType}
                options={[...NOC_TYPE_OPTIONS]}
                required
              />

              {/* Conditional: Purpose Description for "Other" type */}
              {requiresPurposeDescription && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Purpose Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="purposeDescription"
                    value={formData.purposeDescription}
                    onChange={handleInputChange}
                    placeholder="Please describe the purpose of your NOC request in detail..."
                    rows={4}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-base sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 hover:border-slate-400 transition-all min-h-[110px] resize-y"
                  />
                  {errors.purposeDescription && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.purposeDescription}
                    </p>
                  )}
                </div>
              )}

              {/* Conditional: Expected Transfer Date (only for Flat Transfer) */}
              {formData.nocType === "Flat Transfer/Sale/Purchase" && (
                <Input
                  label="Expected Transfer Date"
                  name="expectedTransferDate"
                  type="date"
                  value={formData.expectedTransferDate}
                  onChange={handleInputChange}
                  error={errors.expectedTransferDate}
                  required
                />
              )}
            </div>
          </Card>

          {/* Buyer Information Section - Only show for Flat Transfer */}
          {requiresBuyerInfo && (
            <Card>
              <div className="mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Buyer Information
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Buyer Full Name"
                  name="buyerName"
                  value={formData.buyerName}
                  onChange={handleInputChange}
                  error={errors.buyerName}
                  placeholder="Enter buyer full name"
                  required
                />
                <Input
                  label="Buyer Mobile Number"
                  name="buyerMobileNumber"
                  value={formData.buyerMobileNumber}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={errors.buyerMobileNumber}
                  placeholder="9876543210"
                  required
                />
                <Input
                  label="Buyer Email Address"
                  name="buyerEmail"
                  type="email"
                  value={formData.buyerEmail}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={errors.buyerEmail}
                  placeholder="Enter buyer email address"
                  required
                />
              </div>
            </Card>
          )}

          {/* Document Upload Section - Dynamic based on NOC type */}
          {formData.nocType && currentTypeConfig && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-slate-200">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Required Documents
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Upload clear copies in PDF or JPEG format (max 2MB each)
                </p>
              </div>
              <div className="px-4 py-5 sm:px-6 sm:py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Flat Transfer Documents */}
                  {formData.nocType === "Flat Transfer/Sale/Purchase" && (
                    <>
                      <FileUpload
                        label="Agreement Copy / Allotment Letter"
                        required
                        documentType="agreement"
                        disabled={!formData.flatNumber || !formData.sellerName}
                        onFileSelected={(file) => {
                          setNocFiles((prev) => ({
                            ...prev,
                            agreementFile: file ?? undefined,
                          }));
                          if (file)
                            setErrors((prev) => {
                              const e = { ...prev };
                              delete e.agreementDocument;
                              return e;
                            });
                        }}
                        selectedFile={nocFiles.agreementFile}
                        error={errors.agreementDocument}
                      />
                      <FileUpload
                        label="Share Certificate Copy (if issued)"
                        documentType="share-certificate"
                        disabled={!formData.flatNumber || !formData.sellerName}
                        onFileSelected={(file) =>
                          setNocFiles((prev) => ({
                            ...prev,
                            shareCertificateFile: file ?? undefined,
                          }))
                        }
                        selectedFile={nocFiles.shareCertificateFile}
                      />
                      <FileUpload
                        label="Buyer Aadhaar Card"
                        required
                        documentType="buyer-aadhaar"
                        disabled={!formData.flatNumber || !formData.buyerName}
                        onFileSelected={(file) => {
                          setNocFiles((prev) => ({
                            ...prev,
                            buyerAadhaarFile: file ?? undefined,
                          }));
                          if (file)
                            setErrors((prev) => {
                              const e = { ...prev };
                              delete e.buyerAadhaarDocument;
                              return e;
                            });
                        }}
                        selectedFile={nocFiles.buyerAadhaarFile}
                        error={errors.buyerAadhaarDocument}
                      />
                      <FileUpload
                        label="Buyer PAN Card (optional)"
                        documentType="buyer-pan"
                        disabled={!formData.flatNumber || !formData.buyerName}
                        onFileSelected={(file) =>
                          setNocFiles((prev) => ({
                            ...prev,
                            buyerPanFile: file ?? undefined,
                          }))
                        }
                        selectedFile={nocFiles.buyerPanFile}
                      />
                    </>
                  )}

                  {/* Bank Account Transfer Documents */}
                  {formData.nocType === "Bank Account Transfer" && (
                    <>
                      <FileUpload
                        label="Identity Proof (Aadhaar)"
                        required
                        documentType="identity-proof"
                        disabled={!formData.flatNumber || !formData.sellerName}
                        onFileSelected={(file) => {
                          setNocFiles((prev) => ({
                            ...prev,
                            identityProofFile: file ?? undefined,
                          }));
                          if (file)
                            setErrors((prev) => {
                              const e = { ...prev };
                              delete e.identityProofDocument;
                              return e;
                            });
                        }}
                        selectedFile={nocFiles.identityProofFile}
                        error={errors.identityProofDocument}
                      />
                      <FileUpload
                        label="Share Certificate"
                        required
                        documentType="share-certificate"
                        disabled={!formData.flatNumber || !formData.sellerName}
                        onFileSelected={(file) => {
                          setNocFiles((prev) => ({
                            ...prev,
                            shareCertificateFile: file ?? undefined,
                          }));
                          if (file)
                            setErrors((prev) => {
                              const e = { ...prev };
                              delete e.shareCertificateDocument;
                              return e;
                            });
                        }}
                        selectedFile={nocFiles.shareCertificateFile}
                        error={errors.shareCertificateDocument}
                      />
                    </>
                  )}

                  {/* MSEB Bill Change Documents */}
                  {formData.nocType === "MSEB Electricity Bill Name Change" && (
                    <>
                      <FileUpload
                        label="Current Electricity Bill"
                        required
                        documentType="electricity-bill"
                        disabled={!formData.flatNumber || !formData.sellerName}
                        onFileSelected={(file) => {
                          setNocFiles((prev) => ({
                            ...prev,
                            currentElectricityBillFile: file ?? undefined,
                          }));
                          if (file)
                            setErrors((prev) => {
                              const e = { ...prev };
                              delete e.currentElectricityBillDocument;
                              return e;
                            });
                        }}
                        selectedFile={nocFiles.currentElectricityBillFile}
                        error={errors.currentElectricityBillDocument}
                      />
                      <FileUpload
                        label="Identity Proof (Aadhaar)"
                        required
                        documentType="identity-proof"
                        disabled={!formData.flatNumber || !formData.sellerName}
                        onFileSelected={(file) => {
                          setNocFiles((prev) => ({
                            ...prev,
                            identityProofFile: file ?? undefined,
                          }));
                          if (file)
                            setErrors((prev) => {
                              const e = { ...prev };
                              delete e.identityProofDocument;
                              return e;
                            });
                        }}
                        selectedFile={nocFiles.identityProofFile}
                        error={errors.identityProofDocument}
                      />
                      <FileUpload
                        label="Share Certificate"
                        required
                        documentType="share-certificate-mseb"
                        disabled={!formData.flatNumber || !formData.sellerName}
                        onFileSelected={(file) => {
                          setNocFiles((prev) => ({
                            ...prev,
                            shareCertificateFile: file ?? undefined,
                          }));
                          if (file)
                            setErrors((prev) => {
                              const e = { ...prev };
                              delete e.shareCertificateDocument;
                              return e;
                            });
                        }}
                        selectedFile={nocFiles.shareCertificateFile}
                        error={errors.shareCertificateDocument}
                      />
                    </>
                  )}

                  {/* Other Purpose Documents */}
                  {formData.nocType === "Other Purpose" && (
                    <>
                      <FileUpload
                        label="Share Certificate"
                        required
                        documentType="share-certificate-other"
                        disabled={!formData.flatNumber || !formData.sellerName}
                        onFileSelected={(file) => {
                          setNocFiles((prev) => ({
                            ...prev,
                            shareCertificateFile: file ?? undefined,
                          }));
                          if (file)
                            setErrors((prev) => {
                              const e = { ...prev };
                              delete e.shareCertificateDocument;
                              return e;
                            });
                        }}
                        selectedFile={nocFiles.shareCertificateFile}
                        error={errors.shareCertificateDocument}
                      />
                      <FileUpload
                        label="Supporting Documents"
                        required
                        documentType="supporting-docs"
                        disabled={!formData.flatNumber || !formData.sellerName}
                        onFileSelected={(file) => {
                          setNocFiles((prev) => ({
                            ...prev,
                            supportingDocsFile: file ?? undefined,
                          }));
                          if (file)
                            setErrors((prev) => {
                              const e = { ...prev };
                              delete e.supportingDocuments;
                              return e;
                            });
                        }}
                        selectedFile={nocFiles.supportingDocsFile}
                        error={errors.supportingDocuments}
                      />
                      <FileUpload
                        label="Identity Proof (Aadhaar)"
                        required
                        documentType="identity-proof-other"
                        disabled={!formData.flatNumber || !formData.sellerName}
                        onFileSelected={(file) => {
                          setNocFiles((prev) => ({
                            ...prev,
                            identityProofFile: file ?? undefined,
                          }));
                          if (file)
                            setErrors((prev) => {
                              const e = { ...prev };
                              delete e.identityProofDocument;
                              return e;
                            });
                        }}
                        selectedFile={nocFiles.identityProofFile}
                        error={errors.identityProofDocument}
                      />
                    </>
                  )}
                </div>

                {/* Last 3 Months Maintenance Receipts — shown for all NOC types */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-start gap-3 mb-5">
                    <div className="h-9 w-9 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-[#175a00]">
                        3
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Last 3 Months Maintenance Receipts
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Upload paid maintenance receipts for the last 3 months
                        {currentTypeConfig?.requiredDocuments.includes(
                          "maintenanceReceiptDocument"
                        )
                          ? " — at least Month 1 is required"
                          : " (all optional)"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Month 1 */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-xs font-bold flex-shrink-0 ${
                            currentTypeConfig?.requiredDocuments.includes(
                              "maintenanceReceiptDocument"
                            )
                              ? "bg-[#175a00] text-white"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          1
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          Month 1{" "}
                          {currentTypeConfig?.requiredDocuments.includes(
                            "maintenanceReceiptDocument"
                          ) && <span className="text-red-500">*</span>}
                        </span>
                      </div>
                      <FileUpload
                        label=""
                        required={currentTypeConfig?.requiredDocuments.includes(
                          "maintenanceReceiptDocument"
                        )}
                        documentType="maintenance-receipt"
                        disabled={!formData.flatNumber || !formData.sellerName}
                        onFileSelected={(file) => {
                          setNocFiles((prev) => ({
                            ...prev,
                            maintenanceReceipt1File: file ?? undefined,
                          }));
                          if (file)
                            setErrors((prev) => {
                              const e = { ...prev };
                              delete e.maintenanceReceiptDocument;
                              return e;
                            });
                        }}
                        selectedFile={nocFiles.maintenanceReceipt1File}
                        error={errors.maintenanceReceiptDocument}
                      />
                    </div>
                    {/* Month 2 */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex-shrink-0">
                          2
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          Month 2{" "}
                          <span className="text-slate-400 font-normal">
                            (Optional)
                          </span>
                        </span>
                      </div>
                      <FileUpload
                        label=""
                        documentType="maintenance-receipt-2"
                        disabled={!formData.flatNumber || !formData.sellerName}
                        onFileSelected={(file) =>
                          setNocFiles((prev) => ({
                            ...prev,
                            maintenanceReceipt2File: file ?? undefined,
                          }))
                        }
                        selectedFile={nocFiles.maintenanceReceipt2File}
                      />
                    </div>
                    {/* Month 3 */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex-shrink-0">
                          3
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          Month 3{" "}
                          <span className="text-slate-400 font-normal">
                            (Optional)
                          </span>
                        </span>
                      </div>
                      <FileUpload
                        label=""
                        documentType="maintenance-receipt-3"
                        disabled={!formData.flatNumber || !formData.sellerName}
                        onFileSelected={(file) =>
                          setNocFiles((prev) => ({
                            ...prev,
                            maintenanceReceipt3File: file ?? undefined,
                          }))
                        }
                        selectedFile={nocFiles.maintenanceReceipt3File}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Information - Dynamic based on fees */}
          {currentTypeConfig && totalFees > 0 && (
            <Card>
              <div
                className={`${theme.status.pending.bg} border-2 ${theme.status.pending.border} rounded-xl p-6`}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Payment Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">NOC Fees:</span>
                    <span className="font-bold text-gray-900 text-lg">
                      ₹{currentTypeConfig.nocFees.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">
                      Transfer Fees:
                    </span>
                    <span className="font-bold text-gray-900 text-lg">
                      ₹{currentTypeConfig.transferFees.toLocaleString()}
                    </span>
                  </div>
                  <div
                    className={`border-t-2 ${theme.status.pending.border} pt-3 flex justify-between items-center`}
                  >
                    <span className="font-bold text-gray-900 text-lg">
                      Total Amount:
                    </span>
                    <span
                      className={`font-bold ${theme.status.approved.text} text-2xl`}
                    >
                      ₹{totalFees.toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-4 bg-white/50 p-3 rounded-lg">
                  Payment instructions will be provided after document
                  verification.
                </p>
              </div>
            </Card>
          )}

          {/* Free NOC Information */}
          {currentTypeConfig && totalFees === 0 && (
            <Card>
              <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  No Payment Required
                </h3>
                <p className="text-sm text-gray-700">
                  This NOC type is free of charge. No payment is required for
                  processing.
                </p>
              </div>
            </Card>
          )}

          {/* Digital Signature & Declaration */}
          <Card>
            <div className="mb-6">
              <Input
                label="Applicant Digital Signature"
                name="digitalSignature"
                value={formData.digitalSignature}
                onChange={handleInputChange}
                error={errors.digitalSignature}
                placeholder="Type your full name as digital signature"
                required
              />
            </div>

            {/* Declaration */}
            <div className="mt-6 bg-slate-50 border border-slate-200 rounded-lg p-6">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="declarationAccepted"
                  checked={formData.declarationAccepted}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  {formData.nocType === "Flat Transfer/Sale/Purchase"
                    ? "I hereby declare that all the information provided above is true and correct. I understand that the society will verify all documents and maintenance dues before processing this NOC request. I agree to pay all applicable fees and complete the transfer process as per society norms."
                    : "I hereby declare that all the information provided above is true and correct. I understand that the society will verify all submitted documents before processing this NOC request."}
                </span>
              </label>
              {errors.declarationAccepted && (
                <p className="text-red-600 text-sm mt-2">
                  {errors.declarationAccepted}
                </p>
              )}
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/")}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!isFormValid() || submitting || checkingPending}
              className="w-full sm:w-auto"
            >
              {submitting ? "Submitting..." : "Submit NOC Request"}
            </Button>
          </div>
        </form>
      </div>

      <ToastContainer toast={toast} onClose={() => setToast(null)} />
      <Footer />
    </div>
  );
}
