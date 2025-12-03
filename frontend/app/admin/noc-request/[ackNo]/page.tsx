"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { nocRequestAPI, adminAPI } from "@/lib/api";
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
  IndianRupee,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { Loader } from "@/components/ui/Loader";

export default function NocRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ackNo = params.ackNo as string;

  const [nocRequest, setNocRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<Status>("Pending");
  const [adminRemarks, setAdminRemarks] = useState<string>("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("Pending");
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

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchNocRequestDetails();
  }, [ackNo]);

  const fetchNocRequestDetails = async () => {
    try {
      const response = await nocRequestAPI.getByAckNumber(ackNo);
      setNocRequest(response.data.data);
      setSelectedStatus(response.data.data.status);
      setAdminRemarks(response.data.data.adminRemarks || "");
      setSelectedPaymentStatus(response.data.data.paymentStatus || "Pending");
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
      setToast({ message: "Payment status updated successfully", type: "success" });
    } catch (error) {
      console.error("Failed to update payment status:", error);
      setToast({
        message: "Failed to update payment status. Please try again.",
        type: "error",
      });
      setSelectedPaymentStatus(nocRequest.paymentStatus);
    } finally {
      setUpdatingPayment(false);
    }
  };

  const openDocumentPopup = async (
    s3Key: string,
    fileName: string,
    fileType: string
  ) => {
    setDocumentPopup({ isOpen: true, url: "", fileName, fileType, loading: true });

    try {
      const response = await adminAPI.getDocumentPresignedUrl(s3Key);
      const presignedUrl = response.data.data.presignedUrl;
      setDocumentPopup({ isOpen: true, url: presignedUrl, fileName, fileType, loading: false });
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
    if (!nocRequest) return;

    setGeneratingPdf(true);
    try {
      const response = await nocRequestAPI.downloadPdf(nocRequest.acknowledgementNumber);
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
    } catch (error: any) {
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
        }`}>
        {status}
      </span>
    );
  };

  const getPaymentStatusBadgeColor = (paymentStatus: string) => {
    const statusColors: { [key: string]: string } = {
      Pending: "bg-yellow-100 text-yellow-800",
      Paid: "bg-green-100 text-green-800",
      Failed: "bg-red-100 text-red-800",
    };
    return statusColors[paymentStatus] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading NOC request details...</p>
        </div>
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
                className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
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
            <div className="self-end sm:self-auto">
              {getStatusBadge(nocRequest.status)}
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
              <div className="px-8 py-5 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  Seller / Owner Information
                </h3>
              </div>
              <div className="px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Full Name
                    </label>
                    <p className="text-base font-semibold text-slate-900 mt-1">
                      {nocRequest.sellerName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Flat & Wing
                    </label>
                    <p className="text-base font-semibold text-slate-900 mt-1">
                      {nocRequest.flatNumber} - Wing {nocRequest.wing}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                    <p className="text-base text-slate-900 mt-1">
                      {nocRequest.sellerEmail}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      Mobile
                    </label>
                    <p className="text-base text-slate-900 mt-1">
                      {nocRequest.sellerMobileNumber}
                    </p>
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
                      {new Date(nocRequest.createdAt).toLocaleDateString(
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

            {/* Buyer Information */}
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
                    <p className="text-base font-semibold text-slate-900 mt-1">
                      {nocRequest.buyerName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      Mobile
                    </label>
                    <p className="text-base text-slate-900 mt-1">
                      {nocRequest.buyerMobileNumber}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                    <p className="text-base text-slate-900 mt-1">
                      {nocRequest.buyerEmail}
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
                      Reason
                    </label>
                    <p className="text-base font-semibold text-slate-900 mt-1">
                      {nocRequest.reason}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Expected Transfer Date
                    </label>
                    <p className="text-base text-slate-900 mt-1">
                      {new Date(nocRequest.expectedTransferDate).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
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
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border-2 border-blue-200">
                      <div className="flex items-center gap-3 mb-2">
                        <IndianRupee className="h-5 w-5 text-blue-600" />
                        <label className="text-sm font-medium text-slate-600">
                          NOC Fees
                        </label>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">
                        ₹{nocRequest.nocFees || 1000}
                      </p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border-2 border-emerald-200">
                      <div className="flex items-center gap-3 mb-2">
                        <IndianRupee className="h-5 w-5 text-emerald-600" />
                        <label className="text-sm font-medium text-slate-600">
                          Transfer Fees
                        </label>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">
                        ₹{nocRequest.transferFees || 25000}
                      </p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border-2 border-purple-200">
                      <div className="flex items-center gap-3 mb-2">
                        <IndianRupee className="h-5 w-5 text-purple-600" />
                        <label className="text-sm font-medium text-purple-600">
                          Total Amount
                        </label>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">
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
                            ? new Date(nocRequest.paymentDate).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }
                              )
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
                    onChange={(e) =>
                      setSelectedStatus(e.target.value as Status)
                    }
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2.5 bg-white text-slate-900 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    disabled={updatingStatus}>
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
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2.5 bg-white text-slate-900 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
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
                    (selectedStatus === nocRequest.status &&
                      adminRemarks === (nocRequest.adminRemarks || ""))
                  }
                  isLoading={updatingStatus}
                  className="w-full gap-2">
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
                    disabled={updatingPayment}>
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
                  className="w-full gap-2">
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
                {nocRequest.agreementDocument && (
                  <button
                    onClick={() =>
                      openDocumentPopup(
                        nocRequest.agreementDocument.s3Key,
                        nocRequest.agreementDocument.fileName,
                        nocRequest.agreementDocument.fileType
                      )
                    }
                    className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200">
                    <FileText className="h-8 w-8 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        Agreement Copy
                      </p>
                      <p className="text-xs text-slate-600 truncate">
                        {nocRequest.agreementDocument.fileName}
                      </p>
                    </div>
                    <Eye className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  </button>
                )}

                {/* Share Certificate Document */}
                {nocRequest.shareCertificateDocument && (
                  <button
                    onClick={() =>
                      openDocumentPopup(
                        nocRequest.shareCertificateDocument.s3Key,
                        nocRequest.shareCertificateDocument.fileName,
                        nocRequest.shareCertificateDocument.fileType
                      )
                    }
                    className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200">
                    <FileText className="h-8 w-8 text-green-600 flex-shrink-0" />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        Share Certificate
                      </p>
                      <p className="text-xs text-slate-600 truncate">
                        {nocRequest.shareCertificateDocument.fileName}
                      </p>
                    </div>
                    <Eye className="h-5 w-5 text-green-600 flex-shrink-0" />
                  </button>
                )}

                {/* Maintenance Receipt Document */}
                {nocRequest.maintenanceReceiptDocument && (
                  <button
                    onClick={() =>
                      openDocumentPopup(
                        nocRequest.maintenanceReceiptDocument.s3Key,
                        nocRequest.maintenanceReceiptDocument.fileName,
                        nocRequest.maintenanceReceiptDocument.fileType
                      )
                    }
                    className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200">
                    <FileText className="h-8 w-8 text-purple-600 flex-shrink-0" />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        Maintenance Receipt
                      </p>
                      <p className="text-xs text-slate-600 truncate">
                        {nocRequest.maintenanceReceiptDocument.fileName}
                      </p>
                    </div>
                    <Eye className="h-5 w-5 text-purple-600 flex-shrink-0" />
                  </button>
                )}

                {/* Buyer Aadhaar Document */}
                {nocRequest.buyerAadhaarDocument && (
                  <button
                    onClick={() =>
                      openDocumentPopup(
                        nocRequest.buyerAadhaarDocument.s3Key,
                        nocRequest.buyerAadhaarDocument.fileName,
                        nocRequest.buyerAadhaarDocument.fileType
                      )
                    }
                    className="w-full flex items-center gap-3 p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors border border-orange-200">
                    <FileText className="h-8 w-8 text-orange-600 flex-shrink-0" />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        Buyer Aadhaar Card
                      </p>
                      <p className="text-xs text-slate-600 truncate">
                        {nocRequest.buyerAadhaarDocument.fileName}
                      </p>
                    </div>
                    <Eye className="h-5 w-5 text-orange-600 flex-shrink-0" />
                  </button>
                )}

                {/* Buyer PAN Document */}
                {nocRequest.buyerPanDocument && (
                  <button
                    onClick={() =>
                      openDocumentPopup(
                        nocRequest.buyerPanDocument.s3Key,
                        nocRequest.buyerPanDocument.fileName,
                        nocRequest.buyerPanDocument.fileType
                      )
                    }
                    className="w-full flex items-center gap-3 p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200">
                    <FileText className="h-8 w-8 text-indigo-600 flex-shrink-0" />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        Buyer PAN Card
                      </p>
                      <p className="text-xs text-slate-600 truncate">
                        {nocRequest.buyerPanDocument.fileName}
                      </p>
                    </div>
                    <Eye className="h-5 w-5 text-indigo-600 flex-shrink-0" />
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
                      The seller has accepted all terms and conditions and
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
                  Download the official NOC request form PDF with all submitted details.
                </p>
                <Button
                  onClick={handleGeneratePdf}
                  disabled={generatingPdf}
                  isLoading={generatingPdf}
                  className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  {generatingPdf ? "Generating..." : "Generate NOC Request Form"}
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
          onClick={closeDocumentPopup}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
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
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
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
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
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

