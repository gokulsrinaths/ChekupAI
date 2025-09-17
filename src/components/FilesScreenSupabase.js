import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeWithLlama, getHealthInsights } from '../config/llama';
import { storage, database } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

const FilesScreenSupabase = () => {
  const { user, userProfile } = useAuth();
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTarget, setShareTarget] = useState('community');
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

  // Load files from Supabase
  useEffect(() => {
    if (user) {
      loadFiles();
    }
  }, [user]);

  const loadFiles = async () => {
    try {
      const { data, error } = await database.getUserFiles(user.id);
      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

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

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setUploading(true);
      
      try {
        for (const file of files) {
          // Upload file to Supabase storage
          const filePath = `${user.id}/${Date.now()}-${file.name}`;
          const { data: uploadData, error: uploadError } = await storage.uploadFile(file, user.id, filePath);
          
          if (uploadError) throw uploadError;

          // Read file content for AI analysis
          const content = await readFileContent(file);

          // Create file record in database
          const fileData = {
            user_id: user.id,
            name: file.name,
            type: getFileType(file.name),
            size: formatFileSize(file.size),
            file_path: filePath,
            status: 'private',
            icon: getFileIcon(file.name),
            earnings: 0,
            description: '',
            content: content // Store content for AI analysis
          };

          const { data: dbData, error: dbError } = await database.addFile(fileData);
          if (dbError) throw dbError;

          // Add audit log
          await database.addAuditLog({
            user_id: user.id,
            actor: 'Patient',
            action: 'File Uploaded',
            scope: fileData.type,
            details: `File: ${fileData.name}, Size: ${fileData.size}`
          });
        }

        // Reload files
        await loadFiles();
      } catch (error) {
        console.error('Error uploading files:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
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

  const handleShareFile = async () => {
    if (selectedFile) {
      try {
        const { error } = await database.updateFile(selectedFile.id, {
          status: 'shared',
          share_target: shareTarget
        });
        
        if (error) throw error;

        // Add audit log
        await database.addAuditLog({
          user_id: user.id,
          actor: 'Patient',
          action: 'File Shared',
          scope: selectedFile.type,
          details: `File: ${selectedFile.name}, Target: ${shareTarget}`
        });

        // Reload files
        await loadFiles();
        setShowShareModal(false);
      } catch (error) {
        console.error('Error sharing file:', error);
      }
    }
  };

  const sendAI = async () => {
    if (!aiInput.trim()) return;
    const userMsg = { id: Date.now(), role: 'user', text: aiInput.trim() };
    setAiMessages(prev => [...prev, userMsg]);
    
    try {
      const analysis = await analyzeFileWithLlamaAPI(selectedFile);
      const botMsg = { 
        id: Date.now()+1, 
        role: 'assistant', 
        text: analysis
      };
      setAiMessages(prev => [...prev, botMsg]);

      // Save AI chat to database
      await database.addAIChat({
        user_id: user.id,
        file_id: selectedFile.id,
        message: aiInput.trim(),
        role: 'user'
      });

      await database.addAIChat({
        user_id: user.id,
        file_id: selectedFile.id,
        message: analysis,
        role: 'assistant'
      });
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

  const renderStatusChip = (status) => (
    <span className={`text-[10px] px-2 py-1 rounded ${getStatusColor(status)}`}>
      {getStatusText(status)}
    </span>
  );

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

  if (!user) {
    return (
      <div className="min-h-screen bg-white pb-24 max-w-mobile mx-auto flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Please sign in</h2>
          <p className="text-sm text-gray-600">You need to be signed in to view your files.</p>
        </div>
      </div>
    );
  }

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
                  <p className="text-xs text-gray-600 truncate">{file.type} • {file.size || '—'} • {file.created_at?.slice(0, 10) || ''}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                {renderStatusChip(file.status)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* File Detail Modal */}
      <AnimatePresence>
        {showDetail && selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowDetail(false);
              setShowAI(false);
              setAiMessages([]);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">File Details</h3>
                <button
                  onClick={() => {
                    setShowDetail(false);
                    setShowAI(false);
                    setAiMessages([]);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {/* File Icon */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">{selectedFile.icon}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">{selectedFile.name}</h4>
                </div>

                {/* File Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{selectedFile.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{selectedFile.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium">{getStatusText(selectedFile.status)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{selectedFile.created_at?.slice(0, 10) || 'Unknown'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t space-y-2">
                  <button
                    onClick={() => setShowAI(!showAI)}
                    className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
                  >
                    {showAI ? 'Hide' : 'Ask AI about this file'}
                  </button>
                  
                  {selectedFile.status === 'private' && (
                    <button
                      onClick={() => {
                        setShowDetail(false);
                        handleFileAction(selectedFile, 'share');
                      }}
                      className="w-full py-2 px-4 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                    >
                      Share File
                    </button>
                  )}
                </div>

                {/* AI Chat */}
                {showAI && (
                  <div className="mt-4 space-y-3">
                    <div className="text-sm font-medium text-gray-700">AI Assistant</div>
                    <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto" ref={aiLogRef}>
                      {aiMessages.length === 0 ? (
                        <p className="text-sm text-gray-500">Ask me anything about this file...</p>
                      ) : (
                        aiMessages.map((msg) => (
                          <div key={msg.id} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block p-2 rounded text-xs ${
                              msg.role === 'user' 
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
                        ref={aiInputRef}
                        type="text"
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        placeholder="Ask about this file..."
                        className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && sendAI()}
                      />
                      <button
                        onClick={sendAI}
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
                  >
                    Community
                  </button>
                  <button
                    onClick={()=>setShareTarget('family')}
                    className={`px-3 py-2 rounded-lg border ${shareTarget==='family'?'border-blue-500 bg-blue-50 text-blue-700':'border-gray-300 text-gray-700'}`}
                  >
                    Family
                  </button>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleShareFile}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    Share
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilesScreenSupabase;
