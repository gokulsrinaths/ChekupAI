import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DoctorViewScreen = ({ onViewCase, sharedFiles = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPaymentAnimation, setShowPaymentAnimation] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [filter, setFilter] = useState('all');

  // Transform shared files into research items for doctors (no raw content)
  const cases = useMemo(() => {
    return sharedFiles
      .filter(f => f.status === 'shared' || f.status === 'earned')
      .map((f, idx) => ({
        id: f.id || idx,
        condition: f.name,
        type: f.type,
        gender: f.gender || (idx % 2 === 0 ? 'Male' : 'Female'),
        age: f.age || (28 + (idx % 30)),
        mriThumbnail: f.icon || '📄',
        price: 10 + (idx % 6),
        description: `${f.type} • ${f.size || '—'} • ${f.date || ''}`,
        shareTarget: f.shareTarget
      }));
  }, [sharedFiles]);

  // Initialize search results with current cases
  React.useEffect(() => {
    setSearchResults(cases);
  }, [cases]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      const base = cases;
      const filtered = base.filter(caseData => 
        caseData.condition.toLowerCase().includes(query.toLowerCase()) ||
        caseData.description.toLowerCase().includes(query.toLowerCase())
      );
      const byFilter = (filter === 'all') ? filtered : filtered.filter(c => c.gender.toLowerCase() === filter);
      setSearchResults(query ? byFilter : (filter==='all' ? base : base.filter(c=>c.gender.toLowerCase()===filter)));
      setIsSearching(false);
    }, 500);
  };

  const handleViewCase = (caseData) => {
    // Animate balance increase
    setShowPaymentAnimation(true);
    onViewCase?.(caseData);
    
    setTimeout(() => setShowPaymentAnimation(false), 2000);
  };

  const aiTip = useMemo(() => {
    const count = searchResults.length;
    if (count === 0) return 'No results. Try broader terms (e.g., “hypertension”).';
    const female = searchResults.filter(c=>c.gender==='Female').length;
    return `AI tip: ${female}/${count} matches are female; consider age 40–60 for better similarity.`;
  }, [searchResults]);

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="px-6 py-6">
        <h1 className="text-xl font-semibold text-gray-900">Research</h1>
        <p className="text-[10px] text-gray-500 mt-1">No raw files are shared here. Views are simulated.</p>
        <p className="text-xs text-gray-500">Browse patient-shared records. Ask or filter to find similar cases</p>
      </div>

      {/* Search Bar */}
      <div className="px-6 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search cases..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="flex items-center space-x-2 mt-2 text-xs">
          <button onClick={()=>{ setFilter('all'); handleSearch(searchQuery); }} className={`px-2 py-1 rounded ${filter==='all'?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-600'}`}>All</button>
          <button onClick={()=>{ setFilter('female'); handleSearch(searchQuery); }} className={`px-2 py-1 rounded ${filter==='female'?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-600'}`}>Female</button>
          <button onClick={()=>{ setFilter('male'); handleSearch(searchQuery); }} className={`px-2 py-1 rounded ${filter==='male'?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-600'}`}>Male</button>
          <span className="ml-auto text-gray-500">{searchResults.length} matches</span>
        </div>
      </div>

      {/* Results */}
      <div className="px-6">
        <div className="space-y-2">
          {searchResults.map((caseData, index) => (
            <div
              key={caseData.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{caseData.mriThumbnail}</span>
                <div>
                  <p className="font-medium text-gray-900">{caseData.condition}</p>
                  <p className="text-sm text-gray-600">{caseData.description}</p>
                  {caseData.shareTarget && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600">Shared to {caseData.shareTarget}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-blue-600">${caseData.price}</span>
                <button
                  onClick={() => handleViewCase(caseData)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Tip */}
      <div className="px-6 mt-4">
        <div className="text-xs text-blue-700 bg-blue-50 rounded-lg p-2">
          {aiTip}
        </div>
      </div>

      {/* Payment Animation */}
      <AnimatePresence>
        {showPaymentAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-2xl p-8 shadow-2xl border-4 border-money-green">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-money-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">💰</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Received!</h3>
                <p className="text-money-green text-2xl font-bold">+$1.00</p>
                <p className="text-sm text-gray-600 mt-2">Added to your balance</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="px-6 mt-6"
      >
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Your Balance</p>
              <p className="text-2xl font-bold text-money-green">$—</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Research Earnings</p>
              <p className="text-lg font-semibold text-trust-blue">+$3.00</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DoctorViewScreen;