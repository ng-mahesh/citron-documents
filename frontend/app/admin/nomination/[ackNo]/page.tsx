"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/Button";
import { nominationAPI, adminAPI, api, uploadApi } from "@/lib/api";
import { Status, Nominee, Witness } from "@/lib/types";
import { ToastContainer, ToastType } from "@/components/ui/Toast";
import {
  FileText,
  ArrowLeft,
  Eye,
  User,
  Users,
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
  Upload,
  Plus,
} from "lucide-react";
import { Loader } from "@/components/ui/Loader";
import { theme } from "@/lib/theme";

export default function NominationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ackNo = params.ackNo as string;

  const [nomination, setNomination] = useState<{
    _id: string;
    acknowledgementNumber: string;
    primaryMemberName: string;
    flatNumber: string;
    wing: string;
    primaryMemberEmail: string;
    primaryMemberMobile: string;
    status: Status;
    submittedAt: string;
    updatedAt: string;
    createdAt: string;
    memberSignature?: string;
    adminRemarks?: string;
    nominees?: Nominee[];
    witnesses?: Witness[];
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
    jointMemberAadhaar?: { s3Key: string; fileName: string; fileType: string };
    nomineeAadhaars?: Array<{
      s3Key: string;
      fileName: string;
      fileType: string;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<Status>("Pending");
  const [adminRemarks, setAdminRemarks] = useState<string>("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<{
    primaryMemberName: string;
    flatNumber: string;
    wing: "C" | "D";
    primaryMemberEmail: string;
    primaryMemberMobile: string;
    memberSignature: string;
    nominees: Nominee[];
    witnesses: Witness[];
  }>({
    primaryMemberName: "",
    flatNumber: "",
    wing: "C",
    primaryMemberEmail: "",
    primaryMemberMobile: "",
    memberSignature: "",
    nominees: [],
    witnesses: [],
  });
  const [updatingDetails, setUpdatingDetails] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState<string | null>(null);

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
    fetchNominationDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ackNo]);

  const fetchNominationDetails = async () => {
    try {
      const response = await nominationAPI.getByAckNumber(ackNo);
      const nominationData = response.data.data;
      setNomination(nominationData);
      setSelectedStatus(nominationData.status);
      setAdminRemarks(nominationData.adminRemarks || "");
      // Initialize edit data
      setEditData({
        primaryMemberName: nominationData.primaryMemberName || "",
        flatNumber: nominationData.flatNumber || "",
        wing: (nominationData.wing as "C" | "D") || "C",
        primaryMemberEmail: nominationData.primaryMemberEmail || "",
        primaryMemberMobile: nominationData.primaryMemberMobile || "",
        memberSignature: nominationData.memberSignature || "",
        nominees: nominationData.nominees || [],
        witnesses: nominationData.witnesses || [],
      });
    } catch (error) {
      console.error("Failed to fetch nomination details:", error);
      setToast({ message: "Failed to load nomination details", type: "error" });
      setTimeout(() => router.push("/admin/dashboard"), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!nomination) {
      return;
    }

    setUpdatingStatus(true);
    try {
      await nominationAPI.update(nomination._id, {
        status: selectedStatus,
        adminRemarks: adminRemarks,
      });
      setNomination({
        ...nomination,
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
      setSelectedStatus(nomination.status);
      setAdminRemarks(nomination.adminRemarks || "");
    } finally {
      setUpdatingStatus(false);
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

  const handleGeneratePdf = async () => {
    if (!nomination) return;

    setGeneratingPdf(true);
    try {
      const response = await nominationAPI.downloadPdf(
        nomination.acknowledgementNumber
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Nomination_${nomination.acknowledgementNumber}.pdf`;
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
      if (nomination) {
        setEditData({
          primaryMemberName: nomination.primaryMemberName || "",
          flatNumber: nomination.flatNumber || "",
          wing: (nomination.wing as "C" | "D") || "C",
          primaryMemberEmail: nomination.primaryMemberEmail || "",
          primaryMemberMobile: nomination.primaryMemberMobile || "",
          memberSignature: nomination.memberSignature || "",
          nominees: nomination.nominees || [],
          witnesses: nomination.witnesses || [],
        });
      }
    }
    setIsEditMode(!isEditMode);
  };

  const handleUpdateDetails = async () => {
    if (!nomination) return;

    setUpdatingDetails(true);
    try {
      await nominationAPI.update(nomination._id, {
        ...editData,
        nominees: editData.nominees,
        witnesses: editData.witnesses,
      });
      setNomination({
        ...nomination,
        ...editData,
      });
      setIsEditMode(false);
      setToast({
        message: "Nomination details updated successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to update nomination details:", error);
      setToast({
        message: "Failed to update nomination details. Please try again.",
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
    if (!file || !nomination) return;

    // Validate required nomination data
    if (!nomination.flatNumber || !nomination.primaryMemberName) {
      setToast({
        message: "Nomination data is incomplete. Please refresh the page.",
        type: "error",
      });
      return;
    }

    setUploadingDocument(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("flatNumber", nomination.flatNumber);
      formData.append("documentType", documentType);
      formData.append("fullName", nomination.primaryMemberName);

      console.log("Uploading document:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        flatNumber: nomination.flatNumber,
        documentType,
        fullName: nomination.primaryMemberName,
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

      // Add document to nomination
      if (!nomination._id) {
        throw new Error("Nomination ID is missing");
      }
      await api.post(`/nomination/${nomination._id}/documents`, documentData);

      // Refresh nomination data
      await fetchNominationDetails();
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
    if (!nomination) return;

    setDeletingDocument(documentType);
    try {
      // Remove document from nomination
      await api.delete(
        `/nomination/${nomination._id}/documents/${documentType}`
      );

      // Delete file from S3
      await uploadApi.delete("/upload", { data: { key: s3Key } });

      // Refresh nomination data
      await fetchNominationDetails();
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

  const handleUpdateNominee = (
    index: number,
    field: keyof Nominee,
    value: string | number
  ) => {
    const updatedNominees = [...(editData.nominees || [])];
    if (updatedNominees[index]) {
      updatedNominees[index] = {
        ...updatedNominees[index],
        [field]: value,
      };
      setEditData({ ...editData, nominees: updatedNominees });
    }
  };

  const handleAddNominee = () => {
    const newNominee: Nominee = {
      name: "",
      relationship: "",
      dateOfBirth: "",
      aadhaarNumber: "",
      sharePercentage: 0,
      address: "",
    };
    setEditData({
      ...editData,
      nominees: [...(editData.nominees || []), newNominee],
    });
  };

  const handleRemoveNominee = (index: number) => {
    const updatedNominees = (editData.nominees || []).filter(
      (_, i) => i !== index
    );
    setEditData({ ...editData, nominees: updatedNominees });
  };

  const handleUpdateWitness = (
    index: number,
    field: keyof Witness,
    value: string
  ) => {
    const updatedWitnesses = [...(editData.witnesses || [])];
    if (updatedWitnesses[index]) {
      updatedWitnesses[index] = {
        ...updatedWitnesses[index],
        [field]: value,
      };
      setEditData({ ...editData, witnesses: updatedWitnesses });
    }
  };

  const handleAddWitness = () => {
    const newWitness: Witness = {
      name: "",
      address: "",
      signature: "",
    };
    setEditData({
      ...editData,
      witnesses: [...(editData.witnesses || []), newWitness],
    });
  };

  const handleRemoveWitness = (index: number) => {
    const updatedWitnesses = (editData.witnesses || []).filter(
      (_, i) => i !== index
    );
    setEditData({ ...editData, witnesses: updatedWitnesses });
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

  const getPredefinedRemarks = (status: Status) => {
    const baseRemarks = {
      Pending: `Nomination application marked as pending. Awaiting further review and required documents.`,
      "Under Review": `Nomination application is currently under review. All submitted documents are being verified.`,
      Approved: `Nomination application has been approved. Nomination certificate will be issued shortly.`,
      Rejected: `Nomination application has been rejected. Please check the requirements and resubmit.`,
      "Document Required": `Additional documents are required for nomination. Please upload the missing documents to proceed.`,
    };

    return baseRemarks[status] || "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <Loader size="lg" message="Loading nomination details..." />
      </div>
    );
  }

  if (!nomination) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Nomination not found</p>
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
                    Nomination Details
                  </h1>
                  <p className="text-xs text-slate-500">
                    {nomination.acknowledgementNumber}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              {getStatusBadge(nomination.status)}
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
                        value={editData.primaryMemberName}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            primaryMemberName: e.target.value,
                          })
                        }
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      />
                    ) : (
                      <p className="text-base font-semibold text-slate-900 mt-1">
                        {nomination.primaryMemberName}
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
                        {nomination.flatNumber} - Wing {nomination.wing}
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
                        value={editData.primaryMemberEmail}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            primaryMemberEmail: e.target.value,
                          })
                        }
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      />
                    ) : (
                      <p className="text-base text-slate-900 mt-1">
                        {nomination.primaryMemberEmail}
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
                        value={editData.primaryMemberMobile}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            primaryMemberMobile: e.target.value,
                          })
                        }
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      />
                    ) : (
                      <p className="text-base text-slate-900 mt-1">
                        {nomination.primaryMemberMobile}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Submitted On
                    </label>
                    <p className="text-base text-slate-900 mt-1">
                      {new Date(nomination.createdAt).toLocaleDateString(
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
                      {nomination.memberSignature || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Nominees */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Nominees ({nomination.nominees?.length || 0})
                </h3>
                {isEditMode && (
                  <Button
                    onClick={handleAddNominee}
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Nominee
                  </Button>
                )}
              </div>
              <div className="px-8 py-6 space-y-6">
                {isEditMode
                  ? (editData.nominees || []).map(
                      (nominee: Nominee, index: number) => (
                        <div
                          key={index}
                          className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border-2 border-purple-200"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-lg font-bold text-slate-900">
                              Nominee {index + 1}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 ${theme.button.primary.bg} text-white rounded-lg text-sm font-bold">
                                {nominee.sharePercentage || 0}% Share
                              </span>
                              <button
                                onClick={() => handleRemoveNominee(index)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove nominee"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-slate-600">
                                Name
                              </label>
                              <input
                                type="text"
                                value={nominee.name || ""}
                                onChange={(e) =>
                                  handleUpdateNominee(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                placeholder="Enter nominee name"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600">
                                Relationship
                              </label>
                              <input
                                type="text"
                                value={nominee.relationship || ""}
                                onChange={(e) =>
                                  handleUpdateNominee(
                                    index,
                                    "relationship",
                                    e.target.value
                                  )
                                }
                                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                placeholder="e.g., Son, Daughter, Spouse"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600">
                                Date of Birth
                              </label>
                              <input
                                type="date"
                                value={nominee.dateOfBirth || ""}
                                onChange={(e) =>
                                  handleUpdateNominee(
                                    index,
                                    "dateOfBirth",
                                    e.target.value
                                  )
                                }
                                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600">
                                Aadhaar Number
                              </label>
                              <input
                                type="text"
                                value={nominee.aadhaarNumber || ""}
                                onChange={(e) =>
                                  handleUpdateNominee(
                                    index,
                                    "aadhaarNumber",
                                    e.target.value
                                      .replace(/\D/g, "")
                                      .slice(0, 12)
                                  )
                                }
                                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                placeholder="123456789012"
                                maxLength={12}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600">
                                Share Percentage
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={nominee.sharePercentage || 0}
                                onChange={(e) =>
                                  handleUpdateNominee(
                                    index,
                                    "sharePercentage",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-sm font-medium text-slate-600">
                                Address (Optional)
                              </label>
                              <textarea
                                value={nominee.address || ""}
                                onChange={(e) =>
                                  handleUpdateNominee(
                                    index,
                                    "address",
                                    e.target.value
                                  )
                                }
                                rows={2}
                                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
                                placeholder="Enter address"
                              />
                            </div>
                          </div>
                        </div>
                      )
                    )
                  : nomination.nominees?.map(
                      (nominee: Nominee, index: number) => (
                        <div
                          key={index}
                          className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border-2 border-purple-200"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-lg font-bold text-slate-900">
                              Nominee {index + 1}
                            </h4>
                            <span className="px-3 py-1 ${theme.button.primary.bg} text-white rounded-lg text-sm font-bold">
                              {nominee.sharePercentage}% Share
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-slate-600">
                                Name
                              </label>
                              <p className="text-base font-semibold text-slate-900 mt-1">
                                {nominee.name}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600">
                                Relationship
                              </label>
                              <p className="text-base text-slate-900 mt-1">
                                {nominee.relationship}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600">
                                Date of Birth
                              </label>
                              <p className="text-base text-slate-900 mt-1">
                                {new Date(
                                  nominee.dateOfBirth
                                ).toLocaleDateString("en-IN")}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600">
                                Aadhaar Number
                              </label>
                              <p className="text-base text-slate-900 mt-1 font-mono">
                                {nominee.aadhaarNumber.replace(
                                  /(\d{4})(\d{4})(\d{4})/,
                                  "$1 $2 $3"
                                )}
                              </p>
                            </div>
                            {nominee.address && (
                              <div className="md:col-span-2">
                                <label className="text-sm font-medium text-slate-600">
                                  Address
                                </label>
                                <p className="text-base text-slate-900 mt-1">
                                  {nominee.address}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )}
              </div>
            </div>

            {/* Witnesses */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Witnesses</h3>
                {isEditMode && (
                  <Button
                    onClick={handleAddWitness}
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Witness
                  </Button>
                )}
              </div>
              <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {isEditMode
                  ? (editData.witnesses || []).map(
                      (witness: Witness, index: number) => (
                        <div
                          key={index}
                          className="p-5 bg-slate-50 rounded-xl border border-slate-200"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-base font-bold text-slate-900">
                              Witness {index + 1}
                            </h4>
                            <button
                              onClick={() => handleRemoveWitness(index)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove witness"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-slate-600">
                                Name
                              </label>
                              <input
                                type="text"
                                value={witness.name || ""}
                                onChange={(e) =>
                                  handleUpdateWitness(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500"
                                placeholder="Enter witness name"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600">
                                Address
                              </label>
                              <textarea
                                value={witness.address || ""}
                                onChange={(e) =>
                                  handleUpdateWitness(
                                    index,
                                    "address",
                                    e.target.value
                                  )
                                }
                                rows={3}
                                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 resize-none"
                                placeholder="Enter witness address"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600">
                                Signature
                              </label>
                              <input
                                type="text"
                                value={witness.signature || ""}
                                onChange={(e) =>
                                  handleUpdateWitness(
                                    index,
                                    "signature",
                                    e.target.value
                                  )
                                }
                                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500"
                                placeholder="Enter signature"
                              />
                            </div>
                          </div>
                        </div>
                      )
                    )
                  : nomination.witnesses?.map(
                      (witness: Witness, index: number) => (
                        <div
                          key={index}
                          className="p-5 bg-slate-50 rounded-xl border border-slate-200"
                        >
                          <h4 className="text-base font-bold text-slate-900 mb-3">
                            Witness {index + 1}
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-slate-600">
                                Name
                              </label>
                              <p className="text-base text-slate-900 mt-1">
                                {witness.name}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600">
                                Address
                              </label>
                              <p className="text-base text-slate-900 mt-1">
                                {witness.address}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600">
                                Signature
                              </label>
                              <p className="text-base italic text-slate-900 mt-1">
                                {witness.signature}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    )}
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
                      if (nomination) {
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
                    (selectedStatus === nomination.status &&
                      adminRemarks === (nomination.adminRemarks || ""))
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
                    {nomination.index2Document ? (
                      <p className="text-xs text-slate-600 truncate">
                        {nomination.index2Document!.fileName}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500">
                        No document uploaded
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {nomination.index2Document && (
                      <>
                        <button
                          onClick={() =>
                            openDocumentPopup(
                              nomination.index2Document!.s3Key,
                              nomination.index2Document!.fileName,
                              nomination.index2Document!.fileType
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
                              nomination.index2Document!.s3Key
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
                    {nomination.possessionLetterDocument ? (
                      <p className="text-xs text-slate-600 truncate">
                        {nomination.possessionLetterDocument!.fileName}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500">
                        No document uploaded
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {nomination.possessionLetterDocument && (
                      <>
                        <button
                          onClick={() =>
                            openDocumentPopup(
                              nomination.possessionLetterDocument!.s3Key,
                              nomination.possessionLetterDocument!.fileName,
                              nomination.possessionLetterDocument!.fileType
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
                              nomination.possessionLetterDocument!.s3Key
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

                {/* Primary Member Aadhaar */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <FileText className="h-8 w-8 text-slate-600 flex-shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      Primary Member Aadhaar
                    </p>
                    {nomination.aadhaarCardDocument ? (
                      <p className="text-xs text-slate-600 truncate">
                        {nomination.aadhaarCardDocument!.fileName}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500">
                        No document uploaded
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {nomination.aadhaarCardDocument && (
                      <>
                        <button
                          onClick={() =>
                            openDocumentPopup(
                              nomination.aadhaarCardDocument!.s3Key,
                              nomination.aadhaarCardDocument!.fileName,
                              nomination.aadhaarCardDocument!.fileType
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
                              nomination.aadhaarCardDocument!.s3Key
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
                  Download the official nomination form PDF with all submitted
                  details.
                </p>
                <Button
                  onClick={handleGeneratePdf}
                  disabled={generatingPdf}
                  isLoading={generatingPdf}
                  className="w-full gap-2"
                >
                  <Download className="h-4 w-4" />
                  {generatingPdf ? "Generating..." : "Generate PDF Form"}
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
