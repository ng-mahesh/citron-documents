"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/Button";
import { nocRequestAPI, adminAPI, api, uploadApi } from "@/lib/api";
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
  Edit,
  Trash2,
  AlertCircle,
  IndianRupee,
  CreditCard,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Loader } from "@/components/ui/Loader";
import { theme } from "@/lib/theme";

export default function NocRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ackNo = params.ackNo as string;

  const [nocRequest, setNocRequest] = useState<{
    _id: string;
    acknowledgementNumber: string;
    sellerName: string;
    sellerEmail: string;
    sellerMobileNumber: string;
    sellerAlternateMobile?: string;
    flatNumber: string;
    wing: string;
    buyerName?: string;
    buyerMobileNumber?: string;
    buyerEmail?: string;
    reason?: string;
    nocType?: string;
    purposeDescription?: string;
    expectedTransferDate?: string;
    status: Status;
    paymentStatus?: string;
    paymentAmount?: number;
    submittedAt: string;
    updatedAt: string;
    createdAt?: string;
    digitalSignature?: string;
    nocFees?: number;
    transferFees?: number;
    totalAmount?: number;
    paymentTransactionId?: string;
    paymentDate?: string;
    paymentMethod?: string;
    adminRemarks?: string;
    agreementDocument?: { s3Key: string; fileName: string; fileType: string };
    shareCertificateDocument?: {
      s3Key: string;
      fileName: string;
      fileType: string;
    };
    maintenanceReceiptDocument?: {
      s3Key: string;
      fileName: string;
      fileType: string;
    };
    buyerAadhaarDocument?: {
      s3Key: string;
      fileName: string;
      fileType: string;
    };
    buyerPanDocument?: { s3Key: string; fileName: string; fileType: string };
    identityProofDocument?: {
      s3Key: string;
      fileName: string;
      fileType: string;
    };
    currentElectricityBillDocument?: {
      s3Key: string;
      fileName: string;
      fileType: string;
    };
    supportingDocuments?: { s3Key: string; fileName: string; fileType: string };
    paymentReceiptDocument?: {
      s3Key: string;
      fileName: string;
      fileType: string;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<Status>("Pending");
  const [adminRemarks, setAdminRemarks] = useState<string>("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedPaymentStatus, setSelectedPaymentStatus] =
    useState<string>("Pending");
  const [updatingPayment, setUpdatingPayment] = useState(false);
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
    sellerName: "",
    sellerEmail: "",
    sellerMobileNumber: "",
    flatNumber: "",
    wing: "",
    buyerName: "",
    buyerEmail: "",
    buyerMobileNumber: "",
  });
  const [updatingDetails, setUpdatingDetails] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState<string | null>(null);

  // Navigation state
  const [allNocRequests, setAllNocRequests] = useState<
    Array<{ acknowledgementNumber: string; status: Status }>
  >([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchNocRequestDetails();
    fetchAllNocRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ackNo]);

  const fetchAllNocRequests = async () => {
    try {
      const response = await nocRequestAPI.getAll();
      const nocs = response.data.data.map(
        (noc: { acknowledgementNumber: string; status: Status }) => ({
          acknowledgementNumber: noc.acknowledgementNumber,
          status: noc.status,
        })
      );
      setAllNocRequests(nocs);
      const index = nocs.findIndex(
        (noc: { acknowledgementNumber: string }) =>
          noc.acknowledgementNumber === ackNo
      );
      setCurrentIndex(index);
    } catch (error) {
      console.error("Failed to fetch all NOC requests:", error);
    }
  };

  const fetchNocRequestDetails = async () => {
    try {
      const response = await nocRequestAPI.getByAckNumber(ackNo);
      const requestData = response.data.data;
      setNocRequest(requestData);
      setSelectedStatus(requestData.status);
      setAdminRemarks(requestData.adminRemarks || "");
      setSelectedPaymentStatus(requestData.paymentStatus || "Pending");
      // Initialize edit data
      setEditData({
        sellerName: requestData.sellerName || "",
        sellerEmail: requestData.sellerEmail || "",
        sellerMobileNumber: requestData.sellerMobileNumber || "",
        flatNumber: requestData.flatNumber || "",
        wing: requestData.wing || "",
        buyerName: requestData.buyerName || "",
        buyerEmail: requestData.buyerEmail || "",
        buyerMobileNumber: requestData.buyerMobileNumber || "",
      });
    } catch (error) {
      console.error("Failed to fetch NOC request details:", error);
      setToast({
        message: "Failed to load NOC request details",
        type: "error",
      });
      setTimeout(() => router.push("/admin/dashboard"), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!nocRequest) {
      return;
    }

    setUpdatingStatus(true);
    try {
      await nocRequestAPI.update(nocRequest._id, {
        status: selectedStatus,
        adminRemarks: adminRemarks,
      });
      setNocRequest({
        ...nocRequest,
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
      setSelectedStatus(nocRequest.status);
      setAdminRemarks(nocRequest.adminRemarks || "");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePaymentStatusUpdate = async () => {
    if (!nocRequest) {
      return;
    }

    setUpdatingPayment(true);
    try {
      await nocRequestAPI.update(nocRequest._id, {
        paymentStatus: selectedPaymentStatus,
      });
      setNocRequest({
        ...nocRequest,
        paymentStatus: selectedPaymentStatus,
      });
      setToast({
        message: "Payment status updated successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to update payment status:", error);
      setToast({
        message: "Failed to update payment status. Please try again.",
        type: "error",
      });
      setSelectedPaymentStatus(nocRequest.paymentStatus || "");
    } finally {
      setUpdatingPayment(false);
    }
  };

  const openDocumentPopup = async (
    s3Key: string,
    fileName: string,
    fileType: string
  ) => {
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

  const handleEditToggle = () => {
    if (isEditMode) {
      // Cancel edit - reset to original values
      if (nocRequest) {
        setEditData({
          sellerName: nocRequest.sellerName || "",
          sellerEmail: nocRequest.sellerEmail || "",
          sellerMobileNumber: nocRequest.sellerMobileNumber || "",
          flatNumber: nocRequest.flatNumber || "",
          wing: nocRequest.wing || "",
          buyerName: nocRequest.buyerName || "",
          buyerEmail: nocRequest.buyerEmail || "",
          buyerMobileNumber: nocRequest.buyerMobileNumber || "",
        });
      }
    }
    setIsEditMode(!isEditMode);
  };

  const handleUpdateDetails = async () => {
    if (!nocRequest) return;

    setUpdatingDetails(true);
    try {
      await nocRequestAPI.update(nocRequest._id, editData);
      setNocRequest({
        ...nocRequest,
        ...editData,
      });
      setIsEditMode(false);
      setToast({
        message: "NOC request details updated successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to update NOC request details:", error);
      setToast({
        message: "Failed to update NOC request details. Please try again.",
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
    if (!file || !nocRequest) return;

    // Validate required NOC request data
    if (!nocRequest.flatNumber || !nocRequest.sellerName) {
      setToast({
        message: "NOC request data is incomplete. Please refresh the page.",
        type: "error",
      });
      return;
    }

    setUploadingDocument(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("flatNumber", nocRequest.flatNumber);
      formData.append("documentType", documentType);
      formData.append("fullName", nocRequest.sellerName);

      console.log("Uploading document:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        flatNumber: nocRequest.flatNumber,
        documentType,
        fullName: nocRequest.sellerName,
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

      // Add document to NOC request
      if (!nocRequest._id) {
        throw new Error("NOC request ID is missing");
      }
      await api.post(`/noc-request/${nocRequest._id}/documents`, documentData);

      // Refresh NOC request data
      await fetchNocRequestDetails();
      setToast({ message: "Document uploaded successfully", type: "success" });
    } catch (error: unknown) {
      console.error("Failed to upload document:", error);
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Failed to upload document. Please try again.";
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
    if (!nocRequest) return;

    setDeletingDocument(documentType);
    try {
      // Remove document from NOC request
      await api.delete(
        `/noc-request/${nocRequest._id}/documents/${documentType}`
      );

      // Delete file from S3
      await uploadApi.delete("/upload", { data: { key: s3Key } });

      // Refresh NOC request data
      await fetchNocRequestDetails();
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

  const handleGeneratePdf = async () => {
    if (!nocRequest) return;

    setGeneratingPdf(true);
    try {
      const response = await nocRequestAPI.downloadPdf(
        nocRequest.acknowledgementNumber
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `NOC_Request_${nocRequest.acknowledgementNumber}.pdf`;
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
      Pending:
        "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300",
      "Under Review":
        "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-300",
      Approved:
        "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300",
      Rejected:
        "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300",
      "Document Required":
        "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-300",
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

  const getPredefinedRemarks = (status: Status) => {
    const baseRemarks = {
      Pending: `NOC request marked as pending. Awaiting further review and required documents.`,
      "Under Review": `NOC request is currently under review. All submitted documents are being verified.`,
      Approved: `NOC request has been approved. NOC certificate will be issued shortly.`,
      Rejected: `NOC request has been rejected. Please check the requirements and resubmit.`,
      "Document Required": `Additional documents are required for NOC. Please upload the missing documents to proceed.`,
    };

    return baseRemarks[status] || "";
  };

  // Reserved for future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getPaymentStatusBadgeColor = (paymentStatus: string) => {
    const statusColors: { [key: string]: string } = {
      Pending: "bg-yellow-100 text-yellow-800",
      Paid: `${theme.status.approved.bg} ${theme.status.approved.text}`,
      Failed: "bg-red-100 text-red-800",
    };
    return statusColors[paymentStatus] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" message="Loading NOC request details..." />
      </div>
    );
  }

  if (!nocRequest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">NOC request not found</p>
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
                  className={`h-10 w-10 ${theme.iconBg.green} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                    NOC Request Details
                  </h1>
                  <p className="text-xs text-slate-500">
                    {nocRequest.acknowledgementNumber}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              {/* Next/Prev Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    if (currentIndex > 0) {
                      router.push(
                        `/admin/noc-request/${allNocRequests[currentIndex - 1].acknowledgementNumber}`
                      );
                    }
                  }}
                  disabled={currentIndex <= 0}
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  title="Previous application"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <Button
                  onClick={() => {
                    if (currentIndex < allNocRequests.length - 1) {
                      router.push(
                        `/admin/noc-request/${allNocRequests[currentIndex + 1].acknowledgementNumber}`
                      );
                    }
                  }}
                  disabled={currentIndex >= allNocRequests.length - 1}
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  title="Next application"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              {getStatusBadge(nocRequest.status)}
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
            {/* Seller Information */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  Seller / Owner Information
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
                        value={editData.sellerName}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            sellerName: e.target.value,
                          })
                        }
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      />
                    ) : (
                      <p className="text-base font-semibold text-slate-900 mt-1">
                        {nocRequest.sellerName}
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
                        <input
                          type="text"
                          value={editData.wing}
                          onChange={(e) =>
                            setEditData({ ...editData, wing: e.target.value })
                          }
                          placeholder="Wing"
                          className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                        />
                      </div>
                    ) : (
                      <p className="text-base font-semibold text-slate-900 mt-1">
                        {nocRequest.flatNumber} - Wing {nocRequest.wing}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                    {isEditMode ? (
                      <input
                        type="email"
                        value={editData.sellerEmail}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            sellerEmail: e.target.value,
                          })
                        }
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      />
                    ) : (
                      <p className="text-base text-slate-900 mt-1">
                        {nocRequest.sellerEmail}
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
                        value={editData.sellerMobileNumber}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            sellerMobileNumber: e.target.value,
                          })
                        }
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      />
                    ) : (
                      <p className="text-base text-slate-900 mt-1">
                        {nocRequest.sellerMobileNumber}
                      </p>
                    )}
                  </div>
                  {nocRequest.sellerAlternateMobile && (
                    <div>
                      <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        Alternate Mobile
                      </label>
                      <p className="text-base text-slate-900 mt-1">
                        {nocRequest.sellerAlternateMobile}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Submitted On
                    </label>
                    <p className="text-base text-slate-900 mt-1">
                      {nocRequest.createdAt
                        ? new Date(nocRequest.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : new Date(nocRequest.submittedAt).toLocaleDateString(
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
                      {nocRequest.digitalSignature}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* NOC Details */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="px-8 py-5 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  NOC & Transfer Details
                </h3>
              </div>
              <div className="px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      NOC Type
                    </label>
                    <p className="text-base font-semibold text-slate-900 mt-1">
                      {nocRequest.nocType || nocRequest.reason || "N/A"}
                    </p>
                  </div>

                  {/* Conditional: Show expected transfer date only for Flat Transfer */}
                  {nocRequest.nocType === "Flat Transfer/Sale/Purchase" &&
                    nocRequest.expectedTransferDate && (
                      <div>
                        <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Expected Transfer Date
                        </label>
                        <p className="text-base text-slate-900 mt-1">
                          {new Date(
                            nocRequest.expectedTransferDate
                          ).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    )}

                  {/* Conditional: Show purpose description for Other type */}
                  {nocRequest.nocType === "Other Purpose" &&
                    nocRequest.purposeDescription && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-slate-500">
                          Purpose Description
                        </label>
                        <p className="text-base text-slate-900 mt-1 bg-slate-50 p-4 rounded-lg">
                          {nocRequest.purposeDescription}
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Buyer Information - Only show for Flat Transfer */}
            {nocRequest.nocType === "Flat Transfer/Sale/Purchase" && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="px-8 py-5 border-b border-slate-200">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-green-600" />
                    Buyer Information
                  </h3>
                </div>
                <div className="px-8 py-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-slate-500">
                        Buyer Name
                      </label>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editData.buyerName}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              buyerName: e.target.value,
                            })
                          }
                          className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                        />
                      ) : (
                        <p className="text-base font-semibold text-slate-900 mt-1">
                          {nocRequest.buyerName}
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
                          value={editData.buyerMobileNumber}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              buyerMobileNumber: e.target.value,
                            })
                          }
                          className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                        />
                      ) : (
                        <p className="text-base text-slate-900 mt-1">
                          {nocRequest.buyerMobileNumber}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        Email
                      </label>
                      {isEditMode ? (
                        <input
                          type="email"
                          value={editData.buyerEmail}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              buyerEmail: e.target.value,
                            })
                          }
                          className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                        />
                      ) : (
                        <p className="text-base text-slate-900 mt-1">
                          {nocRequest.buyerEmail}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Details - Only show if totalAmount > 0 */}
            {(nocRequest.totalAmount ?? 0) > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="px-8 py-5 border-b border-slate-200">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-green-600" />
                    Payment Information
                  </h3>
                </div>
                <div className="px-8 py-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-3 mb-2">
                          <IndianRupee className="h-5 w-5 text-slate-600" />
                          <label className="text-sm font-medium text-slate-600">
                            NOC Fees
                          </label>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">
                          ₹{nocRequest.nocFees || 1000}
                        </p>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-3 mb-2">
                          <IndianRupee className="h-5 w-5 text-slate-600" />
                          <label className="text-sm font-medium text-slate-600">
                            Transfer Fees
                          </label>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">
                          ₹{nocRequest.transferFees || 25000}
                        </p>
                      </div>
                      <div
                        className={`p-6 ${theme.status.approved.bg} rounded-xl border-2 ${theme.status.approved.border}`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <IndianRupee
                            className={`h-5 w-5 ${theme.status.approved.text}`}
                          />
                          <label
                            className={`text-sm font-medium ${theme.status.approved.text}`}
                          >
                            Total Amount
                          </label>
                        </div>
                        <p
                          className={`text-2xl font-bold ${theme.status.approved.text}`}
                        >
                          ₹{nocRequest.totalAmount || 26000}
                        </p>
                      </div>
                    </div>
                    {nocRequest.paymentTransactionId && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                            <CreditCard className="h-4 w-4" />
                            Transaction ID
                          </label>
                          <p className="text-base text-slate-900 mt-1 font-mono">
                            {nocRequest.paymentTransactionId}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Payment Date
                          </label>
                          <p className="text-base text-slate-900 mt-1">
                            {nocRequest.paymentDate
                              ? new Date(
                                  nocRequest.paymentDate
                                ).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })
                              : "Pending"}
                          </p>
                        </div>
                        {nocRequest.paymentMethod && (
                          <div>
                            <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                              <CreditCard className="h-4 w-4" />
                              Payment Method
                            </label>
                            <p className="text-base text-slate-900 mt-1">
                              {nocRequest.paymentMethod}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
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
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => {
                      const newStatus = e.target.value as Status;
                      setSelectedStatus(newStatus);
                      // Auto-populate admin remarks with predefined message
                      if (nocRequest) {
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
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2.5 bg-white text-slate-900 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
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
                    (selectedStatus === nocRequest.status &&
                      adminRemarks === (nocRequest.adminRemarks || ""))
                  }
                  isLoading={updatingStatus}
                  className="w-full gap-2"
                >
                  <Save className="h-4 w-4" />
                  {updatingStatus ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </div>

            {/* Payment Status Update */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">
                  Payment Status
                </h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Payment Status
                  </label>
                  <select
                    value={selectedPaymentStatus}
                    onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2.5 bg-white text-slate-900 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    disabled={updatingPayment}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
                <Button
                  onClick={handlePaymentStatusUpdate}
                  disabled={
                    updatingPayment ||
                    selectedPaymentStatus === nocRequest.paymentStatus
                  }
                  isLoading={updatingPayment}
                  className="w-full gap-2"
                >
                  <Save className="h-4 w-4" />
                  {updatingPayment ? "Updating..." : "Update Payment"}
                </Button>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Documents</h3>
              </div>
              <div className="px-6 py-4 space-y-3">
                {/* Agreement Document */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <FileText className="h-8 w-8 text-slate-600 flex-shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      Agreement Copy
                    </p>
                    {nocRequest.agreementDocument ? (
                      <p className="text-xs text-slate-600 truncate">
                        {nocRequest.agreementDocument!.fileName}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500">
                        No document uploaded
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {nocRequest.agreementDocument && (
                      <>
                        <button
                          onClick={() =>
                            openDocumentPopup(
                              nocRequest.agreementDocument!.s3Key,
                              nocRequest.agreementDocument!.fileName,
                              nocRequest.agreementDocument!.fileType
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
                              "agreement",
                              nocRequest.agreementDocument!.s3Key
                            )
                          }
                          disabled={deletingDocument === "agreement"}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete document"
                        >
                          {deletingDocument === "agreement" ? (
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
                        onChange={(e) => handleFileUpload(e, "agreement")}
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

                {/* Share Certificate Document */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <FileText className="h-8 w-8 text-slate-600 flex-shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      Share Certificate
                    </p>
                    {nocRequest.shareCertificateDocument ? (
                      <p className="text-xs text-slate-600 truncate">
                        {nocRequest.shareCertificateDocument!.fileName}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500">
                        No document uploaded
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {nocRequest.shareCertificateDocument && (
                      <>
                        <button
                          onClick={() =>
                            openDocumentPopup(
                              nocRequest.shareCertificateDocument!.s3Key,
                              nocRequest.shareCertificateDocument!.fileName,
                              nocRequest.shareCertificateDocument!.fileType
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
                              "shareCertificate",
                              nocRequest.shareCertificateDocument!.s3Key
                            )
                          }
                          disabled={deletingDocument === "shareCertificate"}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete document"
                        >
                          {deletingDocument === "shareCertificate" ? (
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
                          handleFileUpload(e, "shareCertificate")
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

                {/* Buyer Aadhaar Document */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <FileText className="h-8 w-8 text-slate-600 flex-shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      Buyer Aadhaar Card
                    </p>
                    {nocRequest.buyerAadhaarDocument ? (
                      <p className="text-xs text-slate-600 truncate">
                        {nocRequest.buyerAadhaarDocument!.fileName}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500">
                        No document uploaded
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {nocRequest.buyerAadhaarDocument && (
                      <>
                        <button
                          onClick={() =>
                            openDocumentPopup(
                              nocRequest.buyerAadhaarDocument!.s3Key,
                              nocRequest.buyerAadhaarDocument!.fileName,
                              nocRequest.buyerAadhaarDocument!.fileType
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
                              "buyerAadhaar",
                              nocRequest.buyerAadhaarDocument!.s3Key
                            )
                          }
                          disabled={deletingDocument === "buyerAadhaar"}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete document"
                        >
                          {deletingDocument === "buyerAadhaar" ? (
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
                        onChange={(e) => handleFileUpload(e, "buyerAadhaar")}
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

                {/* Buyer PAN Document */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <FileText className="h-8 w-8 text-slate-600 flex-shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      Buyer PAN Card
                    </p>
                    {nocRequest.buyerPanDocument ? (
                      <p className="text-xs text-slate-600 truncate">
                        {nocRequest.buyerPanDocument!.fileName}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500">
                        No document uploaded
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {nocRequest.buyerPanDocument && (
                      <>
                        <button
                          onClick={() =>
                            openDocumentPopup(
                              nocRequest.buyerPanDocument!.s3Key,
                              nocRequest.buyerPanDocument!.fileName,
                              nocRequest.buyerPanDocument!.fileType
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
                              "buyerPan",
                              nocRequest.buyerPanDocument!.s3Key
                            )
                          }
                          disabled={deletingDocument === "buyerPan"}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete document"
                        >
                          {deletingDocument === "buyerPan" ? (
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
                        onChange={(e) => handleFileUpload(e, "buyerPan")}
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

                {/* Payment Receipt (uploaded by applicant) */}
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    nocRequest.paymentReceiptDocument
                      ? "bg-amber-50 border-amber-300"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <IndianRupee
                    className={`h-8 w-8 flex-shrink-0 ${
                      nocRequest.paymentReceiptDocument
                        ? "text-amber-600"
                        : "text-slate-400"
                    }`}
                  />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      Payment Receipt{" "}
                      <span className="text-xs font-normal text-slate-500">
                        (by applicant)
                      </span>
                    </p>
                    {nocRequest.paymentReceiptDocument ? (
                      <p className="text-xs text-amber-700 truncate font-medium">
                        {nocRequest.paymentReceiptDocument.fileName}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500">Not yet uploaded</p>
                    )}
                  </div>
                  {nocRequest.paymentReceiptDocument && (
                    <button
                      onClick={() =>
                        openDocumentPopup(
                          nocRequest.paymentReceiptDocument!.s3Key,
                          nocRequest.paymentReceiptDocument!.fileName,
                          nocRequest.paymentReceiptDocument!.fileType
                        )
                      }
                      className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                      title="View payment receipt"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
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
                      {nocRequest.nocType === "Flat Transfer/Sale/Purchase"
                        ? "The seller has accepted all terms and conditions, confirmed that the information provided is accurate, and agreed to pay all applicable fees and complete the transfer process as per society norms."
                        : "The applicant has confirmed that all the information provided is accurate and understands that the society will verify all submitted documents before processing this NOC request."}
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
                  Download the official NOC request form PDF with all submitted
                  details.
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
                    : "Generate NOC Request Form"}
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
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
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
