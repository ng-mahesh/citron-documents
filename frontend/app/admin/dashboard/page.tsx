"use client";

import React, { useState, useEffect } from "react";
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
                  {shareCertificates.map((cert) => (
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
                        {cert.flatNumber}
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Nominations Table */}
        {activeTab === "nominations" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
                  {nominations.map((nom: any) => (
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
                        {nom.flatNumber}
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
              {documentPopup.fileType?.includes("pdf") ? (
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
