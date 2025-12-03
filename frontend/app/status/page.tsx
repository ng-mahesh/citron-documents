'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { shareCertificateAPI, nominationAPI, nocRequestAPI } from '@/lib/api';
import { Search, CheckCircle, Clock, XCircle, AlertCircle, FileText } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { theme } from '@/lib/theme';

export default function StatusPage() {
  const [acknowledgementNumber, setAcknowledgementNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <div className={`h-20 w-20 bg-gradient-to-br ${theme.status.approved.icon} rounded-full flex items-center justify-center mx-auto shadow-lg ${theme.colors.shadows.primary}`}>
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
        );
      case 'Rejected':
        return (
          <div className={`h-20 w-20 bg-gradient-to-br ${theme.status.rejected.icon} rounded-full flex items-center justify-center mx-auto shadow-lg shadow-red-200`}>
            <XCircle className="h-10 w-10 text-white" />
          </div>
        );
      case 'Under Review':
        return (
          <div className={`h-20 w-20 bg-gradient-to-br ${theme.status.underReview.icon} rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-200`}>
            <Clock className="h-10 w-10 text-white" />
          </div>
        );
      case 'Document Required':
        return (
          <div className={`h-20 w-20 bg-gradient-to-br ${theme.status.documentRequired.icon} rounded-full flex items-center justify-center mx-auto shadow-lg shadow-orange-200`}>
            <FileText className="h-10 w-10 text-white" />
          </div>
        );
      default:
        return (
          <div className={`h-20 w-20 bg-gradient-to-br ${theme.status.pending.icon} rounded-full flex items-center justify-center mx-auto shadow-lg ${theme.colors.shadows.primary}`}>
            <Clock className="h-10 w-10 text-white" />
          </div>
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return `${theme.status.approved.bg} ${theme.status.approved.border} ${theme.status.approved.text}`;
      case 'Rejected':
        return `${theme.status.rejected.bg} ${theme.status.rejected.border} ${theme.status.rejected.text}`;
      case 'Under Review':
        return `${theme.status.underReview.bg} ${theme.status.underReview.border} ${theme.status.underReview.text}`;
      case 'Document Required':
        return `${theme.status.documentRequired.bg} ${theme.status.documentRequired.border} ${theme.status.documentRequired.text}`;
      default:
        return `${theme.status.pending.bg} ${theme.status.pending.border} ${theme.status.pending.text}`;
    }
  };

  const handleSearch = async () => {
    if (!acknowledgementNumber.trim()) {
      setError('Please enter an acknowledgement number');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      let response;
      if (acknowledgementNumber.startsWith('SC-')) {
        response = await shareCertificateAPI.getStatus(acknowledgementNumber);
      } else if (acknowledgementNumber.startsWith('NOM-')) {
        response = await nominationAPI.getStatus(acknowledgementNumber);
      } else if (acknowledgementNumber.startsWith('NOC-')) {
        response = await nocRequestAPI.getStatus(acknowledgementNumber);
      } else {
        setError('Invalid acknowledgement number format. Must start with SC-, NOM-, or NOC-');
        setLoading(false);
        return;
      }

      // Backend returns { success, data: { ... } }, we need the nested data
      const resultData = response.data.data || response.data;
      setResult(resultData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Application not found. Please check the acknowledgement number.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Track Application Status
          </h1>
          <p className="text-lg text-slate-600">
            Enter your acknowledgement number to check your application status
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-8">
          <div className="px-8 py-6">
            <div className="space-y-5">
              <Input
                label="Acknowledgement Number"
                placeholder="e.g., SC-20240101-00001, NOM-20240101-00001, or NOC-20240101-00001"
                value={acknowledgementNumber}
                onChange={(e) => {
                  setAcknowledgementNumber(e.target.value.toUpperCase());
                  setError("");
                }}
                helperText="Format: SC-YYYYMMDD-XXXXX for Share Certificate, NOM-YYYYMMDD-XXXXX for Nomination, or NOC-YYYYMMDD-XXXXX for NOC Request"
              />
              <Button
                onClick={handleSearch}
                isLoading={loading}
                className="w-full gap-2">
                <Search className="h-5 w-5" />
                Search Application
              </Button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-gradient-to-br from-red-50 to-red-100/50 border-2 border-red-300 rounded-2xl p-6">
            <div className="flex items-center gap-3 text-red-800">
              <div className="h-10 w-10 bg-red-200 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-700" />
              </div>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg mb-8">
            {/* Status Header */}
            <div className="text-center px-8 py-8 border-b border-slate-200">
              {getStatusIcon(result.status)}
              <h2 className="text-2xl font-bold text-slate-900 mt-6 mb-4">
                {result.type === "share-certificate"
                  ? "Share Certificate Application"
                  : result.type === "noc-request"
                  ? "NOC Request Application"
                  : "Nomination Application"}
              </h2>
              <div
                className={`inline-block px-6 py-3 rounded-xl border-2 ${getStatusColor(
                  result.status
                )}`}>
                <p className="font-bold text-xl">{result.status}</p>
              </div>
            </div>

            {/* Application Details */}
            <div className="px-8 py-6">
              <dl className="grid grid-cols-1 gap-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <dt className="text-sm font-semibold text-slate-600 mb-1">
                    Acknowledgement Number
                  </dt>
                  <dd className="text-xl font-bold text-slate-900">
                    {result.acknowledgementNumber}
                  </dd>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <dt className="text-sm font-semibold text-slate-600 mb-2">
                      {result.type === "noc-request" ? "Seller Name" : "Full Name"}
                    </dt>
                    <dd className="text-base text-slate-900">
                      {result.fullName || result.memberFullName || result.sellerName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-semibold text-slate-600 mb-2">
                      Flat Number
                    </dt>
                    <dd className="text-base text-slate-900">
                      {result.flatNumber}
                    </dd>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <dt className="text-sm font-semibold text-slate-600 mb-2">
                      Wing
                    </dt>
                    <dd className="text-base text-slate-900">
                      Wing {result.wing}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-semibold text-slate-600 mb-2">
                      Email
                    </dt>
                    <dd className="text-base text-slate-900">{result.email}</dd>
                  </div>
                </div>

                {/* NOC Specific Fields */}
                {result.type === "noc-request" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <dt className="text-sm font-semibold text-slate-600 mb-2">
                          Buyer Name
                        </dt>
                        <dd className="text-base text-slate-900">
                          {result.buyerName}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-semibold text-slate-600 mb-2">
                          Payment Status
                        </dt>
                        <dd className="text-base">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg font-semibold ${
                            result.paymentStatus === 'Paid'
                              ? 'bg-green-100 text-green-800'
                              : result.paymentStatus === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {result.paymentStatus}
                          </span>
                        </dd>
                      </div>
                    </div>
                    <div className={`p-4 ${theme.status.pending.bg} rounded-xl border ${theme.status.pending.border}`}>
                      <dt className="text-sm font-semibold text-slate-600 mb-2">
                        Payment Amount
                      </dt>
                      <dd className={`text-2xl font-bold ${theme.status.pending.text}`}>
                        ₹{result.paymentAmount || '26,000'}
                      </dd>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <dt className="text-sm font-semibold text-slate-600 mb-2">
                      Submitted On
                    </dt>
                    <dd className="text-base text-slate-900">
                      {formatDate(result.submittedAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-semibold text-slate-600 mb-2">
                      Last Updated
                    </dt>
                    <dd className="text-base text-slate-900">
                      {formatDate(result.updatedAt)}
                    </dd>
                  </div>
                </div>

                {result.adminNotes && (
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-2 border-amber-300 rounded-xl p-5">
                    <dt className="text-sm font-bold text-amber-900 mb-2">
                      Admin Notes
                    </dt>
                    <dd className="text-sm text-amber-800 leading-relaxed">
                      {result.adminNotes}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Next Steps */}
            <div className="px-8 py-6 border-t border-slate-200 bg-slate-50">
              <div className={`${theme.status.pending.bg} border-2 ${theme.status.pending.border} rounded-xl p-5`}>
                <h3 className={`text-base font-bold ${theme.status.pending.text} mb-3 flex items-center gap-2`}>
                  <div className={`h-6 w-6 bg-gradient-to-br ${theme.status.pending.icon} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-xs">ℹ</span>
                  </div>
                  What happens next?
                </h3>
                <ul className={`text-sm ${theme.status.pending.text} space-y-2 leading-relaxed`}>
                  {result.status === "Pending" && (
                    <>
                      <li className="flex items-start gap-2">
                        <span className={`${theme.status.pending.text} mt-0.5`}>•</span>
                        <span>Your application is in queue for review</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`${theme.status.pending.text} mt-0.5`}>•</span>
                        <span>
                          You will receive an email when the review begins
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`${theme.status.pending.text} mt-0.5`}>•</span>
                        <span>Typical review time is 7-10 business days</span>
                      </li>
                    </>
                  )}
                  {result.status === "Under Review" && (
                    <>
                      <li className="flex items-start gap-2">
                        <span className={`${theme.status.pending.text} mt-0.5`}>•</span>
                        <span>
                          Our team is currently reviewing your application
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`${theme.status.pending.text} mt-0.5`}>•</span>
                        <span>
                          You will be notified of the decision via email
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`${theme.status.pending.text} mt-0.5`}>•</span>
                        <span>
                          Please check this page regularly for updates
                        </span>
                      </li>
                    </>
                  )}
                  {result.status === "Document Required" && (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>
                          Additional documents are required to process your
                          application
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>
                          Please check your email for specific requirements
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>
                          You may need to submit a new application with the
                          required documents
                        </span>
                      </li>
                    </>
                  )}
                  {result.status === "Approved" && (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Your application has been approved!</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>
                          You will receive the certificate via email and post
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Please allow 5-7 business days for delivery</span>
                      </li>
                    </>
                  )}
                  {result.status === "Rejected" && (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Your application was not approved</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>
                          Please check the admin notes above for the reason
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>
                          You may submit a new application after addressing the
                          issues
                        </span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {result && (
          <div className="flex justify-center mb-8">
            <Button
              onClick={() => window.location.href = "/"}
              variant="outline"
              className="px-8">
              Back to Home
            </Button>
          </div>
        )}
        <div className="text-center">
          <p className="text-sm text-slate-600 mb-2">
            Need help? We're here for you
          </p>
          <p className="text-sm font-medium text-slate-900">
            office@citronsociety.in • +91 9673639643
          </p>
        </div>
      </div>
    </div>
  );
}
