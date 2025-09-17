import React from 'react';
import { FileText } from 'lucide-react';

const LegalScreen = () => {
  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="px-6 py-6">
        <h1 className="text-xl font-semibold text-gray-900">Legal</h1>
      </div>

      <div className="px-6 space-y-4">
        {[{ title: 'Terms of Service' }, { title: 'Privacy Policy' }, { title: 'Acceptable Use' }].map((doc) => (
          <div key={doc.title} className="card-premium p-4">
            <div className="flex items-center space-x-3 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <p className="font-medium text-gray-900">{doc.title}</p>
            </div>
            <p className="text-sm text-gray-600">This is a demo summary. Full document available upon request.</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LegalScreen;


