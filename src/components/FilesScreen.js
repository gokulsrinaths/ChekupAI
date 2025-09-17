import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FilesScreen = ({ userData, onDataUpdate, onAddAuditEvent }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTarget, setShareTarget] = useState('community'); // 'community' | 'family'
  const [showDetail, setShowDetail] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const aiInputRef = useRef(null);
  const aiLogRef = useRef(null);

  const files = userData.files;

  const getStatusColor = (status) => {
    switch (status) {
      case 'private': return 'text-red-600 bg-red-50';
      case 'shared': return 'text-green-600 bg-green-50';
      case 'earned': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'private': return 'Private';
      case 'shared': return 'Shared';
      case 'earned': return 'Earned';
      default: return 'Unknown';
    }
  };

  const handleFileAction = (file, action) => {
    setSelectedFile(file);
    if (action === 'share') {
      setShowShareModal(true);
    }
    if (action === 'view') {
      setShowDetail(true);
    }
  };

  const handleShareFile = () => {
    if (selectedFile) {
      const updatedFiles = userData.files.map(f => 
        f.id === selectedFile.id ? { ...f, status: 'shared', shareTarget } : f
      );
      onDataUpdate({ files: updatedFiles });
      
      // Add audit event
      onAddAuditEvent?.({
        actor: 'Patient',
        action: 'File Shared',
        scope: selectedFile.name,
        details: `Shared to ${shareTarget === 'community' ? 'Community' : 'Family'}`
      });
      
      setShowShareModal(false);
      setSelectedFile(null);
    }
  };

  const renderStatusChip = (status) => (
    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(status)}`}>{getStatusText(status)}</span>
  );

  const getAIReply = (q, file) => {
    const query = (q || '').toLowerCase();
    const total = files.length;
    const byType = files.reduce((acc, f) => { const t = f.type || 'Other'; acc[t] = (acc[t] || 0) + 1; return acc; }, {});
    const totalEarnings = files.reduce((sum, f) => sum + (Number(f.earnings) || 0), 0);

    if (file) {
      if (/size|big|large/.test(query)) return `${file.name} is ${file.size || 'unknown size'}.`;
      if (/status|share|private/.test(query)) return `${file.name} is currently ${getStatusText(file.status)}.`;
      if (/earn/.test(query)) return `${file.name} has earned $${(file.earnings || 0).toFixed(2)} so far.`;
      if (/what|about|summary|info/.test(query)) return `${file.name} • ${file.type} • ${file.size || '—'} • ${file.date || '—'} • ${getStatusText(file.status)}.`;
    }
    if (/(how many|count|total).*file/.test(query)) return `You have ${total} files.`;
    if (/type|category|breakdown/.test(query)) return `By type — ${Object.entries(byType).map(([t,c])=>`${t}: ${c}`).join(', ')}.`;
    if (/earn|payout|money|balance/.test(query)) return `Total earnings from files: $${totalEarnings.toFixed(2)}.`;
    return 'Try questions like: "What is the size?", "Is this private or shared?", "How much did this earn?", or "Type breakdown".';
  };

  const sendAI = () => {
    if (!aiInput.trim()) return;
    const userMsg = { id: Date.now(), role: 'user', text: aiInput.trim() };
    const botMsg = { id: Date.now()+1, role: 'assistant', text: getAIReply(aiInput, selectedFile) };
    setAiMessages(prev => [...prev, userMsg, botMsg]);
    setAiInput('');
  };

  // Accessibility: focus input when AI panel opens; keep log scrolled
  useEffect(() => {
    if (showAI && aiInputRef.current) {
      aiInputRef.current.focus();
    }
  }, [showAI]);

  useEffect(() => {
    if (aiLogRef.current) {
      aiLogRef.current.scrollTop = aiLogRef.current.scrollHeight;
    }
  }, [aiMessages]);

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="px-6 py-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Files</h1>
        <button
          onClick={() => setShowDetail(true) || setSelectedFile({ id: Date.now(), name: 'New File', type: 'Imaging', status: 'private', icon: '🖼️', size: '—', date: new Date().toISOString().slice(0,10), earnings: 0 })}
          className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm"
        >
          Add File
        </button>
      </div>

      {/* Files List */}
      <div className="px-6">
        <div className="space-y-2">
          {files.map((file) => (
            <button
              key={file.id}
              onClick={() => handleFileAction(file, 'view')}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{file.icon}</span>
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-600">{file.type} • {file.size || '—'} • {file.date || ''}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {renderStatusChip(file.status)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Share File</h3>
                <p className="text-gray-600 mb-3">Choose who to share <strong>{selectedFile.name}</strong> with.</p>

                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <button
                    onClick={()=>setShareTarget('community')}
                    className={`px-3 py-2 rounded-lg border ${shareTarget==='community'?'border-blue-500 bg-blue-50 text-blue-700':'border-gray-300 text-gray-700'}`}
                    aria-pressed={shareTarget==='community'}
                  >
                    Community
                  </button>
                  <button
                    onClick={()=>setShareTarget('family')}
                    className={`px-3 py-2 rounded-lg border ${shareTarget==='family'?'border-blue-500 bg-blue-50 text-blue-700':'border-gray-300 text-gray-700'}`}
                    aria-pressed={shareTarget==='family'}
                  >
                    Family
                  </button>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleShareFile}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-medium"
                  >
                    Share
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showDetail && selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetail(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="bg-white rounded-2xl p-4 max-w-sm w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{selectedFile.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight">{selectedFile.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{selectedFile.type} • {selectedFile.size || '—'} • {selectedFile.date || ''}</p>
                  </div>
                </div>
                {renderStatusChip(selectedFile.status)}
              </div>

              {/* Preview mock */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-3 text-center">
                <div className="h-28 flex items-center justify-center text-5xl select-none">
                  {selectedFile.icon}
                </div>
                <p className="text-xs text-gray-500 mt-2">Preview (mock)</p>
              </div>

              {/* Compact info row */}
              <div className="mb-3 text-sm text-gray-700 flex items-center justify-between">
                <span>Size: <strong>{selectedFile.size || '—'}</strong></span>
                <span>Earnings: <strong>${(selectedFile.earnings || 0).toFixed(2)}</strong></span>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 mb-3">
                {selectedFile.status === 'private' ? (
                  <button
                    onClick={() => { setShowDetail(false); setShowShareModal(true); }}
                    className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-medium"
                  >
                    Share
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const updatedFiles = userData.files.map(f => 
                        f.id === selectedFile.id ? { ...f, status: 'private' } : f
                      );
                      onDataUpdate({ files: updatedFiles });
                      onAddAuditEvent?.({ actor: 'Patient', action: 'Access Revoked', scope: selectedFile.name, details: 'File set to private' });
                      setShowDetail(false);
                    }}
                    className="flex-1 py-3 rounded-xl bg-gray-200 text-gray-800 font-medium"
                  >
                    Revoke
                  </button>
                )}
                <button
                  onClick={() => {
                    // Save (create or update) file
                    if (!selectedFile.id) return;
                    const exists = userData.files.some(f => f.id === selectedFile.id);
                    const updated = exists ? userData.files.map(f => f.id === selectedFile.id ? selectedFile : f) : [...userData.files, selectedFile];
                    onDataUpdate({ files: updated });
                    setShowDetail(false);
                  }}
                  className="flex-1 py-3 rounded-xl bg-green-600 text-white font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowDetail(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-800 font-medium"
                >
                  Close
                </button>
              </div>

              {/* AI toggle */}
              <button
                onClick={() => setShowAI(v => !v)}
                onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); setShowAI(v=>!v);} }}
                aria-expanded={showAI}
                aria-controls="file-ai-panel"
                className="w-full py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium mb-2"
              >
                {showAI ? 'Hide AI Insights' : 'Ask AI about this file'}
              </button>
              {showAI && (
                <div id="file-ai-panel" className="border border-gray-200 rounded-lg p-2" role="group" aria-label="AI insights about this file">
                  <div
                    ref={aiLogRef}
                    className="space-y-2 max-h-32 overflow-y-auto mb-2"
                    role="log"
                    aria-live="polite"
                    aria-relevant="additions text"
                  >
                    {aiMessages.map(m => (
                      <div key={m.id} className={`text-sm ${m.role==='user' ? 'text-gray-900' : 'text-gray-700'}`} aria-label={`${m.role==='user' ? 'You' : 'AI'} says ${m.text}`}>
                        <span className="font-medium mr-1">{m.role==='user' ? 'You:' : 'AI:'}</span>{m.text}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      value={aiInput}
                      onChange={(e)=>setAiInput(e.target.value)}
                      onKeyDown={(e)=>{ if(e.key==='Enter') { e.preventDefault(); sendAI(); } }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded"
                      placeholder="e.g., Is this shared?"
                      aria-label="Ask AI about this file"
                      ref={aiInputRef}
                    />
                    <button onClick={sendAI} className="px-3 py-2 rounded bg-blue-600 text-white" aria-label="Send question to AI">Ask</button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilesScreen;