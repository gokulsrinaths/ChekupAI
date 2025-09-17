import React from 'react';
import { HelpCircle, Mail, MessageSquare } from 'lucide-react';

const SupportScreen = () => {
  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="px-6 py-6">
        <h1 className="text-xl font-semibold text-gray-900">Support</h1>
      </div>

      <div className="px-6 space-y-4">
        <div className="card-premium p-4">
          <div className="flex items-center space-x-3 mb-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <p className="font-medium text-gray-900">Help Center</p>
          </div>
          <p className="text-sm text-gray-600">Guides and FAQs (UI only).</p>
          <button className="btn-primary w-full mt-3">Open Help</button>
        </div>

        <div className="card-premium p-4">
          <div className="flex items-center space-x-3 mb-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <p className="font-medium text-gray-900">Feedback</p>
          </div>
          <p className="text-sm text-gray-600">Send product feedback.</p>
          <button className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white">Send Feedback</button>
        </div>

        <div className="card-premium p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <p className="font-medium text-gray-900">Contact</p>
          </div>
          <p className="text-sm text-gray-600">support@chekup.ai</p>
        </div>
      </div>
    </div>
  );
};

export default SupportScreen;


