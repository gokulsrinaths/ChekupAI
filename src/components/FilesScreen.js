import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeWithLlama, getHealthInsights } from '../config/llama';

const FilesScreen = ({ userData, onDataUpdate, onAddAuditEvent }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTarget, setShareTarget] = useState('community'); // 'community' | 'family'
  const [showDetail, setShowDetail] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [showAddFile, setShowAddFile] = useState(false);
  const [newFile, setNewFile] = useState({
    name: '',
    type: 'Imaging',
    size: '',
    description: ''
  });
  const [uploading, setUploading] = useState(false);
  const aiInputRef = useRef(null);
  const aiLogRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const handleFileUpload = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setUploading(true);
      
      // Process each file
      Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const fileData = {
            id: Date.now() + index,
            name: file.name,
            type: getFileType(file.name),
            size: formatFileSize(file.size),
            date: new Date().toISOString().slice(0, 10),
            status: 'private',
            icon: getFileIcon(file.name),
            earnings: 0,
            content: e.target.result, // Store file content for AI analysis
            file: file // Store original file object
          };
          
          // Add to user data
          const updatedFiles = [...userData.files, fileData];
          onDataUpdate({ files: updatedFiles });
          
          // Log audit event
          onAddAuditEvent({
            actor: 'Patient',
            action: 'File Uploaded',
            scope: fileData.type,
            details: `File: ${fileData.name}, Size: ${fileData.size}`
          });
        };
        reader.readAsText(file);
      });
      
      setTimeout(() => setUploading(false), 2000);
    }
  };

  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const types = {
      'pdf': 'Document',
      'doc': 'Document',
      'docx': 'Document',
      'jpg': 'Imaging',
      'jpeg': 'Imaging',
      'png': 'Imaging',
      'dcm': 'DICOM',
      'txt': 'Notes',
      'xlsx': 'Spreadsheet',
      'csv': 'Data'
    };
    return types[ext] || 'Other';
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
      'pdf': '📄',
      'doc': '📝',
      'docx': '📝',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'png': '🖼️',
      'dcm': '🏥',
      'txt': '📋',
      'xlsx': '📊',
      'csv': '📈'
    };
    return icons[ext] || '📁';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const analyzeFileWithLlamaAPI = async (file) => {
    if (!file.content) return 'No file content available for analysis.';
    
    try {
      const analysis = await analyzeWithLlama(file.content, file.type);
      return analysis;
    } catch (error) {
      console.error('Llama API error:', error);
      return 'Unable to analyze file at this time. Please try again later.';
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

  const sendAI = async () => {
    if (!aiInput.trim()) return;
    const userMsg = { id: Date.now(), role: 'user', text: aiInput.trim() };
    setAiMessages(prev => [...prev, userMsg]);
    
    // Use Llama API for medical file analysis
    try {
      const analysis = await analyzeFileWithLlamaAPI(selectedFile);
      const botMsg = { 
        id: Date.now()+1, 
        role: 'assistant', 
        text: analysis
      };
      setAiMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const botMsg = { 
        id: Date.now()+1, 
        role: 'assistant', 
        text: `I can help you understand this ${selectedFile?.type} file. The document contains medical information that I can help interpret. What would you like to know about it?`
      };
      setAiMessages(prev => [...prev, botMsg]);
    }
    
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
    <div className="min-h-screen bg-white pb-24 max-w-mobile mx-auto">
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Files</h1>
        <div className="flex space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.dcm,.txt,.xlsx,.csv"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs cursor-pointer hover:bg-blue-700 transition-colors"
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </label>
          <button
            onClick={() => setShowAddFile(true)}
            className="px-3 py-2 rounded-lg bg-green-600 text-white text-xs hover:bg-green-700 transition-colors"
          >
            Add Manually
          </button>
        </div>
      </div>

      {/* Files List */}
      <div className="px-4">
        <div className="space-y-2">
          {files.map((file) => (
            <button
              key={file.id}
              onClick={() => handleFileAction(file, 'view')}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <span className="text-lg flex-shrink-0">{file.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{file.name}</p>
                  <p className="text-xs text-gray-600 truncate">{file.type} • {file.size || '—'} • {file.date || ''}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                {renderStatusChip(file.status)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Add File Modal */}
      <AnimatePresence>
        {showAddFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddFile(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add File Manually</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File Name</label>
                  <input
                    type="text"
                    value={newFile.name}
                    onChange={(e) => setNewFile(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter file name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
                  <select
                    value={newFile.type}
                    onChange={(e) => setNewFile(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Imaging">Imaging</option>
                    <option value="Lab">Lab Results</option>
                    <option value="Notes">Notes</option>
                    <option value="Document">Document</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File Size</label>
                  <input
                    type="text"
                    value={newFile.size}
                    onChange={(e) => setNewFile(prev => ({ ...prev, size: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 2.5 MB"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newFile.description}
                    onChange={(e) => setNewFile(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of the file"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddFile(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (newFile.name) {
                      const fileData = {
                        id: Date.now(),
                        name: newFile.name,
                        type: newFile.type,
                        size: newFile.size || 'Unknown',
                        date: new Date().toISOString().slice(0, 10),
                        status: 'private',
                        icon: getFileIcon(newFile.name),
                        earnings: 0,
                        description: newFile.description
                      };
                      
                      const updatedFiles = [...userData.files, fileData];
                      onDataUpdate({ files: updatedFiles });
                      
                      onAddAuditEvent({
                        actor: 'Patient',
                        action: 'File Added Manually',
                        scope: fileData.type,
                        details: `File: ${fileData.name}`
                      });
                      
                      setNewFile({ name: '', type: 'Imaging', size: '', description: '' });
                      setShowAddFile(false);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Add File
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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