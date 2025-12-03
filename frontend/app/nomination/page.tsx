"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/forms/FileUpload";
import { nominationAPI } from "@/lib/api";
import { DocumentMetadata, Nominee, Witness } from "@/lib/types";
import { CheckCircle, Plus, Trash2, Download } from "lucide-react";
import { InlineLoader } from "@/components/ui/Loader";
import { Header } from "@/components/layout/Header";
import { theme } from "@/lib/theme";
import { ToastContainer } from "@/components/ui/Toast";
import type { ToastType } from "@/components/ui/Toast";

export default function NominationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    primaryMemberName: "",
    flatNumber: "",
    wing: "" as "C" | "D" | "",
    primaryMemberEmail: "",
    primaryMemberMobile: "",
    declarationAccepted: false,
  });

  // Document states
  const [index2Document, setIndex2Document] = useState<DocumentMetadata>();
  const [possessionLetterDocument, setPossessionLetterDocument] =
    useState<DocumentMetadata>();
  const [primaryMemberAadhaar, setPrimaryMemberAadhaar] =
    useState<DocumentMetadata>();
  const [jointMemberAadhaar, setJointMemberAadhaar] =
    useState<DocumentMetadata>();
  const [nomineeAadhaars, setNomineeAadhaars] = useState<DocumentMetadata[]>(
    []
  );

  const [nominees, setNominees] = useState<Nominee[]>([
    {
      name: "",
      relationship: "",
      dateOfBirth: "",
      aadhaarNumber: "",
      sharePercentage: 0,
      address: "",
    },
  ]);

  const [witness1, setWitness1] = useState<Witness>({
    name: "",
    address: "",
    signature: "",
  });
  const [witness2, setWitness2] = useState<Witness>({
    name: "",
    address: "",
    signature: "",
  });
  const [memberSignature, setMemberSignature] = useState("");

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const checkDuplicate = async () => {
    // Only check if both flatNumber and wing are provided
    if (!formData.flatNumber || !formData.wing) {
      return;
    }

    // Validate flat number format first
    if (!/^\d+$/.test(formData.flatNumber)) {
      return;
    }

    setCheckingDuplicate(true);
    try {
      const response = await nominationAPI.checkDuplicate(
        formData.flatNumber,
        formData.wing
      );
      if (response.data.data.exists) {
        setErrors((prev) => ({
          ...prev,
          wing: response.data.data.message,
        }));
      } else {
        // Clear error if no duplicate
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.wing;
          return newErrors;
        });
      }
    } catch (error) {
      console.error("Error checking duplicate:", error);
    } finally {
      setCheckingDuplicate(false);
    }
  };

  // Format Aadhaar number as XXXX-XXXX-XXXX
  const formatAadhaar = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    // Limit to 12 digits
    const limited = digits.slice(0, 12);
    // Add hyphens after every 4 digits
    const parts = [];
    for (let i = 0; i < limited.length; i += 4) {
      parts.push(limited.slice(i, i + 4));
    }
    return parts.join("-");
  };

  // Get raw Aadhaar number (remove hyphens)
  const getRawAadhaar = (value: string): string => {
    return value.replace(/\D/g, "");
  };

  const handleNomineeChange = (
    index: number,
    field: keyof Nominee,
    value: string | number
  ) => {
    setNominees((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    if (errors[`nominee${index}_${field}`]) {
      setErrors((prev) => ({ ...prev, [`nominee${index}_${field}`]: "" }));
    }
  };

  const handleWitnessChange = (
    witnessNum: 1 | 2,
    field: keyof Witness,
    value: string
  ) => {
    if (witnessNum === 1) {
      setWitness1((prev) => ({ ...prev, [field]: value }));
    } else {
      setWitness2((prev) => ({ ...prev, [field]: value }));
    }
    if (errors[`witness${witnessNum}_${field}`]) {
      setErrors((prev) => ({ ...prev, [`witness${witnessNum}_${field}`]: "" }));
    }
  };

  const addNominee = () => {
    if (nominees.length < 3) {
      setNominees((prev) => [
        ...prev,
        {
          name: "",
          relationship: "",
          dateOfBirth: "",
          aadhaarNumber: "",
          sharePercentage: 0,
          address: "",
        },
      ]);
    }
  };

  const removeNominee = (index: number) => {
    if (nominees.length > 1) {
      setNominees((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Member Information validation
    if (!formData.primaryMemberName.trim())
      newErrors.primaryMemberName = "Member name is required";
    if (!formData.flatNumber.trim())
      newErrors.flatNumber = "Flat number is required";
    if (!formData.wing) newErrors.wing = "Wing is required";
    if (!formData.primaryMemberEmail.trim())
      newErrors.primaryMemberEmail = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.primaryMemberEmail))
      newErrors.primaryMemberEmail = "Invalid email format";
    if (!formData.primaryMemberMobile.trim())
      newErrors.primaryMemberMobile = "Mobile number is required";
    else if (!/^[6-9]\d{9}$/.test(formData.primaryMemberMobile))
      newErrors.primaryMemberMobile =
        "Mobile number must be a valid 10-digit Indian phone number";

    // Document validation
    if (!index2Document?.fileName)
      newErrors.index2Document = "Index II document is required";
    if (!possessionLetterDocument?.fileName)
      newErrors.possessionLetterDocument = "Possession Letter is required";
    if (!primaryMemberAadhaar?.fileName)
      newErrors.primaryMemberAadhaar = "Primary Member Aadhaar is required";

    // Nominee validation
    let totalPercentage = 0;
    nominees.forEach((nominee, index) => {
      if (!nominee.name.trim())
        newErrors[`nominee${index}_name`] = "Nominee name is required";
      if (!nominee.relationship.trim())
        newErrors[`nominee${index}_relationship`] = "Relationship is required";
      if (!nominee.dateOfBirth.trim())
        newErrors[`nominee${index}_dateOfBirth`] = "Date of birth is required";
      if (!nominee.aadhaarNumber.trim())
        newErrors[`nominee${index}_aadhaarNumber`] =
          "Aadhaar number is required";
      else if (!/^\d{12}$/.test(nominee.aadhaarNumber))
        newErrors[`nominee${index}_aadhaarNumber`] = "Must be 12 digits";
      if (!nominee.sharePercentage || nominee.sharePercentage <= 0)
        newErrors[`nominee${index}_sharePercentage`] =
          "Share percentage must be greater than 0";
      if (!nomineeAadhaars[index]?.fileName)
        newErrors[`nominee${index}_aadhaar`] =
          "Nominee Aadhaar document is required";
      totalPercentage += Number(nominee.sharePercentage);
    });

    if (totalPercentage !== 100) {
      newErrors.totalPercentage = "Total share percentage must equal 100%";
    }

    // Witness validation
    if (!witness1.name.trim())
      newErrors.witness1_name = "Witness 1 name is required";
    if (!witness1.address.trim())
      newErrors.witness1_address = "Witness 1 address is required";
    if (!witness1.signature.trim())
      newErrors.witness1_signature = "Witness 1 signature is required";
    if (!witness2.name.trim())
      newErrors.witness2_name = "Witness 2 name is required";
    if (!witness2.address.trim())
      newErrors.witness2_address = "Witness 2 address is required";
    if (!witness2.signature.trim())
      newErrors.witness2_signature = "Witness 2 signature is required";

    // Member signature validation
    if (!memberSignature.trim())
      newErrors.memberSignature = "Member signature is required";

    // Declaration validation
    if (!formData.declarationAccepted)
      newErrors.declarationAccepted = "You must accept the declaration";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    // Check if there are any errors
    if (Object.keys(errors).length > 0) return false;

    // Check required fields
    if (!formData.primaryMemberName.trim()) return false;
    if (!formData.flatNumber.trim()) return false;
    if (!formData.wing) return false;
    if (
      !formData.primaryMemberEmail.trim() ||
      !/^\S+@\S+\.\S+$/.test(formData.primaryMemberEmail)
    )
      return false;
    if (
      !formData.primaryMemberMobile.trim() ||
      !/^[6-9]\d{9}$/.test(formData.primaryMemberMobile)
    )
      return false;
    if (!formData.declarationAccepted) return false;

    // Check documents
    if (!index2Document?.fileName) return false;
    if (!possessionLetterDocument?.fileName) return false;
    if (!primaryMemberAadhaar?.fileName) return false;

    // Check nominees
    let totalPercentage = 0;
    for (let i = 0; i < nominees.length; i++) {
      const nominee = nominees[i];
      if (!nominee.name.trim()) return false;
      if (!nominee.relationship.trim()) return false;
      if (!nominee.dateOfBirth.trim()) return false;
      if (
        !nominee.aadhaarNumber.trim() ||
        !/^\d{12}$/.test(nominee.aadhaarNumber)
      )
        return false;
      if (!nominee.sharePercentage || nominee.sharePercentage <= 0)
        return false;
      if (!nomineeAadhaars[i]?.fileName) return false;
      totalPercentage += Number(nominee.sharePercentage);
    }
    if (totalPercentage !== 100) return false;

    // Check witnesses
    if (
      !witness1.name.trim() ||
      !witness1.address.trim() ||
      !witness1.signature.trim()
    )
      return false;
    if (
      !witness2.name.trim() ||
      !witness2.address.trim() ||
      !witness2.signature.trim()
    )
      return false;

    // Check member signature
    if (!memberSignature.trim()) return false;

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        primaryMemberName: formData.primaryMemberName,
        primaryMemberEmail: formData.primaryMemberEmail,
        primaryMemberMobile: formData.primaryMemberMobile,
        flatNumber: formData.flatNumber,
        wing: formData.wing,
        nominees: nominees,
        index2Document,
        possessionLetterDocument,
        primaryMemberAadhaar,
        jointMemberAadhaar,
        nomineeAadhaars,
        witnesses: [witness1, witness2],
        declarationAccepted: formData.declarationAccepted,
        memberSignature,
      };

      const response = await nominationAPI.create(payload);
      // Backend returns { success, message, data: { acknowledgementNumber, email } }
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
          "Failed to submit nomination. Please try again.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!acknowledgementNumber) return;

    setDownloadingPdf(true);
    try {
      const response = await nominationAPI.downloadPdf(acknowledgementNumber);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Nomination_${acknowledgementNumber}.pdf`;
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

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-10 text-center">
            <div
              className={`h-20 w-20 ${theme.states.success.bg} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${theme.states.success.shadow}`}
            >
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Successfully Submitted!
            </h2>
            <p className="text-slate-600 mb-6">Your acknowledgement number:</p>
            <div
              className={`${theme.status.pending.bg} border-2 ${theme.status.pending.border} rounded-xl p-5 mb-8`}
            >
              <p
                className={`text-3xl font-bold ${theme.status.pending.text} tracking-wide`}
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
                onClick={handleDownloadPdf}
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

  const totalSharePercentage = nominees.reduce(
    (sum, n) => sum + Number(n.sharePercentage || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Nomination Form
          </h1>
          <p className="text-lg text-slate-600">
            Register your nominees for share certificate inheritance
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Member Information */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-8 py-5 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">
                Member Information
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Enter primary member details
              </p>
            </div>
            <div className="px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Primary Member Name"
                  name="primaryMemberName"
                  value={formData.primaryMemberName}
                  onChange={handleInputChange}
                  error={errors.primaryMemberName}
                  placeholder="Enter full name"
                  required
                />
                <Input
                  label="Flat Number"
                  name="flatNumber"
                  type="text"
                  inputMode="numeric"
                  value={formData.flatNumber}
                  onChange={handleInputChange}
                  error={errors.flatNumber}
                  placeholder="e.g., 101"
                  required
                />
                <Select
                  label="Wing"
                  name="wing"
                  value={formData.wing}
                  onChange={handleSelectChange}
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
                  label="Email Address"
                  type="email"
                  name="primaryMemberEmail"
                  value={formData.primaryMemberEmail}
                  onChange={handleInputChange}
                  error={errors.primaryMemberEmail}
                  placeholder="your.email@example.com"
                  helperText="For updates and notifications"
                  required
                />
                <Input
                  label="Mobile Number"
                  name="primaryMemberMobile"
                  value={formData.primaryMemberMobile}
                  onChange={handleInputChange}
                  error={errors.primaryMemberMobile}
                  placeholder="9876543210"
                  helperText="WhatsApp enabled number"
                  maxLength={10}
                  required
                />
              </div>
            </div>
          </div>

          {/* Required Documents */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-8 py-5 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">
                Required Documents
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Upload clear copies in PDF or JPEG format (max 2MB each)
              </p>
            </div>
            <div className="px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUpload
                  label="Index II Document"
                  required
                  flatNumber={formData.flatNumber}
                  documentType="INDEX_2"
                  fullName={formData.primaryMemberName}
                  onUploadSuccess={setIndex2Document}
                  value={index2Document}
                  error={errors.index2Document}
                />
                <FileUpload
                  label="Possession Letter"
                  required
                  flatNumber={formData.flatNumber}
                  documentType="POSSESSION_LETTER"
                  fullName={formData.primaryMemberName}
                  onUploadSuccess={setPossessionLetterDocument}
                  value={possessionLetterDocument}
                  error={errors.possessionLetterDocument}
                />
                <FileUpload
                  label="Primary Member Aadhaar Card"
                  required
                  flatNumber={formData.flatNumber}
                  documentType="PRIMARY_MEMBER_AADHAAR"
                  fullName={formData.primaryMemberName}
                  onUploadSuccess={setPrimaryMemberAadhaar}
                  value={primaryMemberAadhaar}
                  error={errors.primaryMemberAadhaar}
                />
                <FileUpload
                  label="Joint Member Aadhaar Card (Optional)"
                  flatNumber={formData.flatNumber}
                  documentType="JOINT_MEMBER_AADHAAR"
                  fullName="Joint Member"
                  onUploadSuccess={setJointMemberAadhaar}
                  value={jointMemberAadhaar}
                />
              </div>
            </div>
          </div>

          {/* Nominees */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-8 py-5 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Nominees</h3>
              <p className="text-sm text-slate-600 mt-1">
                Add up to 3 nominees (total share must equal 100%)
              </p>
            </div>
            <div className="px-8 py-6">
              <div
                className={`mb-6 p-5 ${theme.status.pending.bg} border-2 ${theme.status.pending.border} rounded-xl`}
              >
                <p className="text-sm font-medium text-slate-700">
                  Total Share Percentage:{" "}
                  <span
                    className={`text-lg font-bold ${
                      totalSharePercentage === 100
                        ? theme.status.approved.text
                        : "text-red-600"
                    }`}
                  >
                    {totalSharePercentage}%
                  </span>
                  {totalSharePercentage === 100 && (
                    <span className={`ml-2 ${theme.status.approved.text}`}>
                      ✓
                    </span>
                  )}
                  {errors.totalPercentage && (
                    <span className="block text-red-600 mt-2 text-sm">
                      {errors.totalPercentage}
                    </span>
                  )}
                </p>
              </div>

              {nominees.map((nominee, index) => (
                <div
                  key={index}
                  className="mb-6 p-6 border-2 border-slate-200 rounded-xl bg-slate-50/50"
                >
                  <div className="flex justify-between items-center mb-5">
                    <h4 className="text-lg font-bold text-slate-900">
                      Nominee {index + 1}
                    </h4>
                    {nominees.length > 1 && (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removeNominee(index)}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Input
                      label="Name"
                      value={nominee.name}
                      onChange={(e) =>
                        handleNomineeChange(index, "name", e.target.value)
                      }
                      error={errors[`nominee${index}_name`]}
                      placeholder="Full name of nominee"
                      required
                    />
                    <Select
                      label="Relationship"
                      value={nominee.relationship}
                      onChange={(e) =>
                        handleNomineeChange(
                          index,
                          "relationship",
                          e.target.value
                        )
                      }
                      options={[
                        { value: "Father", label: "Father" },
                        { value: "Mother", label: "Mother" },
                        { value: "Spouse", label: "Spouse" },
                        { value: "Son", label: "Son" },
                        { value: "Daughter", label: "Daughter" },
                        { value: "Brother", label: "Brother" },
                        { value: "Sister", label: "Sister" },
                        { value: "Grandson", label: "Grandson" },
                        { value: "Granddaughter", label: "Granddaughter" },
                      ]}
                      error={errors[`nominee${index}_relationship`]}
                      required
                    />
                    <Input
                      label="Date of Birth"
                      type="date"
                      value={nominee.dateOfBirth}
                      onChange={(e) =>
                        handleNomineeChange(
                          index,
                          "dateOfBirth",
                          e.target.value
                        )
                      }
                      error={errors[`nominee${index}_dateOfBirth`]}
                      required
                    />
                    <Input
                      label="Aadhaar Number"
                      value={formatAadhaar(nominee.aadhaarNumber)}
                      onChange={(e) => {
                        const raw = getRawAadhaar(e.target.value);
                        handleNomineeChange(index, "aadhaarNumber", raw);
                      }}
                      error={errors[`nominee${index}_aadhaarNumber`]}
                      placeholder="XXXX-XXXX-XXXX"
                      helperText="12-digit Aadhaar number"
                      maxLength={14}
                      required
                    />
                    <Input
                      label="Share Percentage"
                      type="number"
                      value={nominee.sharePercentage.toString()}
                      onChange={(e) =>
                        handleNomineeChange(
                          index,
                          "sharePercentage",
                          Number(e.target.value)
                        )
                      }
                      error={errors[`nominee${index}_sharePercentage`]}
                      placeholder="0-100"
                      min="0"
                      max="100"
                      required
                    />
                    <Input
                      label="Address (Optional)"
                      value={nominee.address || ""}
                      onChange={(e) =>
                        handleNomineeChange(index, "address", e.target.value)
                      }
                      placeholder="Nominee's address"
                    />
                  </div>
                  <FileUpload
                    label="Nominee Aadhaar Card"
                    required
                    flatNumber={formData.flatNumber}
                    documentType={`NOMINEE${index + 1}_AADHAAR`}
                    fullName={nominee.name || "Nominee"}
                    onUploadSuccess={(metadata) => {
                      setNomineeAadhaars((prev) => {
                        const updated = [...prev];
                        updated[index] = metadata;
                        return updated;
                      });
                    }}
                    value={nomineeAadhaars[index]}
                    error={errors[`nominee${index}_aadhaar`]}
                  />
                </div>
              ))}

              {nominees.length < 3 && totalSharePercentage < 100 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addNominee}
                  className="gap-2 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  Add Another Nominee
                </Button>
              )}
            </div>
          </div>

          {/* Witnesses */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-8 py-5 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Witnesses</h3>
              <p className="text-sm text-slate-600 mt-1">
                Two witnesses are required to validate the nomination
              </p>
            </div>
            <div className="px-8 py-6">
              <div className="space-y-8">
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="text-lg font-bold text-slate-900 mb-4">
                    Witness 1
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Full Name"
                      value={witness1.name}
                      onChange={(e) =>
                        handleWitnessChange(1, "name", e.target.value)
                      }
                      error={errors.witness1_name}
                      placeholder="Enter witness 1 full name"
                      required
                    />
                    <Input
                      label="Digital Signature"
                      value={witness1.signature}
                      onChange={(e) =>
                        handleWitnessChange(1, "signature", e.target.value)
                      }
                      error={errors.witness1_signature}
                      placeholder="Type full name"
                      helperText="Type full name as digital signature"
                      required
                    />
                    <div className="md:col-span-2">
                      <Input
                        label="Address"
                        value={witness1.address}
                        onChange={(e) =>
                          handleWitnessChange(1, "address", e.target.value)
                        }
                        error={errors.witness1_address}
                        placeholder="Full address"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="text-lg font-bold text-slate-900 mb-4">
                    Witness 2
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Full Name"
                      value={witness2.name}
                      onChange={(e) =>
                        handleWitnessChange(2, "name", e.target.value)
                      }
                      error={errors.witness2_name}
                      placeholder="Enter witness 2 full name"
                      required
                    />
                    <Input
                      label="Digital Signature"
                      value={witness2.signature}
                      onChange={(e) =>
                        handleWitnessChange(2, "signature", e.target.value)
                      }
                      error={errors.witness2_signature}
                      placeholder="Type full name"
                      helperText="Type full name as digital signature"
                      required
                    />
                    <div className="md:col-span-2">
                      <Input
                        label="Address"
                        value={witness2.address}
                        onChange={(e) =>
                          handleWitnessChange(2, "address", e.target.value)
                        }
                        error={errors.witness2_address}
                        placeholder="Full address"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Declaration */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-8 py-5 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Declaration</h3>
              <p className="text-sm text-slate-600 mt-1">
                Confirm the accuracy of your information
              </p>
            </div>
            <div className="px-8 py-6">
              <div className="space-y-5">
                <Input
                  label="Applicant Digital Signature"
                  name="memberSignature"
                  value={memberSignature}
                  onChange={(e) => setMemberSignature(e.target.value)}
                  error={errors.memberSignature}
                  placeholder="Type your full name"
                  helperText="Type your full name to sign digitally"
                  required
                />
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="declarationAccepted"
                      checked={formData.declarationAccepted}
                      onChange={handleInputChange}
                      className="mt-1 h-5 w-5 text-purple-600 focus:ring-purple-500 border-slate-300 rounded"
                    />
                    <div className="flex-1">
                      <label className="text-sm text-slate-700 leading-relaxed">
                        I hereby declare that all the information provided above
                        is true and correct to the best of my knowledge, and the
                        nominees listed have the right to inherit my share
                        certificate. I understand that any false information may
                        result in rejection of my nomination.
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
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/")}
              className="sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={submitting}
              disabled={!isFormValid() || submitting}
              className="sm:w-auto"
            >
              {submitting ? "Submitting..." : "Submit Nomination"}
            </Button>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      <ToastContainer toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
