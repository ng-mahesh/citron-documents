"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/Button";
import { shareCertificateAPI, adminAPI, api, uploadApi } from "@/lib/api";
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
  Edit,
  Trash2,
  Upload,
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

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({
    fullName: "",
    flatNumber: "",
    wing: "C" as "C" | "D",
    email: "",
    mobileNumber: "",
    membershipType: "",
    digitalSignature: "",
  });
  const [updatingDetails, setUpdatingDetails] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState<string | null>(null);

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
      const certData = response.data.data;
      setCertificate(certData);
      setSelectedStatus(certData.status);
      setAdminRemarks(certData.adminRemarks || "");
      // Initialize edit data
      setEditData({
        fullName: certData.fullName || "",
        flatNumber: certData.flatNumber || "",
        wing: (certData.wing as "C" | "D") || "C",
        email: certData.email || "",
        mobileNumber: certData.mobileNumber || "",
        membershipType: certData.membershipType || "",
        digitalSignature: certData.digitalSignature || "",
      });
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

  const handleEditToggle = () => {
    if (isEditMode) {
      // Cancel edit - reset to original values
      if (certificate) {
        setEditData({
          fullName: certificate.fullName || "",
          flatNumber: certificate.flatNumber || "",
          wing: (certificate.wing as "C" | "D") || "C",
          email: certificate.email || "",
          mobileNumber: certificate.mobileNumber || "",
          membershipType: certificate.membershipType || "",
          digitalSignature: certificate.digitalSignature || "",
        });
      }
    }
    setIsEditMode(!isEditMode);
  };

  const handleUpdateDetails = async () => {
    if (!certificate) return;

    setUpdatingDetails(true);
    try {
      await shareCertificateAPI.update(certificate._id, editData);
      setCertificate({
        ...certificate,
        ...editData,
      });
      setIsEditMode(false);
      setToast({
        message: "Certificate details updated successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to update certificate details:", error);
      setToast({
        message: "Failed to update certificate details. Please try again.",
        type: "error",
      });
    } finally {
      setUpdatingDetails(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    documentType: string
  ) => {
    const file = event.target.files?.[0];
    if (!file || !certificate) return;

    // Validate required certificate data
    if (!certificate.flatNumber || !certificate.fullName) {
      setToast({
        message: "Certificate data is incomplete. Please refresh the page.",
        type: "error",
      });
      return;
    }

    setUploadingDocument(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("flatNumber", certificate.flatNumber);
      formData.append("documentType", documentType);
      formData.append("fullName", certificate.fullName);

      console.log("Uploading document:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        flatNumber: certificate.flatNumber,
        documentType,
        fullName: certificate.fullName,
      });

      // Upload file
      const uploadResponse = await uploadApi.post("/upload", formData);

      const documentData = {
        documentType,
        s3Key: uploadResponse.data.data.s3Key,
        fileName: uploadResponse.data.data.fileName,
        fileType: uploadResponse.data.data.fileType,
        fileSize: uploadResponse.data.data.fileSize,
        uploadedAt: uploadResponse.data.data.uploadedAt,
      };

      // Add document to certificate
      if (!certificate._id) {
        throw new Error("Certificate ID is missing");
      }
      await api.post(
        `/share-certificate/${certificate._id}/documents`,
        documentData
      );

      // Refresh certificate data
      await fetchCertificateDetails();
      setToast({ message: "Document uploaded successfully", type: "success" });
    } catch (error: unknown) {
      console.error("Failed to upload document:", error);
      const errorMessage = error instanceof AxiosError ? error.response?.data?.message : "Failed to upload document. Please try again.";
      setToast({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setUploadingDocument(false);
      // Reset file input
      event.target.value = "";
    }
  };

  const handleDeleteDocument = async (documentType: string, s3Key: string) => {
    if (!certificate) return;

    setDeletingDocument(documentType);
    try {
      // Remove document from certificate
      await api.delete(
        `/share-certificate/${certificate._id}/documents/${documentType}`
      );

      // Delete file from S3
      await uploadApi.delete("/upload", { data: { key: s3Key } });

      // Refresh certificate data
      await fetchCertificateDetails();
      setToast({ message: "Document deleted successfully", type: "success" });
    } catch (error) {
      console.error("Failed to delete document:", error);
      setToast({
        message: "Failed to delete document. Please try again.",
        type: "error",
      });
    } finally {
      setDeletingDocument(null);
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

  const getPredefinedRemarks = (status: Status) => {
    const baseRemarks = {
      Pending: `Application marked as pending. Awaiting further review and required documents.`,
      "Under Review": `Application is currently under review. All submitted documents are being verified.`,
      Approved: `Application has been approved. Share certificate will be issued shortly.`,
      Rejected: `Application has been rejected. Please check the requirements and resubmit.`,
      "Document Required": `Additional documents are required. Please upload the missing documents to proceed.`,
    };

    return baseRemarks[status] || "";
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
            <div className="flex items-center gap-3 self-end sm:self-auto">
              {getStatusBadge(certificate.status)}
              <Button
                onClick={handleEditToggle}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                {isEditMode ? "Cancel Edit" : "Edit Details"}
              </Button>
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
              <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  Member Information
                </h3>
                {isEditMode && (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleUpdateDetails}
                      disabled={updatingDetails}
                      isLoading={updatingDetails}
                      size="sm"
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button
                      onClick={handleEditToggle}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
              <div className="px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Full Name
                    </label>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editData.fullName}
                        onChange={(e) =>
                          setEditData({ ...editData, fullName: e.target.value })
                        }
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      />
                    ) : (
                      <p className="text-base font-semibold text-slate-900 mt-1">
                        {certificate.fullName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Flat & Wing
                    </label>
                    {isEditMode ? (
                      <div className="flex gap-2 mt-1">
                        <input
                          type="text"
                          value={editData.flatNumber}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              flatNumber: e.target.value,
                            })
                          }
                          placeholder="Flat Number"
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                        />
                        <select
                          value={editData.wing}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              wing: e.target.value as "C" | "D",
                            })
                          }
                          className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                        >
                          <option value="C">Wing C</option>
                          <option value="D">Wing D</option>
                        </select>
                      </div>
                    ) : (
                      <p className="text-base font-semibold text-slate-900 mt-1">
                        {certificate.flatNumber} - Wing {certificate.wing}
                      </p>
                    )}
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
                    {isEditMode ? (
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) =>
                          setEditData({ ...editData, email: e.target.value })
                        }
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      />
                    ) : (
                      <p className="text-base text-slate-900 mt-1">
                        {certificate.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      Mobile
                    </label>
                    {isEditMode ? (
                      <input
                        type="tel"
                        value={editData.mobileNumber}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            mobileNumber: e.target.value,
                          })
                        }
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      />
                    ) : (
                      <p className="text-base text-slate-900 mt-1">
                        {certificate.mobileNumber}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                      <User className="h-4 w-4" />
                      Membership Type
                    </label>
                    {isEditMode ? (
                      <select
                        value={editData.membershipType}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            membershipType: e.target.value,
                          })
                        }
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      >
                        <option value="Primary">Primary Member</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Son">Son</option>
                        <option value="Daughter">Daughter</option>
                        <option value="Legal Heir">Legal Heir</option>
                      </select>
                    ) : (
                      <p className="text-base font-semibold text-slate-900 mt-1">
                        {getMembershipTypeLabel(certificate.membershipType)}
                      </p>
                    )}
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
                  <div className={isEditMode ? "md:col-span-2" : ""}>
                    <label className="text-sm font-medium text-slate-500">
                      Digital Signature
                    </label>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editData.digitalSignature}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            digitalSignature: e.target.value,
                          })
                        }
                        placeholder="Enter digital signature"
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      />
                    ) : (
                      <p className="text-base italic text-slate-900 mt-1">
                        {certificate.digitalSignature}
                      </p>
                    )}
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
                    onChange={(e) => {
                      const newStatus = e.target.value as Status;
                      setSelectedStatus(newStatus);
                      // Auto-populate admin remarks with predefined message
                      if (certificate) {
                        setAdminRemarks(getPredefinedRemarks(newStatus));
                      }
                    }}
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
                    placeholder="Predefined remarks are auto-populated. You can customize them if needed..."
                    rows={4}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2.5 bg-white text-slate-900 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                    disabled={updatingStatus}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Remarks are auto-populated based on status. Customize as
                    needed. These will be included in the exported Excel file.
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
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <FileText className="h-8 w-8 text-slate-600 flex-shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      Index-2 Document
                    </p>
                    {certificate.index2Document ? (
                      <p className="text-xs text-slate-600 truncate">
                        {certificate.index2Document!.fileName}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500">
                        No document uploaded
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {certificate.index2Document && (
                      <>
                        <button
                          onClick={() =>
                            openDocumentPopup(
                              certificate.index2Document!.s3Key,
                              certificate.index2Document!.fileName,
                              certificate.index2Document!.fileType
                            )
                          }
                          className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                          title="View document"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteDocument(
                              "index2",
                              certificate.index2Document!.s3Key
                            )
                          }
                          disabled={deletingDocument === "index2"}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete document"
                        >
                          {deletingDocument === "index2" ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </>
                    )}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, "index2")}
                        disabled={uploadingDocument}
                        className="hidden"
                      />
                      <div className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        {uploadingDocument ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Possession Letter */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <FileText className="h-8 w-8 text-slate-600 flex-shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      Possession Letter
                    </p>
                    {certificate.possessionLetterDocument ? (
                      <p className="text-xs text-slate-600 truncate">
                        {certificate.possessionLetterDocument!.fileName}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500">
                        No document uploaded
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {certificate.possessionLetterDocument && (
                      <>
                        <button
                          onClick={() =>
                            openDocumentPopup(
                              certificate.possessionLetterDocument!.s3Key,
                              certificate.possessionLetterDocument!.fileName,
                              certificate.possessionLetterDocument!.fileType
                            )
                          }
                          className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                          title="View document"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteDocument(
                              "possessionLetter",
                              certificate.possessionLetterDocument!.s3Key
                            )
                          }
                          disabled={deletingDocument === "possessionLetter"}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete document"
                        >
                          {deletingDocument === "possessionLetter" ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </>
                    )}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          handleFileUpload(e, "possessionLetter")
                        }
                        disabled={uploadingDocument}
                        className="hidden"
                      />
                      <div className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        {uploadingDocument ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Aadhaar Card */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <FileText className="h-8 w-8 text-slate-600 flex-shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      Aadhaar Card
                    </p>
                    {certificate.aadhaarCardDocument ? (
                      <p className="text-xs text-slate-600 truncate">
                        {certificate.aadhaarCardDocument!.fileName}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500">
                        No document uploaded
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {certificate.aadhaarCardDocument && (
                      <>
                        <button
                          onClick={() =>
                            openDocumentPopup(
                              certificate.aadhaarCardDocument!.s3Key,
                              certificate.aadhaarCardDocument!.fileName,
                              certificate.aadhaarCardDocument!.fileType
                            )
                          }
                          className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                          title="View document"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteDocument(
                              "aadhaarCard",
                              certificate.aadhaarCardDocument!.s3Key
                            )
                          }
                          disabled={deletingDocument === "aadhaarCard"}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete document"
                        >
                          {deletingDocument === "aadhaarCard" ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </>
                    )}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, "aadhaarCard")}
                        disabled={uploadingDocument}
                        className="hidden"
                      />
                      <div className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        {uploadingDocument ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </div>
                    </label>
                  </div>
                </div>
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
