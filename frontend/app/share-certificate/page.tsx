"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/forms/FileUpload";
import { shareCertificateAPI, uploadAPI } from "@/lib/api";
import { MembershipType } from "@/lib/types";
import { CheckCircle, Download } from "lucide-react";
import { InlineLoader } from "@/components/ui/Loader";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { theme } from "@/lib/theme";
import { ToastContainer } from "@/components/ui/Toast";
import type { ToastType } from "@/components/ui/Toast";
import { getSocietyUser } from "@/lib/auth";

export default function ShareCertificatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    index2ApplicantNames: [] as string[],
    flatNumber: "",
    wing: "" as "C" | "D" | "",
    email: "",
    mobileNumber: "",
    carpetArea: "",
    builtUpArea: "",
    membershipType: "" as MembershipType,
    digitalSignature: "",
    declarationAccepted: false,
    isResaleProperty: false,
  });

  const [files, setFiles] = useState<{
    index2File?: File;
    possessionFile?: File;
    aadhaarFile?: File;
    receipt1File?: File;
    receipt2File?: File;
    receipt3File?: File;
  }>({});

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [acknowledgementNumber, setAcknowledgementNumber] = useState("");
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  useEffect(() => {
    if (getSocietyUser()) return;
    const base =
      process.env.NEXT_PUBLIC_SOCIETY_APP_URL ?? "http://localhost:3002";
    window.location.href = `${base}/documents?returnUrl=/share-certificate`;
  }, []);

  useEffect(() => {
    const user = getSocietyUser();
    if (!user) return;
    const mobile = user.phone?.replace(/^\+?91/, "") ?? "";
    setFormData((prev) => ({
      ...prev,
      fullName: prev.fullName || user.fullName || "",
      email: prev.email || user.email || "",
      mobileNumber:
        prev.mobileNumber || (/^[6-9]\d{9}$/.test(mobile) ? mobile : ""),
      digitalSignature: prev.digitalSignature || user.fullName || "",
      flatNumber: prev.flatNumber || user.unitNumber || "",
      wing: prev.wing || (user.wing as "C" | "D" | "") || "",
    }));
  }, []);

  const membershipTypes = [
    { value: "Primary", label: "Primary Member" },
    { value: "Spouse", label: "Spouse" },
    { value: "Son", label: "Son" },
    { value: "Daughter", label: "Daughter" },
    { value: "Legal Heir", label: "Legal Heir" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    if (name === "flatNumber" && value !== "" && !/^\d+$/.test(value)) return;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const e = { ...prev };
        delete e[name];
        return e;
      });
    }
  };

  const handleAddApplicantName = () => {
    setFormData((prev) => ({
      ...prev,
      index2ApplicantNames: [...prev.index2ApplicantNames, ""],
    }));
  };

  const handleRemoveApplicantName = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      index2ApplicantNames: prev.index2ApplicantNames.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleApplicantNameChange = (index: number, value: string) => {
    setFormData((prev) => {
      const updatedNames = [...prev.index2ApplicantNames];
      updatedNames[index] = value;
      return { ...prev, index2ApplicantNames: updatedNames };
    });
  };

  const checkDuplicate = async () => {
    if (
      !formData.flatNumber ||
      !formData.wing ||
      !/^\d+$/.test(formData.flatNumber)
    )
      return;
    setCheckingDuplicate(true);
    try {
      const response = await shareCertificateAPI.checkDuplicate(
        formData.flatNumber,
        formData.wing
      );
      if (response.data.data.exists) {
        setErrors((prev) => ({ ...prev, wing: response.data.data.message }));
      } else {
        setErrors((prev) => {
          const e = { ...prev };
          delete e.wing;
          delete e.flatNumber;
          return e;
        });
      }
    } catch (error) {
      console.error("Error checking duplicate:", error);
    } finally {
      setCheckingDuplicate(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    else if (formData.fullName.length > 100)
      newErrors.fullName = "Full name must be at most 100 characters";

    formData.index2ApplicantNames.forEach((name, index) => {
      if (name.trim() && name.length > 100)
        newErrors[`coApplicant${index}`] =
          `Co-applicant ${index + 1} name must be at most 100 characters`;
    });

    if (!formData.flatNumber.trim())
      newErrors.flatNumber = "Flat number is required";
    else if (!/^\d+$/.test(formData.flatNumber))
      newErrors.flatNumber = "Flat number must contain only numbers";
    else if (formData.flatNumber.length > 5)
      newErrors.flatNumber = "Flat number must be at most 5 digits";
    if (!formData.wing) newErrors.wing = "Wing is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Please enter a valid email to receive updates";
    if (!formData.mobileNumber.trim())
      newErrors.mobileNumber = "Mobile number is required";
    else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber))
      newErrors.mobileNumber =
        "Please enter a valid 10-digit mobile number with WhatsApp";
    if (formData.carpetArea && Number(formData.carpetArea) <= 0)
      newErrors.carpetArea = "Carpet area must be greater than 0";
    if (formData.builtUpArea && Number(formData.builtUpArea) <= 0)
      newErrors.builtUpArea = "Built-up area must be greater than 0";
    if (!formData.membershipType)
      newErrors.membershipType = "Membership type is required";
    if (!formData.digitalSignature.trim())
      newErrors.digitalSignature = "Digital signature is required";
    else if (formData.digitalSignature.length < 3)
      newErrors.digitalSignature =
        "Digital signature must be at least 3 characters";
    else if (formData.digitalSignature.length > 100)
      newErrors.digitalSignature =
        "Digital signature must be at most 100 characters";
    if (!formData.declarationAccepted)
      newErrors.declarationAccepted = "You must accept the declaration";

    if (!files.index2File)
      newErrors.index2Document = "Index II document is required";
    if (!files.possessionFile)
      newErrors.possessionLetterDocument = "Possession letter is required";
    if (!files.aadhaarFile)
      newErrors.aadhaarCardDocument = "Aadhaar card is required";
    if (!files.receipt1File)
      newErrors.maintenanceReceipt1Document =
        "At least 1 maintenance receipt is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    if (Object.values(errors).some((e) => e && e.trim() !== "")) return false;
    if (!formData.fullName.trim() || formData.fullName.length > 100)
      return false;
    if (formData.index2ApplicantNames.some((n) => n.trim() && n.length > 100))
      return false;
    if (
      !formData.flatNumber.trim() ||
      !/^\d+$/.test(formData.flatNumber) ||
      formData.flatNumber.length > 5
    )
      return false;
    if (!formData.wing) return false;
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email))
      return false;
    if (
      !formData.mobileNumber.trim() ||
      !/^[6-9]\d{9}$/.test(formData.mobileNumber)
    )
      return false;
    if (!formData.membershipType) return false;
    if (
      !formData.digitalSignature.trim() ||
      formData.digitalSignature.length < 3 ||
      formData.digitalSignature.length > 100
    )
      return false;
    if (!formData.declarationAccepted) return false;
    if (
      !files.index2File ||
      !files.possessionFile ||
      !files.aadhaarFile ||
      !files.receipt1File
    )
      return false;
    return true;
  };

  const handleDownloadReceipt = async () => {
    if (!acknowledgementNumber) return;
    setDownloadingPdf(true);
    try {
      const response = await shareCertificateAPI.downloadPdf(
        acknowledgementNumber
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ShareCertificate_${acknowledgementNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      setToast({
        message:
          err.response?.data?.message ||
          "Failed to download PDF. Please try again.",
        type: "error",
      });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const uploadFile = async (file: File, documentType: string) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("flatNumber", formData.flatNumber);
    fd.append("documentType", documentType);
    fd.append("fullName", formData.fullName);
    const response = await uploadAPI.upload(fd);
    return response.data.data || response.data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      const [
        index2Meta,
        possessionMeta,
        aadhaarMeta,
        receipt1Meta,
        receipt2Meta,
        receipt3Meta,
      ] = await Promise.all([
        uploadFile(files.index2File!, "INDEX2"),
        uploadFile(files.possessionFile!, "POSSESSION_LETTER"),
        uploadFile(files.aadhaarFile!, "AADHAAR"),
        uploadFile(files.receipt1File!, "MAINTENANCE_RECEIPT_1"),
        files.receipt2File
          ? uploadFile(files.receipt2File, "MAINTENANCE_RECEIPT_2")
          : Promise.resolve(undefined),
        files.receipt3File
          ? uploadFile(files.receipt3File, "MAINTENANCE_RECEIPT_3")
          : Promise.resolve(undefined),
      ]);

      const payload = {
        ...formData,
        carpetArea: formData.carpetArea
          ? Number(formData.carpetArea)
          : undefined,
        builtUpArea: formData.builtUpArea
          ? Number(formData.builtUpArea)
          : undefined,
        index2ApplicantNames: formData.index2ApplicantNames.filter(
          (n) => n.trim() !== ""
        ),
        index2Document: index2Meta,
        possessionLetterDocument: possessionMeta,
        aadhaarCardDocument: aadhaarMeta,
        maintenanceReceiptsDocuments: [
          receipt1Meta,
          receipt2Meta,
          receipt3Meta,
        ].filter(Boolean),
      };

      const response = await shareCertificateAPI.create(payload);
      const ackNumber =
        response.data.data?.acknowledgementNumber ||
        response.data.acknowledgementNumber;
      setAcknowledgementNumber(ackNumber);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      setToast({
        message:
          err.response?.data?.message ||
          "Failed to submit application. Please try again.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
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
              className={`${theme.status.pending.bg} border-2 ${theme.status.pending.border} rounded-xl p-5 mb-8`}
            >
              <p
                className={`text-xl sm:text-3xl font-bold ${theme.status.pending.text} tracking-wide`}
              >
                {acknowledgementNumber}
              </p>
            </div>
            <p className="text-sm text-slate-600 mb-8 leading-relaxed">
              Save this number for tracking. A confirmation email has been sent
              to your inbox.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleDownloadReceipt}
                isLoading={downloadingPdf}
                disabled={downloadingPdf}
                className="w-full gap-2"
              >
                <Download className="h-5 w-5" />
                {downloadingPdf ? "Generating..." : "Download Application Form"}
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

  const fileDisabled = !formData.flatNumber || !formData.fullName;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-16 lg:pb-0">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Share Certificate Application
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Complete the form below to apply for your share certificate
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-slate-200">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Personal Information
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Enter your basic details as per official documents
              </p>
            </div>
            <div className="px-4 py-5 sm:px-6 sm:py-6">
              <div className="mb-6">
                <Input
                  label="Primary Applicant Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  error={errors.fullName}
                  placeholder="Enter full name"
                  helperText="As per Index - 2 document (max 100 characters)"
                  maxLength={100}
                  required
                />
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900">
                      Index-2 Co-Applicant Names
                    </label>
                    <p className="text-xs text-slate-500 mt-1">
                      Add co-applicant names as per Index-2 document only if any
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddApplicantName}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    + Add Name
                  </Button>
                </div>
                {formData.index2ApplicantNames.length > 0 ? (
                  <div className="space-y-3">
                    {formData.index2ApplicantNames.map((name, index) => (
                      <div key={index} className="flex items-end gap-2">
                        <div className="flex-1">
                          <Input
                            label={`Co-Applicant ${index + 1}`}
                            value={name}
                            onChange={(e) =>
                              handleApplicantNameChange(index, e.target.value)
                            }
                            placeholder="Enter co-applicant name"
                            helperText="As listed in Index-2 (max 100 characters)"
                            maxLength={100}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveApplicantName(index)}
                          className="mb-0.5 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-slate-600">
                      No additional applicant names added. Click &quot;Add
                      Name&quot; to add multiple applicants from Index-2 if any.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Select
                  label="Wing"
                  name="wing"
                  value={formData.wing}
                  onChange={handleInputChange}
                  onBlur={checkDuplicate}
                  options={[
                    { value: "C", label: "C" },
                    { value: "D", label: "D" },
                  ]}
                  error={errors.wing}
                  helperText={
                    checkingDuplicate ? (
                      <span className="flex items-center gap-2 text-blue-600">
                        <InlineLoader className="h-4 w-4" />
                        Checking for duplicate flat...
                      </span>
                    ) : undefined
                  }
                  required
                />
                <Input
                  label="Flat Number"
                  name="flatNumber"
                  value={formData.flatNumber}
                  onChange={handleInputChange}
                  error={errors.flatNumber}
                  placeholder="e.g., 101"
                  type="text"
                  inputMode="numeric"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  placeholder="your.email@example.com"
                  helperText="For updates and notifications"
                  required
                />
                <Input
                  label="Mobile Number"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  error={errors.mobileNumber}
                  placeholder="9876543210"
                  helperText="WhatsApp enabled number"
                  maxLength={10}
                  required
                />
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-slate-200">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Property Details
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Provide information about your flat
              </p>
            </div>
            <div className="px-4 py-5 sm:px-6 sm:py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Carpet Area"
                  type="number"
                  name="carpetArea"
                  value={formData.carpetArea}
                  onChange={handleInputChange}
                  error={errors.carpetArea}
                  placeholder="e.g., 850"
                  helperText="In square feet (optional)"
                />
                <Input
                  label="Built-up Area"
                  type="number"
                  name="builtUpArea"
                  value={formData.builtUpArea}
                  onChange={handleInputChange}
                  error={errors.builtUpArea}
                  placeholder="e.g., 1000"
                  helperText="In square feet (optional)"
                />
                <div className="md:col-span-2">
                  <Select
                    label="Membership Type"
                    name="membershipType"
                    value={formData.membershipType}
                    onChange={handleInputChange}
                    options={membershipTypes}
                    error={errors.membershipType}
                    required
                  />
                </div>
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
            </div>
          </div>

          {/* Required Documents */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-slate-200">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Required Documents
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Select files — they will be uploaded when you submit the form
              </p>
            </div>
            <div className="px-4 py-5 sm:px-6 sm:py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUpload
                  label="Index II Document"
                  required
                  documentType="INDEX2"
                  disabled={fileDisabled}
                  onFileSelected={(file) => {
                    setFiles((prev) => ({
                      ...prev,
                      index2File: file ?? undefined,
                    }));
                    if (file)
                      setErrors((prev) => {
                        const e = { ...prev };
                        delete e.index2Document;
                        return e;
                      });
                  }}
                  selectedFile={files.index2File}
                  error={errors.index2Document}
                />
                <FileUpload
                  label="Possession Letter"
                  required
                  documentType="POSSESSION_LETTER"
                  disabled={fileDisabled}
                  onFileSelected={(file) => {
                    setFiles((prev) => ({
                      ...prev,
                      possessionFile: file ?? undefined,
                    }));
                    if (file)
                      setErrors((prev) => {
                        const e = { ...prev };
                        delete e.possessionLetterDocument;
                        return e;
                      });
                  }}
                  selectedFile={files.possessionFile}
                  error={errors.possessionLetterDocument}
                />
                <FileUpload
                  label="Aadhaar Card"
                  required
                  documentType="AADHAAR"
                  disabled={fileDisabled}
                  onFileSelected={(file) => {
                    setFiles((prev) => ({
                      ...prev,
                      aadhaarFile: file ?? undefined,
                    }));
                    if (file)
                      setErrors((prev) => {
                        const e = { ...prev };
                        delete e.aadhaarCardDocument;
                        return e;
                      });
                  }}
                  selectedFile={files.aadhaarFile}
                  error={errors.aadhaarCardDocument}
                />
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex items-start gap-3 mb-5">
                  <div className="h-9 w-9 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[#175a00]">3</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Last 3 Months Maintenance Receipts
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Upload paid maintenance receipts for the last 3 months —
                      at least Month 1 is required
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Month 1 — required */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#175a00] text-white text-xs font-bold flex-shrink-0">
                        1
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        Month 1 <span className="text-red-500">*</span>
                      </span>
                    </div>
                    <FileUpload
                      label=""
                      required
                      documentType="MAINTENANCE_RECEIPT_1"
                      disabled={fileDisabled}
                      onFileSelected={(file) => {
                        setFiles((prev) => ({
                          ...prev,
                          receipt1File: file ?? undefined,
                        }));
                        if (file)
                          setErrors((prev) => {
                            const e = { ...prev };
                            delete e.maintenanceReceipt1Document;
                            return e;
                          });
                      }}
                      selectedFile={files.receipt1File}
                      error={errors.maintenanceReceipt1Document}
                    />
                  </div>
                  {/* Month 2 — optional */}
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
                      documentType="MAINTENANCE_RECEIPT_2"
                      disabled={fileDisabled}
                      onFileSelected={(file) =>
                        setFiles((prev) => ({
                          ...prev,
                          receipt2File: file ?? undefined,
                        }))
                      }
                      selectedFile={files.receipt2File}
                    />
                  </div>
                  {/* Month 3 — optional */}
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
                      documentType="MAINTENANCE_RECEIPT_3"
                      disabled={fileDisabled}
                      onFileSelected={(file) =>
                        setFiles((prev) => ({
                          ...prev,
                          receipt3File: file ?? undefined,
                        }))
                      }
                      selectedFile={files.receipt3File}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Declaration */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-slate-200">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Declaration
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Confirm the accuracy of your information
              </p>
            </div>
            <div className="px-4 py-5 sm:px-6 sm:py-6">
              <div className="space-y-5">
                <Input
                  label="Applicant Digital Signature"
                  name="digitalSignature"
                  value={formData.digitalSignature}
                  onChange={handleInputChange}
                  error={errors.digitalSignature}
                  placeholder="Type your full name"
                  helperText="Type your full name to sign digitally (max 100 characters)"
                  maxLength={100}
                  required
                />
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="declarationAccepted"
                      checked={formData.declarationAccepted}
                      onChange={handleInputChange}
                      className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <div className="flex-1">
                      <label className="text-sm text-slate-700 leading-relaxed">
                        I hereby declare that all the information provided above
                        is true and correct to the best of my knowledge. I
                        understand that any false information may result in
                        rejection of my application.
                      </label>
                      {errors.declarationAccepted && (
                        <span className="block text-red-600 text-sm mt-2">
                          {errors.declarationAccepted}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
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
              isLoading={submitting}
              disabled={!isFormValid() || submitting}
              className="w-full sm:w-auto"
            >
              {submitting ? "Uploading & Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </div>

      <ToastContainer toast={toast} onClose={() => setToast(null)} />
      <Footer />
    </div>
  );
}
