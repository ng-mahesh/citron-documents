"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  adminAPI,
  shareCertificateAPI,
  nominationAPI,
  nocRequestAPI,
} from "@/lib/api";
import {
  DashboardStats,
  ShareCertificate,
  Nomination,
  Status,
  NocRequest,
} from "@/lib/types";
import {
  FileText,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  LogOut,
  Trash2,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  FileSignature,
  Home,
  Filter,
  Calendar,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { theme } from "@/lib/theme";
import { Loader } from "@/components/ui/Loader";
import { ToastContainer } from "@/components/ui/Toast";
import type { ToastType } from "@/components/ui/Toast";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [shareCertificates, setShareCertificates] = useState<
    ShareCertificate[]
  >([]);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [nocRequests, setNocRequests] = useState<NocRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "certificates" | "nominations" | "noc-requests"
  >("certificates");
  const [documentPopup, setDocumentPopup] = useState<{
    isOpen: boolean;
    url: string;
    fileName: string;
    fileType: string;
    loading?: boolean;
  } | null>(null);

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
    type: "certificate" | "nomination" | "noc-request";
    name: string;
    flatNumber: string;
  } | null>(null);

  // Pagination and search states for certificates
  const [certSearchQuery, setCertSearchQuery] = useState("");
  const [certStatusFilter, setCertStatusFilter] = useState<Status | "">(
    "Pending"
  );
  const [certDateFrom, setCertDateFrom] = useState("");
  const [certDateTo, setCertDateTo] = useState("");
  const [certCurrentPage, setCertCurrentPage] = useState(1);
  const certItemsPerPage = 10;

  // Pagination and search states for nominations
  const [nomSearchQuery, setNomSearchQuery] = useState("");
  const [nomStatusFilter, setNomStatusFilter] = useState<Status | "">(
    "Pending"
  );
  const [nomDateFrom, setNomDateFrom] = useState("");
  const [nomDateTo, setNomDateTo] = useState("");
  const [nomCurrentPage, setNomCurrentPage] = useState(1);
  const nomItemsPerPage = 10;

  // Pagination and search states for NOC requests
  const [nocSearchQuery, setNocSearchQuery] = useState("");
  const [nocStatusFilter, setNocStatusFilter] = useState<Status | "">(
    "Pending"
  );
  const [nocDateFrom, setNocDateFrom] = useState("");
  const [nocDateTo, setNocDateTo] = useState("");
  const [nocCurrentPage, setNocCurrentPage] = useState(1);
  const nocItemsPerPage = 10;

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("citron_society_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, certificatesRes, nominationsRes, nocRequestsRes] =
        await Promise.all([
          adminAPI.getDashboardStats(),
          shareCertificateAPI.getAll(),
          nominationAPI.getAll(),
          nocRequestAPI.getAll(),
        ]);

      setStats(statsRes.data.data);
      setShareCertificates(certificatesRes.data.data);
      setNominations(nominationsRes.data.data);
      setNocRequests(nocRequestsRes.data.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("citron_society_token");
    window.location.href = "/admin/login";
  };

  const handleExport = async (
    type: "certificates" | "nominations" | "noc-requests"
  ) => {
    setExporting(true);
    try {
      const response =
        type === "certificates"
          ? await adminAPI.exportShareCertificates()
          : type === "nominations"
            ? await adminAPI.exportNominations()
            : await adminAPI.exportNocRequests();

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setToast({ message: "Failed to export data", type: "error" });
    } finally {
      setExporting(false);
    }
  };

  // Reserved for future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUpdateStatus = async (
    id: string,
    status: Status,
    type: "certificate" | "nomination" | "noc-request"
  ) => {
    try {
      if (type === "certificate") {
        await shareCertificateAPI.update(id, { status });
      } else if (type === "nomination") {
        await nominationAPI.update(id, { status });
      } else {
        await nocRequestAPI.update(id, { status });
      }
      fetchDashboardData();
    } catch {
      setToast({ message: "Failed to update status", type: "error" });
    }
  };

  const handleDelete = async (
    id: string,
    type: "certificate" | "nomination" | "noc-request",
    name: string,
    flatNumber: string
  ) => {
    // Open confirmation modal instead of JavaScript alert
    setDeleteModal({ isOpen: true, id, type, name, flatNumber });
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;

    setDeleting(true);
    try {
      if (deleteModal.type === "certificate") {
        await shareCertificateAPI.delete(deleteModal.id);
      } else if (deleteModal.type === "nomination") {
        await nominationAPI.delete(deleteModal.id);
      } else {
        await nocRequestAPI.delete(deleteModal.id);
      }
      fetchDashboardData();
      setDeleteModal(null);
      setToast({ message: "Entry deleted successfully", type: "success" });
    } catch {
      setToast({ message: "Failed to delete entry", type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: Status) => {
    const colors: Record<Status, string> = {
      Pending: `${theme.status.pending.bg} ${theme.status.pending.text} border ${theme.status.pending.border}`,
      "Under Review": `${theme.status.underReview.bg} ${theme.status.underReview.text} border ${theme.status.underReview.border}`,
      Approved: `${theme.status.approved.bg} ${theme.status.approved.text} border ${theme.status.approved.border}`,
      Rejected: `${theme.status.rejected.bg} ${theme.status.rejected.text} border ${theme.status.rejected.border}`,
      "Document Required": `${theme.status.documentRequired.bg} ${theme.status.documentRequired.text} border ${theme.status.documentRequired.border}`,
    };
    return (
      <span
        className={`px-3 py-1.5 rounded-lg text-xs font-bold ${colors[status]}`}
      >
        {status}
      </span>
    );
  };

  // Reserved for future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      // Fetch pre-signed URL from backend
      const response = await adminAPI.getDocumentPresignedUrl(s3Key);
      const presignedUrl = response.data.data.presignedUrl;

      setDocumentPopup({
        isOpen: true,
        url: presignedUrl,
        fileName,
        fileType,
        loading: false,
      });
    } catch {
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

  // Filter and paginate certificates
  const filteredCertificates = useMemo(() => {
    return shareCertificates.filter((cert) => {
      const searchLower = certSearchQuery.toLowerCase();
      const matchesSearch =
        cert.acknowledgementNumber?.toLowerCase().includes(searchLower) ||
        cert.fullName?.toLowerCase().includes(searchLower) ||
        cert.flatNumber?.toLowerCase().includes(searchLower) ||
        cert.email?.toLowerCase().includes(searchLower) ||
        cert.wing?.toLowerCase().includes(searchLower);

      const matchesStatus =
        certStatusFilter === "" || cert.status === certStatusFilter;

      const submittedAt = cert.createdAt ? new Date(cert.createdAt) : null;
      const matchesDateFrom =
        !certDateFrom || (submittedAt && submittedAt >= new Date(certDateFrom));
      const matchesDateTo =
        !certDateTo ||
        (submittedAt &&
          submittedAt <=
            new Date(new Date(certDateTo).setHours(23, 59, 59, 999)));

      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [
    shareCertificates,
    certSearchQuery,
    certStatusFilter,
    certDateFrom,
    certDateTo,
  ]);

  const paginatedCertificates = useMemo(() => {
    const startIndex = (certCurrentPage - 1) * certItemsPerPage;
    const endIndex = startIndex + certItemsPerPage;
    return filteredCertificates.slice(startIndex, endIndex);
  }, [filteredCertificates, certCurrentPage, certItemsPerPage]);

  const certTotalPages = Math.ceil(
    filteredCertificates.length / certItemsPerPage
  );

  // Filter and paginate nominations
  const filteredNominations = useMemo(() => {
    return nominations.filter((nom) => {
      const searchLower = nomSearchQuery.toLowerCase();
      const memberName = nom.primaryMemberName || nom.memberFullName || "";
      const memberEmail = nom.primaryMemberEmail || nom.email || "";
      const matchesSearch =
        nom.acknowledgementNumber?.toLowerCase().includes(searchLower) ||
        memberName.toLowerCase().includes(searchLower) ||
        nom.flatNumber?.toLowerCase().includes(searchLower) ||
        memberEmail.toLowerCase().includes(searchLower) ||
        nom.wing?.toLowerCase().includes(searchLower);

      const matchesStatus =
        nomStatusFilter === "" || nom.status === nomStatusFilter;

      const submittedAt = nom.createdAt ? new Date(nom.createdAt) : null;
      const matchesDateFrom =
        !nomDateFrom || (submittedAt && submittedAt >= new Date(nomDateFrom));
      const matchesDateTo =
        !nomDateTo ||
        (submittedAt &&
          submittedAt <=
            new Date(new Date(nomDateTo).setHours(23, 59, 59, 999)));

      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [nominations, nomSearchQuery, nomStatusFilter, nomDateFrom, nomDateTo]);

  const paginatedNominations = useMemo(() => {
    const startIndex = (nomCurrentPage - 1) * nomItemsPerPage;
    const endIndex = startIndex + nomItemsPerPage;
    return filteredNominations.slice(startIndex, endIndex);
  }, [filteredNominations, nomCurrentPage, nomItemsPerPage]);

  const nomTotalPages = Math.ceil(filteredNominations.length / nomItemsPerPage);

  // Filter and paginate NOC requests
  const filteredNocRequests = useMemo(() => {
    return nocRequests.filter((noc) => {
      const searchLower = nocSearchQuery.toLowerCase();
      const matchesSearch =
        noc.acknowledgementNumber?.toLowerCase().includes(searchLower) ||
        noc.sellerName?.toLowerCase().includes(searchLower) ||
        noc.buyerName?.toLowerCase().includes(searchLower) ||
        noc.flatNumber?.toLowerCase().includes(searchLower) ||
        noc.sellerEmail?.toLowerCase().includes(searchLower) ||
        noc.wing?.toLowerCase().includes(searchLower) ||
        noc.reason?.toLowerCase().includes(searchLower);

      const matchesStatus =
        nocStatusFilter === "" || noc.status === nocStatusFilter;

      const submittedAt = noc.createdAt ? new Date(noc.createdAt) : null;
      const matchesDateFrom =
        !nocDateFrom || (submittedAt && submittedAt >= new Date(nocDateFrom));
      const matchesDateTo =
        !nocDateTo ||
        (submittedAt &&
          submittedAt <=
            new Date(new Date(nocDateTo).setHours(23, 59, 59, 999)));

      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [nocRequests, nocSearchQuery, nocStatusFilter, nocDateFrom, nocDateTo]);

  const paginatedNocRequests = useMemo(() => {
    const startIndex = (nocCurrentPage - 1) * nocItemsPerPage;
    const endIndex = startIndex + nocItemsPerPage;
    return filteredNocRequests.slice(startIndex, endIndex);
  }, [filteredNocRequests, nocCurrentPage, nocItemsPerPage]);

  const nocTotalPages = Math.ceil(filteredNocRequests.length / nocItemsPerPage);

  // Reset to page 1 when search query, status filter, or date filter changes
  useEffect(() => {
    setCertCurrentPage(1);
  }, [certSearchQuery, certStatusFilter, certDateFrom, certDateTo]);

  useEffect(() => {
    setNomCurrentPage(1);
  }, [nomSearchQuery, nomStatusFilter, nomDateFrom, nomDateTo]);

  useEffect(() => {
    setNocCurrentPage(1);
  }, [nocSearchQuery, nocStatusFilter, nocDateFrom, nocDateTo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader size="lg" message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-gradient-to-br from-[#175a00] to-[#185900] rounded-xl flex items-center justify-center shadow-md shadow-green-200">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 leading-tight">
                  Admin Dashboard
                </p>
                <p className="text-xs text-slate-500 leading-tight">
                  Citron Documents App
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs sm:text-sm"
              >
                <Home className="h-3.5 w-3.5" />
                Home
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs sm:text-sm"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            All applications at a glance
          </p>
        </div>

        {/* Stats Grid — horizontal cards like society app */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
          {[
            {
              label: "Total Certificates",
              value: stats?.shareCertificates.total || 0,
              icon: <FileText className="h-6 w-6 text-white" />,
              bg: theme.iconBg.primary,
              shadow: theme.colors.shadows.primary,
            },
            {
              label: "Total Nominations",
              value: stats?.nominations.total || 0,
              icon: <Users className="h-6 w-6 text-white" />,
              bg: theme.iconBg.primary,
              shadow: theme.colors.shadows.primary,
            },
            {
              label: "NOC Requests",
              value: stats?.nocRequests?.total || 0,
              icon: <FileSignature className="h-6 w-6 text-white" />,
              bg: theme.iconBg.green,
              shadow: theme.colors.shadows.primary,
            },
            {
              label: "Approved",
              value:
                (stats?.shareCertificates.approved || 0) +
                (stats?.nominations.approved || 0) +
                (stats?.nocRequests?.approved || 0),
              icon: <CheckCircle className="h-6 w-6 text-white" />,
              bg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
              shadow: "shadow-emerald-200",
            },
            {
              label: "Pending Review",
              value:
                (stats?.shareCertificates.pending || 0) +
                (stats?.nominations.pending || 0) +
                (stats?.nocRequests?.pending || 0),
              icon: <Clock className="h-6 w-6 text-white" />,
              bg: theme.iconBg.amber,
              shadow: "shadow-amber-200",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5 flex items-center gap-4"
            >
              <div
                className={`h-12 w-12 ${stat.bg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${stat.shadow}`}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-0.5">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="bg-slate-100 rounded-xl p-1 flex gap-1">
            {(["certificates", "nominations", "noc-requests"] as const).map(
              (tab) => {
                const labels: Record<string, string> = {
                  certificates: `Certificates (${shareCertificates.length})`,
                  nominations: `Nominations (${nominations.length})`,
                  "noc-requests": `NOC Requests (${nocRequests.length})`,
                };
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      activeTab === tab
                        ? "bg-white shadow-sm text-slate-900"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {labels[tab]}
                  </button>
                );
              }
            )}
          </div>
          <Button
            onClick={() => handleExport(activeTab)}
            variant="outline"
            size="sm"
            isLoading={exporting}
            disabled={exporting}
            className="gap-2 shrink-0"
          >
            {!exporting && <Download className="h-4 w-4" />}
            {exporting ? "Exporting..." : "Export to Excel"}
          </Button>
        </div>

        {/* Share Certificates Table */}
        {activeTab === "certificates" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Search and Filter Bar */}
            <div className="p-4 border-b border-slate-200 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, ack no, flat, email, wing..."
                    value={certSearchQuery}
                    onChange={(e) => setCertSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <select
                    value={certStatusFilter}
                    onChange={(e) =>
                      setCertStatusFilter(e.target.value as Status | "")
                    }
                    className="pl-10 pr-8 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 appearance-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Document Required">Document Required</option>
                  </select>
                  <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={certDateFrom}
                    onChange={(e) => setCertDateFrom(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    title="From date"
                  />
                </div>
                <span className="text-sm text-slate-400 shrink-0">to</span>
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={certDateTo}
                    min={certDateFrom || undefined}
                    onChange={(e) => setCertDateTo(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    title="To date"
                  />
                </div>
                {(certDateFrom || certDateTo) && (
                  <button
                    onClick={() => {
                      setCertDateFrom("");
                      setCertDateTo("");
                    }}
                    className="shrink-0 px-3 py-2.5 text-xs font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear dates
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Ack No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Flat
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Resale
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {paginatedCertificates.length > 0 ? (
                    paginatedCertificates.map((cert) => (
                      <tr
                        key={cert._id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          {cert.acknowledgementNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900 max-w-xs">
                          <div className="truncate">{cert.fullName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {cert.wing && `${cert.wing} - `}
                          {cert.flatNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs">
                          <div className="truncate">{cert.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {cert.isResaleProperty ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              Resale
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                              Original
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(cert.status!)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                router.push(
                                  `/admin/share-certificate/${cert.acknowledgementNumber}`
                                )
                              }
                              className={`px-4 py-2 ${theme.button.primary.bg} ${theme.button.primary.text} rounded-lg ${theme.button.primary.hover} transition-colors text-sm font-medium`}
                            >
                              View Details
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(
                                  cert._id!,
                                  "certificate",
                                  cert.fullName,
                                  `${cert.wing} - ${cert.flatNumber}`
                                )
                              }
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete certificate"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-8 text-center text-slate-500"
                      >
                        No certificates found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {certTotalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Showing{" "}
                  {Math.min(
                    (certCurrentPage - 1) * certItemsPerPage + 1,
                    filteredCertificates.length
                  )}{" "}
                  to{" "}
                  {Math.min(
                    certCurrentPage * certItemsPerPage,
                    filteredCertificates.length
                  )}{" "}
                  of {filteredCertificates.length} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCertCurrentPage(certCurrentPage - 1)}
                    disabled={certCurrentPage === 1}
                    className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-slate-600" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: certTotalPages },
                      (_, i) => i + 1
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCertCurrentPage(page)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          certCurrentPage === page
                            ? `${theme.button.primary.bg} text-white`
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCertCurrentPage(certCurrentPage + 1)}
                    disabled={certCurrentPage === certTotalPages}
                    className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-slate-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Nominations Table */}
        {activeTab === "nominations" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Search and Filter Bar */}
            <div className="p-4 border-b border-slate-200 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, ack no, flat, email, wing..."
                    value={nomSearchQuery}
                    onChange={(e) => setNomSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <select
                    value={nomStatusFilter}
                    onChange={(e) =>
                      setNomStatusFilter(e.target.value as Status | "")
                    }
                    className="pl-10 pr-8 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 appearance-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Document Required">Document Required</option>
                  </select>
                  <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={nomDateFrom}
                    onChange={(e) => setNomDateFrom(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    title="From date"
                  />
                </div>
                <span className="text-sm text-slate-400 shrink-0">to</span>
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={nomDateTo}
                    min={nomDateFrom || undefined}
                    onChange={(e) => setNomDateTo(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    title="To date"
                  />
                </div>
                {(nomDateFrom || nomDateTo) && (
                  <button
                    onClick={() => {
                      setNomDateFrom("");
                      setNomDateTo("");
                    }}
                    className="shrink-0 px-3 py-2.5 text-xs font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear dates
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Ack No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Member Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Flat
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Nominees
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Resale
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {paginatedNominations.length > 0 ? (
                    paginatedNominations.map((nom) => (
                      <tr
                        key={nom._id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          {nom.acknowledgementNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900 max-w-xs">
                          <div className="truncate">
                            {nom.primaryMemberName ||
                              nom.memberFullName ||
                              "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {nom.wing && `${nom.wing} - `}
                          {nom.flatNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs">
                          <div className="truncate">
                            {nom.primaryMemberEmail || nom.email || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg ${theme.status.pending.bg} ${theme.status.pending.text} font-semibold`}
                          >
                            {nom.nominees?.length || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {nom.isResaleProperty ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              Resale
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                              Original
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(nom.status!)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                router.push(
                                  `/admin/nomination/${nom.acknowledgementNumber}`
                                )
                              }
                              className={`px-4 py-2 ${theme.button.primary.bg} ${theme.button.primary.text} rounded-lg ${theme.button.primary.hover} transition-colors text-sm font-medium`}
                            >
                              View Details
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(
                                  nom._id!,
                                  "nomination",
                                  nom.primaryMemberName ||
                                    nom.memberFullName ||
                                    "N/A",
                                  `${nom.wing} - ${nom.flatNumber}`
                                )
                              }
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete nomination"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-8 text-center text-slate-500"
                      >
                        No nominations found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {nomTotalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Showing{" "}
                  {Math.min(
                    (nomCurrentPage - 1) * nomItemsPerPage + 1,
                    filteredNominations.length
                  )}{" "}
                  to{" "}
                  {Math.min(
                    nomCurrentPage * nomItemsPerPage,
                    filteredNominations.length
                  )}{" "}
                  of {filteredNominations.length} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNomCurrentPage(nomCurrentPage - 1)}
                    disabled={nomCurrentPage === 1}
                    className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-slate-600" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: nomTotalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setNomCurrentPage(page)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            nomCurrentPage === page
                              ? `${theme.button.primary.bg} text-white`
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>
                  <button
                    onClick={() => setNomCurrentPage(nomCurrentPage + 1)}
                    disabled={nomCurrentPage === nomTotalPages}
                    className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-slate-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* NOC Requests Table */}
        {activeTab === "noc-requests" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Search and Filter Bar */}
            <div className="p-4 border-b border-slate-200 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, ack no, flat, email, wing..."
                    value={nocSearchQuery}
                    onChange={(e) => setNocSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <select
                    value={nocStatusFilter}
                    onChange={(e) =>
                      setNocStatusFilter(e.target.value as Status | "")
                    }
                    className="pl-10 pr-8 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 appearance-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Document Required">Document Required</option>
                  </select>
                  <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={nocDateFrom}
                    onChange={(e) => setNocDateFrom(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    title="From date"
                  />
                </div>
                <span className="text-sm text-slate-400 shrink-0">to</span>
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={nocDateTo}
                    min={nocDateFrom || undefined}
                    onChange={(e) => setNocDateTo(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    title="To date"
                  />
                </div>
                {(nocDateFrom || nocDateTo) && (
                  <button
                    onClick={() => {
                      setNocDateFrom("");
                      setNocDateTo("");
                    }}
                    className="shrink-0 px-3 py-2.5 text-xs font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear dates
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Ack No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Seller Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Buyer Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Flat
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      NOC Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {paginatedNocRequests.length > 0 ? (
                    paginatedNocRequests.map((noc) => (
                      <tr
                        key={noc._id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          {noc.acknowledgementNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900 max-w-xs">
                          <div className="truncate">
                            {noc.sellerName || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900 max-w-xs">
                          <div className="truncate">
                            {noc.buyerName || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {noc.wing && `${noc.wing} - `}
                          {noc.flatNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <span className="text-sm font-medium text-slate-700">
                            {noc.nocType || noc.reason || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {noc.totalAmount && noc.totalAmount > 0 ? (
                            <span className="font-medium">
                              ₹{noc.totalAmount.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-green-600 font-semibold">
                              FREE
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(noc.status!)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                router.push(
                                  `/admin/noc-request/${noc.acknowledgementNumber}`
                                )
                              }
                              className={`px-4 py-2 ${theme.button.primary.bg} ${theme.button.primary.text} rounded-lg ${theme.button.primary.hover} transition-colors text-sm font-medium`}
                            >
                              View Details
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(
                                  noc._id!,
                                  "noc-request",
                                  noc.sellerName || "N/A",
                                  `${noc.wing} - ${noc.flatNumber}`
                                )
                              }
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete NOC request"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-8 text-center text-slate-500"
                      >
                        No NOC requests found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {nocTotalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Showing{" "}
                  {Math.min(
                    (nocCurrentPage - 1) * nocItemsPerPage + 1,
                    filteredNocRequests.length
                  )}{" "}
                  to{" "}
                  {Math.min(
                    nocCurrentPage * nocItemsPerPage,
                    filteredNocRequests.length
                  )}{" "}
                  of {filteredNocRequests.length} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNocCurrentPage(nocCurrentPage - 1)}
                    disabled={nocCurrentPage === 1}
                    className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-slate-600" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: nocTotalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setNocCurrentPage(page)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            nocCurrentPage === page
                              ? `${theme.button.primary.bg} text-white`
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>
                  <button
                    onClick={() => setNocCurrentPage(nocCurrentPage + 1)}
                    disabled={nocCurrentPage === nocTotalPages}
                    className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-slate-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />

      {/* Document Viewer Popup */}
      {documentPopup && documentPopup.isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeDocumentPopup}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col"
            style={{ maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 ${theme.iconBg.primary} rounded-lg flex items-center justify-center`}
                >
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
            <div className="flex-1 p-4 overflow-auto">
              {documentPopup.loading ? (
                <div className="flex items-center justify-center min-h-[60vh]">
                  <Loader size="lg" message="Loading document..." />
                </div>
              ) : documentPopup.fileType?.includes("pdf") ? (
                <iframe
                  src={documentPopup.url}
                  className="w-full h-full min-h-[60vh] border-0 rounded-lg"
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
            <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50 flex-shrink-0">
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

      {/* Delete Confirmation Modal */}
      {deleteModal && deleteModal.isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setDeleteModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-6 border-b border-slate-200">
              <div className="h-12 w-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Confirm Deletion
                </h3>
                <p className="text-sm text-slate-600">
                  This action cannot be undone
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-slate-700 mb-4">
                Are you sure you want to delete this{" "}
                <span className="font-semibold">
                  {deleteModal.type === "certificate"
                    ? "share certificate"
                    : deleteModal.type === "nomination"
                      ? "nomination"
                      : "NOC request"}
                </span>{" "}
                application?
              </p>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Name:</span>
                    <span className="font-semibold text-slate-900">
                      {deleteModal.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Flat:</span>
                    <span className="font-semibold text-slate-900">
                      {deleteModal.flatNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
              <Button
                onClick={() => setDeleteModal(null)}
                variant="outline"
                size="sm"
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                size="sm"
                isLoading={deleting}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? "Deleting..." : "Delete"}
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
