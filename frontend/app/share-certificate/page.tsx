'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FileUpload } from '@/components/forms/FileUpload';
import { shareCertificateAPI } from '@/lib/api';
import { DocumentMetadata, MembershipType } from '@/lib/types';
import { CheckCircle } from 'lucide-react';

export default function ShareCertificatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    flatNumber: '',
    wing: '' as 'C' | 'D' | '',
    email: '',
    mobileNumber: '',
    carpetArea: '',
    builtUpArea: '',
    membershipType: '' as MembershipType,
    digitalSignature: '',
    declarationAccepted: false,
  });

  const [documents, setDocuments] = useState<{
    index2Document?: DocumentMetadata;
    possessionLetterDocument?: DocumentMetadata;
    aadhaarCardDocument?: DocumentMetadata;
  }>({});

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [acknowledgementNumber, setAcknowledgementNumber] = useState('');

  const membershipTypes = [
    { value: 'Primary', label: 'Primary Member' },
    { value: 'Spouse', label: 'Spouse' },
    { value: 'Son', label: 'Son' },
    { value: 'Daughter', label: 'Daughter' },
    { value: 'Legal Heir', label: 'Legal Heir' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.flatNumber.trim()) newErrors.flatNumber = 'Flat number is required';
    else if (!/^\d+$/.test(formData.flatNumber)) newErrors.flatNumber = 'Flat number must contain only numbers';
    if (!formData.wing) newErrors.wing = 'Wing is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Please enter a valid email to receive updates';
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number with WhatsApp';
    // Carpet area and built-up area are now optional
    if (formData.carpetArea && Number(formData.carpetArea) <= 0) newErrors.carpetArea = 'Carpet area must be greater than 0';
    if (formData.builtUpArea && Number(formData.builtUpArea) <= 0) newErrors.builtUpArea = 'Built-up area must be greater than 0';
    if (!formData.membershipType) newErrors.membershipType = 'Membership type is required';
    if (!formData.digitalSignature.trim()) newErrors.digitalSignature = 'Digital signature is required';
    if (!formData.declarationAccepted) newErrors.declarationAccepted = 'You must accept the declaration';

    if (!documents.index2Document?.fileName) newErrors.index2Document = 'Index II document is required';
    if (!documents.possessionLetterDocument?.fileName) newErrors.possessionLetterDocument = 'Possession letter is required';
    if (!documents.aadhaarCardDocument?.fileName) newErrors.aadhaarCardDocument = 'Aadhaar card is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        carpetArea: formData.carpetArea ? Number(formData.carpetArea) : undefined,
        builtUpArea: formData.builtUpArea ? Number(formData.builtUpArea) : undefined,
        index2Document: documents.index2Document,
        possessionLetterDocument: documents.possessionLetterDocument,
        aadhaarCardDocument: documents.aadhaarCardDocument,
      };

      const response = await shareCertificateAPI.create(payload);
      // Backend returns { success, message, data: { acknowledgementNumber, email } }
      const ackNumber = response.data.data?.acknowledgementNumber || response.data.acknowledgementNumber;
      setAcknowledgementNumber(ackNumber);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
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
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Successfully Submitted!</h2>
            <p className="text-slate-600 mb-6">Your acknowledgement number:</p>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-500 rounded-xl p-5 mb-8">
              <p className="text-3xl font-bold text-blue-700 tracking-wide">{acknowledgementNumber}</p>
            </div>
            <p className="text-sm text-slate-600 mb-8 leading-relaxed">
              Save this number for tracking. A confirmation email has been sent to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => router.push('/status')} className="flex-1 sm:flex-initial">
                Track Status
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()} className="flex-1 sm:flex-initial">
                Submit Another
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-4">
            <span className="mr-2">←</span> Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Share Certificate Application</h1>
          <p className="text-lg text-slate-600">Complete the form below to apply for your share certificate</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-8 py-5 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
              <p className="text-sm text-slate-600 mt-1">Enter your basic details as per official documents</p>
            </div>
            <div className="px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  error={errors.fullName}
                  placeholder="Enter full name"
                  helperText="As per Index II document"
                  required
                />
                <Input
                  label="Flat Number"
                  name="flatNumber"
                  value={formData.flatNumber}
                  onChange={handleInputChange}
                  error={errors.flatNumber}
                  placeholder="e.g., 101"
                  type="text"
                  required
                />
                <Select
                  label="Wing"
                  name="wing"
                  value={formData.wing}
                  onChange={handleInputChange}
                  options={[
                    { value: 'C', label: 'C' },
                    { value: 'D', label: 'D' },
                  ]}
                  error={errors.wing}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  placeholder="your.email@example.com"
                  helperText="For updates and notifications"
                  required
                />
                <Input
                  label="Mobile Number"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  error={errors.mobileNumber}
                  placeholder="9876543210"
                  helperText="WhatsApp enabled number"
                  maxLength={10}
                  required
                />
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-8 py-5 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Property Details</h3>
              <p className="text-sm text-slate-600 mt-1">Provide information about your flat</p>
            </div>
            <div className="px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Carpet Area"
                  type="number"
                  name="carpetArea"
                  value={formData.carpetArea}
                  onChange={handleInputChange}
                  error={errors.carpetArea}
                  placeholder="e.g., 850"
                  helperText="In square feet (optional)"
                />
                <Input
                  label="Built-up Area"
                  type="number"
                  name="builtUpArea"
                  value={formData.builtUpArea}
                  onChange={handleInputChange}
                  error={errors.builtUpArea}
                  placeholder="e.g., 1000"
                  helperText="In square feet (optional)"
                />
                <div className="md:col-span-2">
                  <Select
                    label="Membership Type"
                    name="membershipType"
                    value={formData.membershipType}
                    onChange={handleInputChange}
                    options={membershipTypes}
                    error={errors.membershipType}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Required Documents */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-8 py-5 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Required Documents</h3>
              <p className="text-sm text-slate-600 mt-1">Upload clear copies in PDF or JPEG format (max 2MB each)</p>
            </div>
            <div className="px-8 py-6">
              <div className="space-y-6">
                <FileUpload
                  label="Index II Document"
                  required
                  flatNumber={formData.flatNumber}
                  documentType="INDEX2"
                  fullName={formData.fullName}
                  onUploadSuccess={(metadata) =>
                    setDocuments((prev) => ({ ...prev, index2Document: metadata }))
                  }
                  value={documents.index2Document}
                  error={errors.index2Document}
                />
                <FileUpload
                  label="Possession Letter"
                  required
                  flatNumber={formData.flatNumber}
                  documentType="POSSESSION_LETTER"
                  fullName={formData.fullName}
                  onUploadSuccess={(metadata) =>
                    setDocuments((prev) => ({ ...prev, possessionLetterDocument: metadata }))
                  }
                  value={documents.possessionLetterDocument}
                  error={errors.possessionLetterDocument}
                />
                <FileUpload
                  label="Aadhaar Card"
                  required
                  flatNumber={formData.flatNumber}
                  documentType="AADHAAR"
                  fullName={formData.fullName}
                  onUploadSuccess={(metadata) =>
                    setDocuments((prev) => ({ ...prev, aadhaarCardDocument: metadata }))
                  }
                  value={documents.aadhaarCardDocument}
                  error={errors.aadhaarCardDocument}
                />
              </div>
            </div>
          </div>

          {/* Declaration */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-8 py-5 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Declaration</h3>
              <p className="text-sm text-slate-600 mt-1">Confirm the accuracy of your information</p>
            </div>
            <div className="px-8 py-6">
              <div className="space-y-5">
                <Input
                  label="Digital Signature"
                  name="digitalSignature"
                  value={formData.digitalSignature}
                  onChange={handleInputChange}
                  error={errors.digitalSignature}
                  placeholder="Type your full name"
                  helperText="Type your full name to sign digitally"
                  required
                />
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="declarationAccepted"
                      checked={formData.declarationAccepted}
                      onChange={handleInputChange}
                      className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <div className="flex-1">
                      <label className="text-sm text-slate-700 leading-relaxed">
                        I hereby declare that all the information provided above is true and correct to the best of my knowledge. I understand that any false information may result in rejection of my application.
                      </label>
                      {errors.declarationAccepted && (
                        <span className="block text-red-600 text-sm mt-2">{errors.declarationAccepted}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => router.push('/')} className="sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} className="sm:w-auto">
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
