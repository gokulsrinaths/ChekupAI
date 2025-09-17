import React from 'react';
import { BadgeDollarSign, Building2 } from 'lucide-react';

const tiers = [
  { id: 'doctor', title: 'Doctor', price: '$29/mo', features: ['Case search', 'Micro-royalties', 'Audit log'], icon: BadgeDollarSign },
  { id: 'pharma', title: 'Pharma', price: 'Contact sales', features: ['Dataset marketplace', 'Packaging pipeline', 'DPA/BAA'], icon: Building2 },
];

const PricingScreen = () => {
  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="px-6 py-6">
        <h1 className="text-xl font-semibold text-gray-900">Pricing</h1>
      </div>

      <div className="px-6 grid gap-4">
        {tiers.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.id} className="card-premium p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Icon className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">{t.title}</h3>
                </div>
                <p className="text-sm text-gray-700">{t.price}</p>
              </div>
              <ul className="text-sm text-gray-600 list-disc ml-5 space-y-1">
                {t.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <button className="btn-primary w-full mt-4">Get started</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PricingScreen;


