"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { adminAPI, shareCertificateAPI, nominationAPI } from "@/lib/api";
import {
  DashboardStats,
  ShareCertificate,
  Nomination,
  Status,
} from "@/lib/types";
import {
  FileText,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Download,
  LogOut,
  Edit,
  Trash2,
  Eye,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [shareCertificates, setShareCertificates] = useState<
    ShareCertificate[]
  >([]);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"certificates" | "nominations">(
    "certificates"
  );
  const [documentPopup, setDocumentPopup] = useState<{
    isOpen: boolean;
    url: string;
    fileName: string;
    fileType: string;
  } | null>(null);

  // Pagination and search states for certificates
  const [certSearchQuery, setCertSearchQuery] = useState("");
  const [certCurrentPage, setCertCurrentPage] = useState(1);
  const certItemsPerPage = 10;

  // Pagination and search states for nominations
  const [nomSearchQuery, setNomSearchQuery] = useState("");
  const [nomCurrentPage, setNomCurrentPage] = useState(1);
  const nomItemsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, certificatesRes, nominationsRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        shareCertificateAPI.getAll(),
        nominationAPI.getAll(),
      ]);

      setStats(statsRes.data.data);
      setShareCertificates(certificatesRes.data.data);
      setNominations(nominationsRes.data.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  const handleExport = async (type: "certificates" | "nominations") => {
    try {
      const response =
        type === "certificates"
          ? await adminAPI.exportShareCertificates()
          : await adminAPI.exportNominations();

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Failed to export data");
    }
  };

  const handleUpdateStatus = async (
    id: string,
    status: Status,
    type: "certificate" | "nomination"
  ) => {
    try {
      if (type === "certificate") {
        await shareCertificateAPI.update(id, { status });
      } else {
        await nominationAPI.update(id, { status });
      }
      fetchDashboardData();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (
    id: string,
    type: "certificate" | "nomination"
  ) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      if (type === "certificate") {
        await shareCertificateAPI.delete(id);
      } else {
        await nominationAPI.delete(id);
      }
      fetchDashboardData();
    } catch (error) {
      alert("Failed to delete entry");
    }
  };

  const statuses: { value: Status; label: string }[] = [
    { value: "Pending", label: "Pending" },
    { value: "Under Review", label: "Under Review" },
    { value: "Approved", label: "Approved" },
    { value: "Rejected", label: "Rejected" },
    { value: "Document Required", label: "Document Required" },
  ];

  const getStatusBadge = (status: Status) => {
    const colors: Record<Status, string> = {
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
        className={`px-3 py-1.5 rounded-lg text-xs font-bold ${colors[status]}`}>
        {status}
      </span>
    );
  };

  const openDocumentPopup = async (
    s3Key: string,
    fileName: string,
    fileType: string
  ) => {
    try {
      // Fetch pre-signed URL from backend
      const response = await adminAPI.getDocumentPresignedUrl(s3Key);
      const presignedUrl = response.data.data.presignedUrl;

      setDocumentPopup({ isOpen: true, url: presignedUrl, fileName, fileType });
    } catch (error) {
      console.error("Failed to fetch document URL:", error);
      alert("Failed to load document. Please try again.");
    }
  };

  const closeDocumentPopup = () => {
    setDocumentPopup(null);
  };

  // Filter and paginate certificates
  const filteredCertificates = useMemo(() => {
    return shareCertificates.filter((cert) => {
      const searchLower = certSearchQuery.toLowerCase();
      return (
        cert.acknowledgementNumber?.toLowerCase().includes(searchLower) ||
        cert.fullName?.toLowerCase().includes(searchLower) ||
        cert.flatNumber?.toLowerCase().includes(searchLower) ||
        cert.email?.toLowerCase().includes(searchLower) ||
        cert.wing?.toLowerCase().includes(searchLower)
      );
    });
  }, [shareCertificates, certSearchQuery]);

  const paginatedCertificates = useMemo(() => {
    const startIndex = (certCurrentPage - 1) * certItemsPerPage;
    const endIndex = startIndex + certItemsPerPage;
    return filteredCertificates.slice(startIndex, endIndex);
  }, [filteredCertificates, certCurrentPage, certItemsPerPage]);

  const certTotalPages = Math.ceil(filteredCertificates.length / certItemsPerPage);

  // Filter and paginate nominations
  const filteredNominations = useMemo(() => {
    return nominations.filter((nom: any) => {
      const searchLower = nomSearchQuery.toLowerCase();
      return (
        nom.acknowledgementNumber?.toLowerCase().includes(searchLower) ||
        nom.primaryMemberName?.toLowerCase().includes(searchLower) ||
        nom.memberFullName?.toLowerCase().includes(searchLower) ||
        nom.flatNumber?.toLowerCase().includes(searchLower) ||
        nom.primaryMemberEmail?.toLowerCase().includes(searchLower) ||
        nom.email?.toLowerCase().includes(searchLower) ||
        nom.wing?.toLowerCase().includes(searchLower)
      );
    });
  }, [nominations, nomSearchQuery]);

  const paginatedNominations = useMemo(() => {
    const startIndex = (nomCurrentPage - 1) * nomItemsPerPage;
    const endIndex = startIndex + nomItemsPerPage;
    return filteredNominations.slice(startIndex, endIndex);
  }, [filteredNominations, nomCurrentPage, nomItemsPerPage]);

  const nomTotalPages = Math.ceil(filteredNominations.length / nomItemsPerPage);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCertCurrentPage(1);
  }, [certSearchQuery]);

  useEffect(() => {
    setNomCurrentPage(1);
  }, [nomSearchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Admin Dashboard
                </h1>
                <p className="text-xs text-slate-500">Citron Documents App</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-center">
              <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 mr-4">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">
                  Total Certificates
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats?.shareCertificates.total || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-center">
              <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200 mr-4">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">
                  Total Nominations
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats?.nominations.total || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-center">
              <div className="h-14 w-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 mr-4">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Approved</p>
                <p className="text-3xl font-bold text-slate-900">
                  {(stats?.shareCertificates.approved || 0) +
                    (stats?.nominations.approved || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-center">
              <div className="h-14 w-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200 mr-4">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Pending</p>
                <p className="text-3xl font-bold text-slate-900">
                  {(stats?.shareCertificates.pending || 0) +
                    (stats?.nominations.pending || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-2">
          <div className="flex items-center justify-between">
            <nav className="flex gap-2">
              <button
                onClick={() => setActiveTab("certificates")}
                className={`${
                  activeTab === "certificates"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                } px-6 py-3 rounded-xl font-semibold text-sm transition-all`}>
                Share Certificates ({shareCertificates.length})
              </button>
              <button
                onClick={() => setActiveTab("nominations")}
                className={`${
                  activeTab === "nominations"
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                } px-6 py-3 rounded-xl font-semibold text-sm transition-all`}>
                Nominations ({nominations.length})
              </button>
            </nav>
            <Button
              onClick={() => handleExport(activeTab)}
              variant="outline"
              size="sm"
              className="gap-2">
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
          </div>
        </div>

        {/* Share Certificates Table */}
        {activeTab === "certificates" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, ack no, flat, email, wing..."
                  value={certSearchQuery}
                  onChange={(e) => setCertSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
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
                        className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          {cert.acknowledgementNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900 max-w-xs">
                          <div className="truncate">
                            {cert.fullName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {cert.wing && `Wing ${cert.wing} - `}{cert.flatNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs">
                          <div className="truncate">
                            {cert.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(cert.status!)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => router.push(`/admin/share-certificate/${cert.acknowledgementNumber}`)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                              View Details
                            </button>
                            <button
                              onClick={() => handleDelete(cert._id!, "certificate")}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete certificate">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
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
                  Showing {Math.min((certCurrentPage - 1) * certItemsPerPage + 1, filteredCertificates.length)} to{" "}
                  {Math.min(certCurrentPage * certItemsPerPage, filteredCertificates.length)} of{" "}
                  {filteredCertificates.length} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCertCurrentPage(certCurrentPage - 1)}
                    disabled={certCurrentPage === 1}
                    className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft className="h-5 w-5 text-slate-600" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: certTotalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCertCurrentPage(page)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          certCurrentPage === page
                            ? "bg-blue-600 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}>
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCertCurrentPage(certCurrentPage + 1)}
                    disabled={certCurrentPage === certTotalPages}
                    className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
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
            {/* Search Bar */}
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, ack no, flat, email, wing..."
                  value={nomSearchQuery}
                  onChange={(e) => setNomSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
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
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {paginatedNominations.length > 0 ? (
                    paginatedNominations.map((nom: any) => (
                      <tr
                        key={nom._id}
                        className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          {nom.acknowledgementNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900 max-w-xs">
                          <div className="truncate">
                            {nom.memberFullName || nom.primaryMemberName || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {nom.wing && `Wing ${nom.wing} - `}{nom.flatNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs">
                          <div className="truncate">
                            {nom.email || nom.primaryMemberEmail || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 font-semibold">
                            {nom.nominees?.length || 0}
                          </span>
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
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                              View Details
                            </button>
                            <button
                              onClick={() => handleDelete(nom._id!, "nomination")}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete nomination">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
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
                  Showing {Math.min((nomCurrentPage - 1) * nomItemsPerPage + 1, filteredNominations.length)} to{" "}
                  {Math.min(nomCurrentPage * nomItemsPerPage, filteredNominations.length)} of{" "}
                  {filteredNominations.length} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNomCurrentPage(nomCurrentPage - 1)}
                    disabled={nomCurrentPage === 1}
                    className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft className="h-5 w-5 text-slate-600" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: nomTotalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setNomCurrentPage(page)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          nomCurrentPage === page
                            ? "bg-purple-600 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}>
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setNomCurrentPage(nomCurrentPage + 1)}
                    disabled={nomCurrentPage === nomTotalPages}
                    className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <ChevronRight className="h-5 w-5 text-slate-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Document Viewer Popup */}
      {documentPopup && documentPopup.isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeDocumentPopup}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col"
            style={{ maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
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
            <div className="flex-1 p-4 overflow-auto">
              {documentPopup.fileType?.includes("pdf") ? (
                <iframe
                  src={documentPopup.url}
                  className="w-full h-full min-h-[60vh] border-0 rounded-lg"
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
            <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50 flex-shrink-0">
              <a
                href={documentPopup.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                <Download className="h-4 w-4" />
                Download Document
              </a>
              <Button onClick={closeDocumentPopup} variant="outline" size="sm">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
