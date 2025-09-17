import React from 'react';
import { ShieldCheck, FileLock2, Scale, FileText } from 'lucide-react';

const TrustComplianceScreen = () => {
  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="px-6 py-6">
        <h1 className="text-xl font-semibold text-gray-900">Trust & Compliance</h1>
      </div>

      <div className="px-6 space-y-4">
        <div className="card-premium p-4">
          <div className="flex items-center space-x-3 mb-3">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <p className="font-medium text-gray-900">HIPAA Safe Harbor</p>
          </div>
          <p className="text-sm text-gray-600">All data processing follows HIPAA Safe Harbor de‑identification standards.</p>
        </div>

        <div className="card-premium p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Scale className="w-5 h-5 text-blue-600" />
            <p className="font-medium text-gray-900">GDPR / CCPA</p>
          </div>
          <p className="text-sm text-gray-600">You can access, export, or delete your data at any time from Settings.</p>
        </div>

        <div className="card-premium p-4">
          <div className="flex items-center space-x-3 mb-3">
            <FileLock2 className="w-5 h-5 text-blue-600" />
            <p className="font-medium text-gray-900">Security Posture</p>
          </div>
          <p className="text-sm text-gray-600">Device‑side encryption narrative and minimized data retention by design.</p>
        </div>

        <div className="card-premium p-4">
          <div className="flex items-center space-x-3 mb-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <p className="font-medium text-gray-900">Data Processing Addendum</p>
          </div>
          <p className="text-sm text-gray-600">Sample DPA/BAA stubs for enterprise customers (UI only).</p>
        </div>
      </div>
    </div>
  );
};

export default TrustComplianceScreen;


