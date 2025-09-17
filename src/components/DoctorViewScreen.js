import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Eye, FileText, Calendar, User, Hash } from 'lucide-react';

const DoctorViewScreen = ({ onViewCase, sharedFiles = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');

  // Transform shared files into research items for doctors (no raw content, no money)
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
        description: `${f.type} • ${f.size || '—'} • ${f.date || ''}`,
        shareTarget: f.shareTarget,
        fullData: f // Store full file data for preview
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
    setSelectedFile(caseData);
    onViewCase?.(caseData);
  };

  const handleAISend = () => {
    if (!aiInput.trim()) return;
    
    const userMessage = { type: 'user', text: aiInput };
    setAiMessages(prev => [...prev, userMessage]);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        type: 'ai',
        text: `Based on this ${selectedFile?.type} file, I can see patterns that suggest ${selectedFile?.condition}. The data shows typical characteristics for a ${selectedFile?.age}-year-old ${selectedFile?.gender?.toLowerCase()}. Would you like me to analyze specific aspects?`
      };
      setAiMessages(prev => [...prev, aiResponse]);
    }, 1000);
    
    setAiInput('');
  };

  const aiTip = useMemo(() => {
    const count = searchResults.length;
    if (count === 0) return 'No results. Try broader terms (e.g., "hypertension").';
    const female = searchResults.filter(c=>c.gender==='Female').length;
    return `AI tip: ${female}/${count} matches are female; consider age 40–60 for better similarity.`;
  }, [searchResults]);

  return (
    <div className="min-h-screen bg-white pb-24 max-w-mobile mx-auto">
      {/* Header */}
      <div className="px-4 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Research Database</h1>
        <p className="text-[10px] text-gray-500 mt-1">No raw files are shared here. Views are simulated.</p>
        <p className="text-xs text-gray-500">Browse patient-shared records for research purposes</p>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search cases..."
          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-1">
            <button onClick={()=>{ setFilter('all'); handleSearch(searchQuery); }} className={`px-2 py-1 rounded text-xs ${filter==='all'?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-600'}`}>All</button>
            <button onClick={()=>{ setFilter('female'); handleSearch(searchQuery); }} className={`px-2 py-1 rounded text-xs ${filter==='female'?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-600'}`}>Female</button>
            <button onClick={()=>{ setFilter('male'); handleSearch(searchQuery); }} className={`px-2 py-1 rounded text-xs ${filter==='male'?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-600'}`}>Male</button>
          </div>
          <span className="text-xs text-gray-500">{searchResults.length} matches</span>
        </div>
      </div>

      {/* Results */}
      <div className="px-4">
        <div className="space-y-2">
          {searchResults.map((caseData, index) => (
            <div
              key={caseData.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <span className="text-lg flex-shrink-0">{caseData.mriThumbnail}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{caseData.condition}</p>
                  <p className="text-xs text-gray-600 truncate">{caseData.description}</p>
                  {caseData.shareTarget && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 inline-block mt-1">Shared to {caseData.shareTarget}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleViewCase(caseData)}
                className="flex items-center space-x-1 px-2 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
              >
                <Eye className="w-3 h-3" />
                <span className="hidden sm:inline">View</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* AI Tip */}
      <div className="px-4 mt-4">
        <div className="text-xs text-blue-700 bg-blue-50 rounded-lg p-2">
          {aiTip}
        </div>
      </div>

      {/* File Preview Modal */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">File Preview</h3>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setShowAIChat(false);
                    setAiMessages([]);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {/* File Icon */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">{selectedFile.mriThumbnail}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">{selectedFile.condition}</h4>
                </div>

                {/* File Details */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{selectedFile.type}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Patient:</span>
                    <span className="font-medium">{selectedFile.age}y, {selectedFile.gender}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{selectedFile.fullData?.date || 'Recent'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{selectedFile.fullData?.size || '—'}</span>
                  </div>
                </div>

                {/* AI Chat Toggle */}
                <div className="pt-4 border-t">
                  <button
                    onClick={() => setShowAIChat(!showAIChat)}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{showAIChat ? 'Hide' : 'Ask AI about this file'}</span>
                  </button>
                </div>

                {/* AI Chat */}
                {showAIChat && (
                  <div className="mt-4 space-y-3">
                    <div className="text-sm font-medium text-gray-700">AI Assistant</div>
                    <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                      {aiMessages.length === 0 ? (
                        <p className="text-sm text-gray-500">Ask me anything about this file...</p>
                      ) : (
                        aiMessages.map((msg, idx) => (
                          <div key={idx} className={`mb-2 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block p-2 rounded text-xs ${
                              msg.type === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-white text-gray-800'
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        placeholder="Ask about this file..."
                        className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && handleAISend()}
                      />
                      <button
                        onClick={handleAISend}
                        className="px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorViewScreen;