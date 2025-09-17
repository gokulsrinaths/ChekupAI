import React, { useState } from 'react';
import { Shield, Check, X, ChevronRight } from 'lucide-react';

const CONSENT_SCOPES = [
  { id: 'research-general', label: 'General Research', desc: 'Academic, non-commercial studies' },
  { id: 'pharma-rwd', label: 'Pharma RWD', desc: 'De-identified real‑world data for pharma research' },
  { id: 'ai-models', label: 'AI Model Training', desc: 'Model training on de‑identified data' },
];

const ConsentManager = ({ files = [], consents = {}, onChange }) => {
  const [localConsents, setLocalConsents] = useState(consents);

  const toggleConsent = (fileId, scopeId) => {
    const key = `${fileId}:${scopeId}`;
    const next = { ...localConsents, [key]: !localConsents[key] };
    setLocalConsents(next);
    onChange?.(next);
  };

  return (
    <div className="px-6 py-4">
      <div className="flex items-center mb-4">
        <Shield className="w-5 h-5 text-blue-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">Consent Manager</h2>
      </div>

      <div className="space-y-3">
        {files.map((file) => (
          <div key={file.id} className="bg-white card-premium p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{file.icon}</span>
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{file.type || 'Health File'}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            <div className="grid grid-cols-1 gap-2">
              {CONSENT_SCOPES.map((scope) => {
                const key = `${file.id}:${scope.id}`;
                const active = !!localConsents[key];
                return (
                  <button
                    key={scope.id}
                    onClick={() => toggleConsent(file.id, scope.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                      active ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                    aria-pressed={active}
                  >
                    <div className="text-left">
                      <p className={`text-sm font-medium ${active ? 'text-green-700' : 'text-gray-800'}`}>{scope.label}</p>
                      <p className="text-xs text-gray-500">{scope.desc}</p>
                    </div>
                    {active ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-gray-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConsentManager;


