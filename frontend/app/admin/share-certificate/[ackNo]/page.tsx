"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { shareCertificateAPI, adminAPI } from "@/lib/api";
import { Status } from "@/lib/types";
import { ToastContainer, ToastType } from "@/components/ui/Toast";
import {
  FileText,
  ArrowLeft,
  Eye,
  User,
  MapPin,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Download,
  X,
  Save,
  Home,
  Ruler,
} from "lucide-react";
import { Loader } from "@/components/ui/Loader";
import { theme } from "@/lib/theme";

export default function ShareCertificateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ackNo = params.ackNo as string;

  const [certificate, setCertificate] = useState<{
    _id: string;
    acknowledgementNumber: string;
    fullName: string;
    index2ApplicantNames?: string[];
    flatNumber: string;
    wing: string;
    email: string;
    mobileNumber: string;
    carpetArea?: number;
    builtUpArea?: number;
    membershipType: string;
    status: Status;
    submittedAt: string;
    updatedAt: string;
    createdAt: string;
    adminRemarks?: string;
    digitalSignature?: string;
    index2Document?: { s3Key: string; fileName: string; fileType: string };
    possessionLetterDocument?: {
      s3Key: string;
      fileName: string;
      fileType: string;
    };
    aadhaarCardDocument?: {
      s3Key: string;
      fileName: string;
      fileType: string;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<Status>("Pending");
  const [adminRemarks, setAdminRemarks] = useState<string>("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);
  const [documentPopup, setDocumentPopup] = useState<{
    isOpen: boolean;
    url: string;
    fileName: string;
    fileType: string;
    loading?: boolean;
  } | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchCertificateDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ackNo]);

  const fetchCertificateDetails = async () => {
    try {
      const response = await shareCertificateAPI.getByAckNumber(ackNo);
      setCertificate(response.data.data);
      setSelectedStatus(response.data.data.status);
      setAdminRemarks(response.data.data.adminRemarks || "");
    } catch (error) {
      console.error("Failed to fetch certificate details:", error);
      setToast({
        message: "Failed to load certificate details",
        type: "error",
      });
      setTimeout(() => router.push("/admin/dashboard"), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!certificate) {
      return;
    }

    setUpdatingStatus(true);
    try {
      await shareCertificateAPI.update(certificate._id, {
        status: selectedStatus,
        adminRemarks: adminRemarks,
      });
      setCertificate({
        ...certificate,
        status: selectedStatus,
        adminRemarks: adminRemarks,
      });
      setToast({ message: "Status updated successfully", type: "success" });
    } catch (error) {
      console.error("Failed to update status:", error);
      setToast({
        message: "Failed to update status. Please try again.",
        type: "error",
      });
      setSelectedStatus(certificate.status);
      setAdminRemarks(certificate.adminRemarks || "");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openDocumentPopup = async (
    s3Key: string,
    fileName: string,
    fileType: string
  ) => {
    // Show loading state
    setDocumentPopup({
      isOpen: true,
      url: "",
      fileName,
      fileType,
      loading: true,
    });

    try {
      const response = await adminAPI.getDocumentPresignedUrl(s3Key);
      const presignedUrl = response.data.data.presignedUrl;
      setDocumentPopup({
        isOpen: true,
        url: presignedUrl,
        fileName,
        fileType,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to fetch document URL:", error);
      setToast({
        message: "Failed to load document. Please try again.",
        type: "error",
      });
      setDocumentPopup(null);
    }
  };

  const closeDocumentPopup = () => {
    setDocumentPopup(null);
  };

  const handleGeneratePdf = async () => {
    if (!certificate) return;

    setGeneratingPdf(true);
    try {
      const response = await shareCertificateAPI.downloadPdf(
        certificate.acknowledgementNumber
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ShareCertificate_${certificate.acknowledgementNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setToast({ message: "PDF generated successfully", type: "success" });
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      setToast({
        message: "Failed to generate PDF. Please try again.",
        type: "error",
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Pending: `${theme.status.pending.bg} ${theme.status.pending.text} border ${theme.status.pending.border}`,
      "Under Review": `${theme.status.underReview.bg} ${theme.status.underReview.text} border ${theme.status.underReview.border}`,
      Approved: `${theme.status.approved.bg} ${theme.status.approved.text} border ${theme.status.approved.border}`,
      Rejected: `${theme.status.rejected.bg} ${theme.status.rejected.text} border ${theme.status.rejected.border}`,
      "Document Required": `${theme.status.documentRequired.bg} ${theme.status.documentRequired.text} border ${theme.status.documentRequired.border}`,
    };
    return (
      <span
        className={`px-4 py-2 rounded-lg text-sm font-bold ${
          colors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  const getMembershipTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      Primary: "Primary Member",
      Spouse: "Spouse",
      Son: "Son",
      Daughter: "Daughter",
      "Legal Heir": "Legal Heir",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <Loader size="lg" message="Loading certificate details..." />
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Certificate not found</p>
          <Button
            onClick={() => router.push("/admin/dashboard")}
            className="mt-4"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <Button
                onClick={() => router.push("/admin/dashboard")}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 ${theme.iconBg.primary} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                    Share Certificate Details
                  </h1>
                  <p className="text-xs text-slate-500">
                    {certificate.acknowledgementNumber}
                  </p>
                </div>
              </div>
            </div>
            <div className="self-end sm:self-auto">
              {getStatusBadge(certificate.status)}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Member Information */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="px-8 py-5 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  Member Information
                </h3>
              </div>
              <div className="px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Full Name
                    </label>
                    <p className="text-base font-semibold text-slate-900 mt-1">
                      {certificate.fullName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Flat & Wing
                    </label>
                    <p className="text-base font-semibold text-slate-900 mt-1">
                      {certificate.flatNumber} - Wing {certificate.wing}
                    </p>
                  </div>
                  {certificate.index2ApplicantNames &&
                    certificate.index2ApplicantNames.length > 0 && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                          <User className="h-4 w-4" />
                          Index-2 Applicant Names
                        </label>
                        <div className="mt-2 space-y-2">
                          {certificate.index2ApplicantNames.map(
                            (name: string, index: number) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 ${theme.status.pending.bg} border ${theme.status.pending.border} rounded-lg px-3 py-2"
                              >
                                <span className="text-xs font-bold text-blue-700 bg-blue-200 rounded-full h-6 w-6 flex items-center justify-center">
                                  {index + 1}
                                </span>
                                <p className="text-base text-slate-900">
                                  {name}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  <div>
                    <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                    <p className="text-base text-slate-900 mt-1">
                      {certificate.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      Mobile
                    </label>
                    <p className="text-base text-slate-900 mt-1">
                      {certificate.mobileNumber}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                      <User className="h-4 w-4" />
                      Membership Type
                    </label>
                    <p className="text-base font-semibold text-slate-900 mt-1">
                      {getMembershipTypeLabel(certificate.membershipType)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Submitted On
                    </label>
                    <p className="text-base text-slate-900 mt-1">
                      {new Date(certificate.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Digital Signature
                    </label>
                    <p className="text-base italic text-slate-900 mt-1">
                      {certificate.digitalSignature}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="px-8 py-5 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Home className="h-5 w-5 text-blue-600" />
                  Property Details
                </h3>
              </div>
              <div className="px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {certificate.carpetArea && (
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border-2 border-blue-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Ruler className="h-5 w-5 text-blue-600" />
                        <label className="text-sm font-medium text-slate-600">
                          Carpet Area
                        </label>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">
                        {certificate.carpetArea} sq.ft
                      </p>
                    </div>
                  )}
                  {certificate.builtUpArea && (
                    <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border-2 border-emerald-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Ruler className="h-5 w-5 text-emerald-600" />
                        <label className="text-sm font-medium text-slate-600">
                          Built-up Area
                        </label>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">
                        {certificate.builtUpArea} sq.ft
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Status Update */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">
                  Update Status
                </h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Change Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) =>
                      setSelectedStatus(e.target.value as Status)
                    }
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2.5 bg-white text-slate-900 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    disabled={updatingStatus}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Document Required">Document Required</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Admin Remarks
                  </label>
                  <textarea
                    value={adminRemarks}
                    onChange={(e) => setAdminRemarks(e.target.value)}
                    placeholder="Add notes or reasons for status change..."
                    rows={4}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2.5 bg-white text-slate-900 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                    disabled={updatingStatus}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    These remarks will be included in the exported Excel file
                  </p>
                </div>
                <Button
                  onClick={handleStatusUpdate}
                  disabled={
                    updatingStatus ||
                    (selectedStatus === certificate.status &&
                      adminRemarks === (certificate.adminRemarks || ""))
                  }
                  isLoading={updatingStatus}
                  className="w-full gap-2"
                >
                  <Save className="h-4 w-4" />
                  {updatingStatus ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Documents</h3>
              </div>
              <div className="px-6 py-4 space-y-3">
                {/* Index-2 */}
                {certificate.index2Document && (
                  <button
                    onClick={() =>
                      openDocumentPopup(
                        certificate.index2Document!.s3Key,
                        certificate.index2Document!.fileName,
                        certificate.index2Document!.fileType
                      )
                    }
                    className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                  >
                    <FileText className="h-8 w-8 text-slate-600 flex-shrink-0" />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        Index-2 Document
                      </p>
                      <p className="text-xs text-slate-600 truncate">
                        {certificate.index2Document!.fileName}
                      </p>
                    </div>
                    <Eye className="h-5 w-5 text-slate-600 flex-shrink-0" />
                  </button>
                )}

                {/* Possession Letter */}
                {certificate.possessionLetterDocument && (
                  <button
                    onClick={() =>
                      openDocumentPopup(
                        certificate.possessionLetterDocument!.s3Key,
                        certificate.possessionLetterDocument!.fileName,
                        certificate.possessionLetterDocument!.fileType
                      )
                    }
                    className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                  >
                    <FileText className="h-8 w-8 text-slate-600 flex-shrink-0" />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        Possession Letter
                      </p>
                      <p className="text-xs text-slate-600 truncate">
                        {certificate.possessionLetterDocument!.fileName}
                      </p>
                    </div>
                    <Eye className="h-5 w-5 text-slate-600 flex-shrink-0" />
                  </button>
                )}

                {/* Aadhaar Card */}
                {certificate.aadhaarCardDocument && (
                  <button
                    onClick={() =>
                      openDocumentPopup(
                        certificate.aadhaarCardDocument!.s3Key,
                        certificate.aadhaarCardDocument!.fileName,
                        certificate.aadhaarCardDocument!.fileType
                      )
                    }
                    className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                  >
                    <FileText className="h-8 w-8 text-slate-600 flex-shrink-0" />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        Aadhaar Card
                      </p>
                      <p className="text-xs text-slate-600 truncate">
                        {certificate.aadhaarCardDocument!.fileName}
                      </p>
                    </div>
                    <Eye className="h-5 w-5 text-slate-600 flex-shrink-0" />
                  </button>
                )}
              </div>
            </div>

            {/* Declaration */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">
                  Declaration
                </h3>
              </div>
              <div className="px-6 py-4">
                <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">
                      Declaration Accepted
                    </p>
                    <p className="text-xs text-slate-600">
                      The member has accepted all terms and conditions and
                      confirmed that the information provided is accurate.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Form */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">
                  Generate Form
                </h3>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-slate-600 mb-4">
                  Download the official share certificate application form PDF
                  with all submitted details.
                </p>
                <Button
                  onClick={handleGeneratePdf}
                  disabled={generatingPdf}
                  isLoading={generatingPdf}
                  className="w-full gap-2"
                >
                  <Download className="h-4 w-4" />
                  {generatingPdf
                    ? "Generating..."
                    : "Generate Application Form"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer Popup */}
      {documentPopup && documentPopup.isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeDocumentPopup}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Document Viewer
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-md">
                    {documentPopup.fileName}
                  </p>
                </div>
              </div>
              <button
                onClick={closeDocumentPopup}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            {/* Document Content */}
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              {documentPopup.loading ? (
                <div className="flex items-center justify-center min-h-[60vh]">
                  <Loader size="lg" message="Loading document..." />
                </div>
              ) : documentPopup.fileType?.includes("pdf") ? (
                <iframe
                  src={documentPopup.url}
                  className="w-full h-[70vh] border-0 rounded-lg"
                  title={documentPopup.fileName}
                />
              ) : (
                <div className="flex items-center justify-center bg-slate-50 rounded-lg p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={documentPopup.url}
                    alt={documentPopup.fileName}
                    className="max-w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
              {documentPopup.loading ? (
                <div className="px-4 py-2 bg-slate-300 text-slate-500 rounded-lg cursor-not-allowed font-medium text-sm inline-flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Document
                </div>
              ) : (
                <a
                  href={documentPopup.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-4 py-2 ${theme.button.primary.bg} ${theme.button.primary.text} rounded-lg ${theme.button.primary.hover} transition-colors font-medium text-sm`}
                >
                  <Download className="h-4 w-4" />
                  Download Document
                </a>
              )}
              <Button onClick={closeDocumentPopup} variant="outline" size="sm">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <ToastContainer toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
