'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FileText, Users, Search, Shield, CheckCircle, Clock, Award } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Housing Society</h1>
                <p className="text-xs text-slate-500">Member Portal</p>
              </div>
            </div>
            <Link href="/admin/login">
              <Button variant="outline" size="sm" className="gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 pt-16 pb-12">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Manage Your Society<br />
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Documents Online</span>
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Apply for share certificates, register nominations, and track applications—all from the comfort of your home
          </p>
        </div>
      </section>

      {/* Main Cards */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/share-certificate" className="group h-full">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 h-full flex flex-col">
              <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Share Certificate</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
                Apply for your share certificate with online document submission
              </p>
              <div className="flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
                Apply Now
                <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          <Link href="/nomination" className="group h-full">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300 h-full flex flex-col">
              <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Nomination Form</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
                Register your nominees for share certificate inheritance
              </p>
              <div className="flex items-center text-purple-600 font-medium text-sm group-hover:gap-2 transition-all">
                Submit Form
                <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          <Link href="/status" className="group h-full">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 h-full flex flex-col">
              <div className="h-14 w-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Search className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Track Status</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
                Check real-time status of your applications
              </p>
              <div className="flex items-center text-emerald-600 font-medium text-sm group-hover:gap-2 transition-all">
                Track Now
                <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
          <h3 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Why Choose Our Portal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Quick & Simple</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Submit applications without office visits
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Always Available</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Access portal 24/7 from anywhere
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Safe & Secure</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Your data is encrypted and protected
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <h3 className="text-3xl font-bold text-slate-900 mb-12 text-center">
          Simple Application Process
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="relative">
            <div className="text-center">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-2xl shadow-lg shadow-blue-200">
                1
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Fill Details</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Complete your application form online
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="text-center">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-2xl shadow-lg shadow-blue-200">
                2
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Upload Files</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Submit required documents securely
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="text-center">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-2xl shadow-lg shadow-blue-200">
                3
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Get Confirmed</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Receive acknowledgement via email
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="text-center">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-2xl shadow-lg shadow-blue-200">
                4
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Track Progress</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Monitor your application status
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-2">Need help? We're here for you</p>
            <p className="text-sm font-medium text-slate-900">
              society@example.com • +91 1234567890
            </p>
            <p className="mt-6 text-xs text-slate-500">
              &copy; 2024 Housing Society. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
