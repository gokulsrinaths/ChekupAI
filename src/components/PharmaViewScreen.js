import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PharmaViewScreen = ({ onRequestDataset }) => {
  const [showConfirmation, setShowConfirmation] = useState(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customForm, setCustomForm] = useState({
    condition: '',
    patients: 1000,
    ageMin: 18,
    ageMax: 80,
    gender: 'any',
    locations: '',
    modalities: { imaging: true, lab: true, notes: false },
    budget: 50000
  });
  const [errors, setErrors] = useState({});
  const firstFieldRef = useRef(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('patients'); // patients | price

  useEffect(() => {
    if (showCustom && firstFieldRef.current) {
      firstFieldRef.current.focus();
    }
  }, [showCustom]);

  const categories = ['all', 'Cancer Research', 'Cardiovascular', 'Genetics'];

  const validate = () => {
    const e = {};
    if (!customForm.condition.trim()) e.condition = 'Condition is required';
    if (!customForm.patients || customForm.patients < 100) e.patients = 'Min 100 patients';
    if (!customForm.budget || customForm.budget < 1000) e.budget = 'Min $1,000 budget';
    if (customForm.ageMin < 0 || customForm.ageMax < customForm.ageMin) e.age = 'Age range invalid';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const datasets = [
    {
      id: 1,
      name: 'Oncology Dataset',
      patients: 50000,
      price: 250000,
      description: 'Comprehensive cancer research data with treatment outcomes',
      category: 'Cancer Research',
      icon: '🎗️'
    },
    {
      id: 2,
      name: 'Cardiology Dataset',
      patients: 30000,
      price: 180000,
      description: 'Heart disease patterns and treatment effectiveness',
      category: 'Cardiovascular',
      icon: '❤️'
    },
    {
      id: 3,
      name: 'Rare Diseases',
      patients: 5000,
      price: 75000,
      description: 'Specialized data for rare genetic conditions',
      category: 'Genetics',
      icon: '🧬'
    }
  ];

  const visibleDatasets = useMemo(() => {
    let list = datasets;
    if (category !== 'all') list = list.filter(d => d.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(d => d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q));
    }
    list = [...list].sort((a,b) => {
      if (sortBy === 'patients') return b.patients - a.patients;
      if (sortBy === 'price') return b.price - a.price;
      return 0;
    });
    return list;
  }, [query, category, sortBy]);

  const handleRequestDataset = (dataset) => {
    setShowConfirmation(dataset);
  };

  const handleConfirmRequest = () => {
    if (showConfirmation) {
      onRequestDataset?.(showConfirmation);
    }
    setShowConfirmation(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="px-6 py-6">
        <h1 className="text-xl font-semibold text-gray-900">Marketplace</h1>
        <p className="text-xs text-gray-500 mt-1">Search, filter, and request de-identified cohorts</p>
      </div>


      {/* Controls */}
      <div className="px-6 mb-3" style={{ position: 'sticky', top: 64, zIndex: 20, background: 'white', boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}>
        <input
          value={query}
          onChange={(e)=>{ setQuery(e.target.value); }}
          placeholder="Search datasets…"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="flex items-center space-x-2 mt-2 text-xs">
          {categories.map(cat => (
            <button key={cat} onClick={()=>setCategory(cat)} className={`px-2 py-1 rounded ${category===cat?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-600'}`}>{cat}</button>
          ))}
          <div className="ml-auto flex items-center space-x-1">
            <span className="text-gray-500">Sort</span>
            <select value={sortBy} onChange={(e)=>setSortBy(e.target.value)} className="px-2 py-1 rounded bg-gray-100">
              <option value="patients">Patients</option>
              <option value="price">Price</option>
            </select>
          </div>
        </div>
        <div className="text-[11px] text-gray-500 mt-1">{visibleDatasets.length} datasets</div>
      </div>

      {/* Datasets List */}
      <div className="px-6">
        <div className="space-y-2">
          {visibleDatasets.length === 0 && (
            <div className="bg-gray-50 rounded-xl p-6 text-center border border-dashed border-gray-200">
              <div className="text-3xl mb-2">🔍</div>
              <p className="text-sm text-gray-700 mb-3">No datasets match your filters.</p>
              <button onClick={()=>setShowCustom(true)} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm">Create Custom Request</button>
            </div>
          )}
          {visibleDatasets.map((dataset, index) => (
            <div
              key={dataset.id}
              className="flex items-center justify-between p-4 card-neo accent-left"
            >
              <div className="flex items-center space-x-3">
                <span className="icon-pill text-base">{dataset.icon}</span>
                <div>
                  <p className="font-medium text-gray-900">{dataset.name}</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-600">{dataset.patients.toLocaleString()} patients</p>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px]">{dataset.category}</span>
                  </div>
                  {dataset.description && (
                    <p className="text-xs text-gray-500 mt-1">{dataset.description}</p>
                  )}
                </div>
              </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-blue-600">{formatPrice(dataset.price)}</span>
                    <button
                      onClick={() => handleRequestDataset(dataset)}
                      className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs hover:bg-blue-100"
                    >
                      Request
                    </button>
                    <button
                      onClick={() => onRequestDataset?.({ ...dataset, price: 20 })}
                      className="px-3 py-1 rounded-lg bg-green-50 text-green-700 text-xs hover:bg-green-100"
                    >
                      Buy Sample Slice
                    </button>
                  </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Request CTA */}
      <div className="px-6 mt-4">
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Need a specific cohort?</h3>
              <p className="text-sm text-gray-600">Request by condition, cohort size, and location.</p>
            </div>
            <button onClick={()=>setShowCustom(true)} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm">Custom Request</button>
          </div>
        </div>
      </div>


      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmation(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-trust-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{showConfirmation.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Request Dataset</h3>
                <p className="text-gray-600 mb-4">
                  You're requesting access to <strong>{showConfirmation.name}</strong> for {formatPrice(showConfirmation.price)}.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Our team will review your request and get back to you within 2-3 business days.
                </p>
                
                <div className="flex space-x-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowConfirmation(null)}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleConfirmRequest}
                    className="flex-1 py-3 px-4 bg-trust-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Submit Request
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Request Modal */}
      <AnimatePresence>
        {showCustom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={()=>setShowCustom(false)}
            role="dialog" aria-modal="true"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-2xl p-5 max-w-sm w-full"
              onClick={(e)=>e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-3">Custom Dataset Request</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-gray-700 mb-1">Condition</label>
                  <input ref={firstFieldRef} value={customForm.condition} onChange={(e)=>setCustomForm({...customForm, condition:e.target.value})} className={`w-full px-3 py-2 border rounded-lg ${errors.condition?'border-red-500':'border-gray-300'}`} placeholder="e.g., Type 2 Diabetes" aria-invalid={!!errors.condition} aria-describedby={errors.condition?'cond-err':undefined} />
                  {errors.condition && <p id="cond-err" className="text-xs text-red-600 mt-1">{errors.condition}</p>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-700 mb-1">Patients</label>
                    <input type="number" value={customForm.patients} onChange={(e)=>setCustomForm({...customForm, patients:Number(e.target.value)})} className={`w-full px-3 py-2 border rounded-lg ${errors.patients?'border-red-500':'border-gray-300'}`} aria-invalid={!!errors.patients} aria-describedby={errors.patients?'pat-err':undefined} />
                    {errors.patients && <p id="pat-err" className="text-xs text-red-600 mt-1">{errors.patients}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Budget (USD)</label>
                    <input type="number" value={customForm.budget} onChange={(e)=>setCustomForm({...customForm, budget:Number(e.target.value)})} className={`w-full px-3 py-2 border rounded-lg ${errors.budget?'border-red-500':'border-gray-300'}`} aria-invalid={!!errors.budget} aria-describedby={errors.budget?'bud-err':undefined} />
                    {errors.budget && <p id="bud-err" className="text-xs text-red-600 mt-1">{errors.budget}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-gray-700 mb-1">Age Min</label>
                    <input type="number" value={customForm.ageMin} onChange={(e)=>setCustomForm({...customForm, ageMin:Number(e.target.value)})} className={`w-full px-3 py-2 border rounded-lg ${errors.age?'border-red-500':'border-gray-300'}`} aria-invalid={!!errors.age} />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Age Max</label>
                    <input type="number" value={customForm.ageMax} onChange={(e)=>setCustomForm({...customForm, ageMax:Number(e.target.value)})} className={`w-full px-3 py-2 border rounded-lg ${errors.age?'border-red-500':'border-gray-300'}`} aria-invalid={!!errors.age} />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Gender</label>
                    <select value={customForm.gender} onChange={(e)=>setCustomForm({...customForm, gender:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="any">Any</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Locations (comma-separated)</label>
                  <input value={customForm.locations} onChange={(e)=>setCustomForm({...customForm, locations:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g., California, Texas, India" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Modalities</label>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-1 text-gray-700"><input type="checkbox" checked={customForm.modalities.imaging} onChange={(e)=>setCustomForm({...customForm, modalities:{...customForm.modalities, imaging:e.target.checked}})} /><span>Imaging</span></label>
                    <label className="flex items-center space-x-1 text-gray-700"><input type="checkbox" checked={customForm.modalities.lab} onChange={(e)=>setCustomForm({...customForm, modalities:{...customForm.modalities, lab:e.target.checked}})} /><span>Lab</span></label>
                    <label className="flex items-center space-x-1 text-gray-700"><input type="checkbox" checked={customForm.modalities.notes} onChange={(e)=>setCustomForm({...customForm, modalities:{...customForm.modalities, notes:e.target.checked}})} /><span>Notes</span></label>
                  </div>
                </div>
                <div className="text-[11px] text-gray-500">We de-identify to HIPAA Safe Harbor and normalize to FHIR/DICOM where applicable.</div>
                <div className="flex space-x-2 pt-1">
                  <button onClick={()=>setShowCustom(false)} className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-800">Cancel</button>
                  <button onClick={()=>{ if(!validate()) return; const name = customForm.condition ? `Custom: ${customForm.condition}` : 'Custom Request'; const price = Number(customForm.budget)||0; const dataset={ id: Date.now(), name, patients: customForm.patients, price, icon: '🧬' }; onRequestDataset?.(dataset); setShowCustom(false); }} className="flex-1 py-2 rounded-lg bg-blue-600 text-white">Submit</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trust badges */}
      <div className="px-6 mt-4">
        <div className="flex items-center space-x-2 text-[10px] text-gray-600">
          <span className="px-2 py-1 rounded bg-gray-100">HIPAA Safe Harbor</span>
          <span className="px-2 py-1 rounded bg-gray-100">GDPR</span>
          <span className="px-2 py-1 rounded bg-gray-100">Zero Data Training</span>
        </div>
      </div>
    </div>
  );
};

export default PharmaViewScreen;
