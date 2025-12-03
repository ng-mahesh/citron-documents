"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FileUpload } from "@/components/forms/FileUpload";
import { nocRequestAPI } from "@/lib/api";
import { DocumentMetadata } from "@/lib/types";
import { CheckCircle, Download, Info } from "lucide-react";
import { InlineLoader } from "@/components/ui/Loader";

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

    // Buyer Information
    buyerName: "",
    buyerMobileNumber: "",
    buyerEmail: "",

    // NOC Details
    reason: "" as "Sale" | "Mortgage" | "",
    expectedTransferDate: "",

    // Declaration
    digitalSignature: "",
    declarationAccepted: false,
  });

  const [documents, setDocuments] = useState<{
    agreementDocument?: DocumentMetadata;
    shareCertificateDocument?: DocumentMetadata;
    maintenanceReceiptDocument?: DocumentMetadata;
    buyerAadhaarDocument?: DocumentMetadata;
    buyerPanDocument?: DocumentMetadata;
  }>({});

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [acknowledgementNumber, setAcknowledgementNumber] = useState("");
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [checkingPending, setCheckingPending] = useState(false);

  const nocReasons = [
    { value: "Sale", label: "Sale" },
    { value: "Mortgage", label: "Mortgage" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
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
    } catch (error: any) {
      console.error("Error checking pending request:", error);
    } finally {
      setCheckingPending(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Seller Information
    if (!formData.sellerName.trim()) newErrors.sellerName = "Seller name is required";
    if (!formData.sellerEmail.trim()) newErrors.sellerEmail = "Seller email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.sellerEmail))
      newErrors.sellerEmail = "Please enter a valid email";
    if (!formData.sellerMobileNumber.trim())
      newErrors.sellerMobileNumber = "Mobile number is required";
    else if (!/^[6-9]\d{9}$/.test(formData.sellerMobileNumber))
      newErrors.sellerMobileNumber = "Please enter a valid 10-digit mobile number";
    if (formData.sellerAlternateMobile.trim() && !/^[6-9]\d{9}$/.test(formData.sellerAlternateMobile))
      newErrors.sellerAlternateMobile = "Please enter a valid 10-digit mobile number";
    if (!formData.flatNumber.trim())
      newErrors.flatNumber = "Flat number is required";
    else if (!/^\d+$/.test(formData.flatNumber))
      newErrors.flatNumber = "Flat number must contain only numbers";
    if (!formData.wing) newErrors.wing = "Wing is required";

    // Buyer Information
    if (!formData.buyerName.trim()) newErrors.buyerName = "Buyer name is required";
    if (!formData.buyerEmail.trim()) newErrors.buyerEmail = "Buyer email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.buyerEmail))
      newErrors.buyerEmail = "Please enter a valid buyer email";
    if (!formData.buyerMobileNumber.trim())
      newErrors.buyerMobileNumber = "Buyer mobile number is required";
    else if (!/^[6-9]\d{9}$/.test(formData.buyerMobileNumber))
      newErrors.buyerMobileNumber = "Please enter a valid 10-digit buyer mobile number";

    // NOC Details
    if (!formData.reason) newErrors.reason = "Reason for NOC is required";
    if (!formData.expectedTransferDate)
      newErrors.expectedTransferDate = "Expected transfer date is required";

    // Documents
    if (!documents.agreementDocument?.fileName)
      newErrors.agreementDocument = "Agreement document is required";
    if (!documents.maintenanceReceiptDocument?.fileName)
      newErrors.maintenanceReceiptDocument = "Maintenance receipt is required";
    if (!documents.buyerAadhaarDocument?.fileName)
      newErrors.buyerAadhaarDocument = "Buyer Aadhaar document is required";

    // Declaration
    if (!formData.digitalSignature.trim())
      newErrors.digitalSignature = "Digital signature is required";
    if (!formData.declarationAccepted)
      newErrors.declarationAccepted = "You must accept the declaration";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    if (Object.keys(errors).length > 0) return false;

    if (!formData.sellerName.trim()) return false;
    if (!formData.sellerEmail.trim() || !/^\S+@\S+\.\S+$/.test(formData.sellerEmail)) return false;
    if (!formData.sellerMobileNumber.trim() || !/^[6-9]\d{9}$/.test(formData.sellerMobileNumber)) return false;
    if (!formData.flatNumber.trim() || !/^\d+$/.test(formData.flatNumber)) return false;
    if (!formData.wing) return false;
    if (!formData.buyerName.trim()) return false;
    if (!formData.buyerEmail.trim() || !/^\S+@\S+\.\S+$/.test(formData.buyerEmail)) return false;
    if (!formData.buyerMobileNumber.trim() || !/^[6-9]\d{9}$/.test(formData.buyerMobileNumber)) return false;
    if (!formData.reason) return false;
    if (!formData.expectedTransferDate) return false;
    if (!formData.digitalSignature.trim()) return false;
    if (!formData.declarationAccepted) return false;
    if (!documents.agreementDocument?.fileName) return false;
    if (!documents.maintenanceReceiptDocument?.fileName) return false;
    if (!documents.buyerAadhaarDocument?.fileName) return false;

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const submissionData = {
        ...formData,
        ...documents,
      };

      const response = await nocRequestAPI.create(submissionData);

      if (response.data.success) {
        setAcknowledgementNumber(response.data.data.acknowledgementNumber);
        setPaymentDetails(response.data.data.paymentDetails);
        setSuccess(true);
      }
    } catch (error: any) {
      console.error("Error submitting NOC request:", error);
      alert(
        error.response?.data?.message ||
          "Failed to submit NOC request. Please try again."
      );
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
      alert("Failed to download PDF. Please try again.");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-10 text-center">
            <div className="h-20 w-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Successfully Submitted!
            </h2>
            <p className="text-slate-600 mb-6">Your acknowledgement number:</p>
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-green-500 rounded-xl p-5 mb-8">
              <p className="text-3xl font-bold text-green-700 tracking-wide">
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
                        <span className="font-bold text-gray-900">₹{paymentDetails.nocFees}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Transfer Fees:</span>
                        <span className="font-bold text-gray-900">₹{paymentDetails.transferFees}</span>
                      </div>
                      <div className="border-t border-yellow-300 pt-1.5 flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total Amount:</span>
                        <span className="font-bold text-blue-600 text-lg">₹{paymentDetails.totalAmount}</span>
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
              Save this number for tracking. A confirmation email has been sent to your inbox.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleDownloadPdf}
                className="w-full gap-2">
                <Download className="h-5 w-5" />
                Download Application Form
              </Button>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => router.push("/status")}
                  variant="outline"
                  className="flex-1 sm:flex-initial">
                  Track Status
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1 sm:flex-initial">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-green-600 hover:text-green-700 mb-4">
            <span className="mr-2">←</span> Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            NOC Request & Flat Transfer
          </h1>
          <p className="text-lg text-slate-600">
            Submit your No Objection Certificate request for flat ownership transfer
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seller Information Section */}
          <Card className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
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
                  error={errors.sellerEmail}
                  placeholder="Enter email address"
                  required
                />
                <Input
                  label="Mobile Number (WhatsApp)"
                  name="sellerMobileNumber"
                  value={formData.sellerMobileNumber}
                  onChange={handleInputChange}
                  error={errors.sellerMobileNumber}
                  placeholder="9876543210"
                  required
                />
                <Input
                  label="Alternate Mobile Number (Optional)"
                  name="sellerAlternateMobile"
                  value={formData.sellerAlternateMobile}
                  onChange={handleInputChange}
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
              </div>
          </Card>

          {/* Buyer Information Section */}
          <Card className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
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
                error={errors.buyerEmail}
                placeholder="Enter buyer email address"
                  required
                />
              </div>
          </Card>

          {/* NOC Details Section */}
          <Card className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                NOC & Transfer Details
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Reason for NOC"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  error={errors.reason}
                  options={[
                    { value: "", label: "Select Reason" },
                    ...nocReasons,
                  ]}
                  required
                />
                <Input
                  label="Expected Transfer Date"
                  name="expectedTransferDate"
                  type="date"
                  value={formData.expectedTransferDate}
                  onChange={handleInputChange}
                  error={errors.expectedTransferDate}
                  required
                />
              </div>
          </Card>

          {/* Document Upload Section */}
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
                  label="Agreement Copy / Allotment Letter"
                  required
                  flatNumber={formData.flatNumber}
                  documentType="agreement"
                  fullName={formData.sellerName}
                  value={documents.agreementDocument}
                  onUploadSuccess={(metadata) =>
                    setDocuments((prev) => ({
                      ...prev,
                      agreementDocument: metadata,
                    }))
                  }
                  error={errors.agreementDocument}
                />
                <FileUpload
                  label="Share Certificate Copy (if issued)"
                  flatNumber={formData.flatNumber}
                  documentType="share-certificate"
                  fullName={formData.sellerName}
                  value={documents.shareCertificateDocument}
                  onUploadSuccess={(metadata) =>
                    setDocuments((prev) => ({
                      ...prev,
                      shareCertificateDocument: metadata,
                    }))
                  }
                />
                <FileUpload
                  label="Latest Maintenance Receipt (no dues)"
                  required
                  flatNumber={formData.flatNumber}
                  documentType="maintenance-receipt"
                  fullName={formData.sellerName}
                  value={documents.maintenanceReceiptDocument}
                  onUploadSuccess={(metadata) =>
                    setDocuments((prev) => ({
                      ...prev,
                      maintenanceReceiptDocument: metadata,
                    }))
                  }
                  error={errors.maintenanceReceiptDocument}
                />
                <FileUpload
                  label="Buyer Aadhaar Card"
                  required
                  flatNumber={formData.flatNumber}
                  documentType="buyer-aadhaar"
                  fullName={formData.buyerName}
                  value={documents.buyerAadhaarDocument}
                  onUploadSuccess={(metadata) =>
                    setDocuments((prev) => ({
                      ...prev,
                      buyerAadhaarDocument: metadata,
                    }))
                  }
                  error={errors.buyerAadhaarDocument}
                />
                <FileUpload
                  label="Buyer PAN Card (optional)"
                  flatNumber={formData.flatNumber}
                  documentType="buyer-pan"
                  fullName={formData.buyerName}
                  value={documents.buyerPanDocument}
                  onUploadSuccess={(metadata) =>
                    setDocuments((prev) => ({
                      ...prev,
                      buyerPanDocument: metadata,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <Card className="p-8">
            <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">NOC Fees:</span>
                  <span className="font-bold text-gray-900 text-lg">₹1,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Transfer Fees:</span>
                  <span className="font-bold text-gray-900 text-lg">₹25,000</span>
                </div>
                <div className="border-t-2 border-blue-400 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-lg">Total Amount:</span>
                  <span className="font-bold text-blue-600 text-2xl">₹26,000</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-4 bg-white/50 p-3 rounded-lg">
                Payment instructions will be provided after document verification.
              </p>
            </div>
          </Card>

          {/* Digital Signature & Declaration */}
          <Card className="p-8">
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
                  I hereby declare that all the information provided above is
                  true and correct. I understand that the society will verify
                  all documents and maintenance dues before processing this NOC
                  request. I agree to pay all applicable fees and complete the
                  transfer process as per society norms.
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
          <Card className="p-6">
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!isFormValid() || submitting || checkingPending}
              >
                {submitting ? "Submitting..." : "Submit NOC Request"}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}
