import React from 'react';
import { Activity, BarChart3, AlertTriangle } from 'lucide-react';

const AnalyticsScreen = () => {
  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="px-6 py-6">
        <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
      </div>

      <div className="px-6 space-y-4">
        <div className="card-premium p-4">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <p className="font-medium text-gray-900">Funnel (UI only)</p>
          </div>
          <p className="text-sm text-gray-600">Onboarding → Consent → Share → Wallet</p>
        </div>

        <div className="card-premium p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <p className="font-medium text-gray-900">Recent Events</p>
          </div>
          <p className="text-sm text-gray-600">Events feed coming from client-side (mocked).</p>
        </div>

        <div className="card-premium p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            <p className="font-medium text-gray-900">Errors</p>
          </div>
          <p className="text-sm text-gray-600">Client errors and performance timings (placeholder UI).</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsScreen;


