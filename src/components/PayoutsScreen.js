import React from 'react';
import { CreditCard, Landmark, FileText, Shield } from 'lucide-react';

const PayoutsScreen = () => {
  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="px-6 py-6">
        <h1 className="text-xl font-semibold text-gray-900">Payouts</h1>
      </div>

      <div className="px-6 space-y-4">
        <div className="card-premium p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <p className="font-medium text-gray-900">KYC Verification</p>
          </div>
          <p className="text-sm text-gray-600 mb-3">Verify your identity to enable payouts.</p>
          <button className="btn-primary w-full">Start Verification</button>
        </div>

        <div className="card-premium p-4">
          <div className="flex items-center space-x-3 mb-3">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <p className="font-medium text-gray-900">Payout Methods</p>
          </div>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between px-3 py-3 rounded-lg bg-gray-50 hover:bg-gray-100">
              <span className="text-sm text-gray-800">Add Bank (ACH)</span>
              <Landmark className="w-4 h-4 text-gray-500" />
            </button>
            <button className="w-full flex items-center justify-between px-3 py-3 rounded-lg bg-gray-50 hover:bg-gray-100">
              <span className="text-sm text-gray-800">Add PayPal</span>
              <CreditCard className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="card-premium p-4">
          <div className="flex items-center space-x-3 mb-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <p className="font-medium text-gray-900">Payout History</p>
          </div>
          <p className="text-sm text-gray-600">No payouts yet.</p>
        </div>
      </div>
    </div>
  );
};

export default PayoutsScreen;


