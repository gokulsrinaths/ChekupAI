import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, Sparkles, MessageCircle, Share2, Eye, Edit3 } from 'lucide-react';
import { AIService } from '../services/aiService';
import { storage, database } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

const EnhancedFilesScreen = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTarget, setShareTarget] = useState('community');
  const [showDetail, setShowDetail] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  // Removed unused state variables
  const [uploading, setUploading] = useState(false);
  const [renamingFile, setRenamingFile] = useState(null);
  const [suggestedName, setSuggestedName] = useState('');
  const aiInputRef = useRef(null);
  const aiLogRef = useRef(null);
  const fileInputRef = useRef(null);

  const loadFiles = useCallback(async () => {
    try {
      const { data, error } = await database.getUserFiles(user.id);
      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  }, [user?.id]);

  // Load files from Supabase
  useEffect(() => {
    if (user) {
      loadFiles();
    }
  }, [user, loadFiles]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'private': return 'text-red-600 bg-red-50 border-red-200';
      case 'shared': return 'text-green-600 bg-green-50 border-green-200';
      case 'earned': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
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

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setUploading(true);
      
      try {
        for (const file of files) {
          // Read file content for AI analysis
          const content = await readFileContent(file);
          
          // Get AI-suggested filename
          const suggestedName = await AIService.suggestFileName(content, file.name, getFileType(file.name));
          
          // Upload file to Supabase storage
          const filePath = `${user.id}/${Date.now()}-${suggestedName}`;
          const { error: uploadError } = await storage.uploadFile(file, user.id, filePath);
          
          if (uploadError) throw uploadError;

          // Create file record in database
          const fileData = {
            user_id: user.id,
            name: suggestedName,
            original_name: file.name,
            type: getFileType(file.name),
            size: formatFileSize(file.size),
            file_path: filePath,
            status: 'private',
            icon: getFileIcon(file.name),
            earnings: 0,
            description: '',
            content: content,
            ai_analyzed: true
          };

          const { error: dbError } = await database.addFile(fileData);
          if (dbError) throw dbError;

          // Add audit log
          await database.addAuditLog({
            user_id: user.id,
            actor: 'Patient',
            action: 'File Uploaded with AI Rename',
            scope: fileData.type,
            details: `Original: ${file.name} → AI Renamed: ${suggestedName}`
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

  const handleFileAction = (file, action) => {
    setSelectedFile(file);
    if (action === 'share') {
      setShowShareModal(true);
    }
    if (action === 'view') {
      setShowDetail(true);
    }
    if (action === 'rename') {
      setRenamingFile(file);
      setSuggestedName(file.name);
    }
  };

  const handleRenameFile = async () => {
    if (!renamingFile || !suggestedName.trim()) return;
    
    try {
      const { error } = await database.updateFile(renamingFile.id, {
        name: suggestedName.trim()
      });
      
      if (error) throw error;

      // Add audit log
      await database.addAuditLog({
        user_id: user.id,
        actor: 'Patient',
        action: 'File Renamed',
        scope: renamingFile.type,
        details: `Renamed to: ${suggestedName.trim()}`
      });

      // Reload files
      await loadFiles();
      setRenamingFile(null);
      setSuggestedName('');
    } catch (error) {
      console.error('Error renaming file:', error);
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
      const analysis = await AIService.answerHealthQuestion(aiInput.trim(), selectedFile?.content);
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
    <span className={`text-[10px] px-2 py-1 rounded-full border ${getStatusColor(status)}`}>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-24 max-w-mobile mx-auto flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Please sign in</h2>
          <p className="text-sm text-gray-600">You need to be signed in to view your medical files.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-24 max-w-mobile mx-auto">
      {/* Header */}
      <div className="px-4 py-6 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Medical Files</h1>
            <p className="text-sm text-gray-600 mt-1">AI-powered health document management</p>
          </div>
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
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Uploading...' : 'Upload Files'}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Files List */}
      <div className="px-4 py-4">
        {files.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No files yet</h3>
            <p className="text-sm text-gray-600 mb-4">Upload your medical documents to get started</p>
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Your First File
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">{file.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{file.name}</h3>
                        {file.ai_analyzed && (
                          <Sparkles className="w-3 h-3 text-purple-500" title="AI Analyzed" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate">{file.type} • {file.size} • {file.created_at?.slice(0, 10) || ''}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        {renderStatusChip(file.status)}
                        {file.original_name && file.original_name !== file.name && (
                          <span className="text-xs text-gray-500">AI Renamed</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleFileAction(file, 'view')}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFileAction(file, 'rename')}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Rename file"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {file.status === 'private' && (
                      <button
                        onClick={() => handleFileAction(file, 'share')}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Share file"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
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
              className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">{selectedFile.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedFile.name}</h3>
                    <p className="text-sm text-gray-600">{selectedFile.type}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetail(false);
                    setShowAI(false);
                    setAiMessages([]);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {/* File Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Size:</span>
                    <p className="font-medium">{selectedFile.size}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <p className="font-medium">{getStatusText(selectedFile.status)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Uploaded:</span>
                    <p className="font-medium">{selectedFile.created_at?.slice(0, 10) || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">AI Analyzed:</span>
                    <p className="font-medium">{selectedFile.ai_analyzed ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t space-y-3">
                  <button
                    onClick={() => setShowAI(!showAI)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{showAI ? 'Hide AI Chat' : 'Ask AI about this file'}</span>
                  </button>
                  
                  {selectedFile.status === 'private' && (
                    <button
                      onClick={() => {
                        setShowDetail(false);
                        handleFileAction(selectedFile, 'share');
                      }}
                      className="w-full py-3 px-4 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share File</span>
                    </button>
                  )}
                </div>

                {/* AI Chat */}
                {showAI && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      <span className="text-sm font-medium text-gray-700">AI Health Assistant</span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 max-h-40 overflow-y-auto" ref={aiLogRef}>
                      {aiMessages.length === 0 ? (
                        <p className="text-sm text-gray-500">Ask me anything about this medical file...</p>
                      ) : (
                        aiMessages.map((msg) => (
                          <div key={msg.id} className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block p-3 rounded-lg text-sm max-w-[80%] ${
                              msg.role === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-white text-gray-800 border border-gray-200'
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
                        className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && sendAI()}
                      />
                      <button
                        onClick={sendAI}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
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

      {/* Rename Modal */}
      <AnimatePresence>
        {renamingFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setRenamingFile(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rename File</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New filename</label>
                  <input
                    type="text"
                    value={suggestedName}
                    onChange={(e) => setSuggestedName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new filename"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setRenamingFile(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRenameFile}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    Rename
                  </button>
                </div>
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
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Share File</h3>
                <p className="text-gray-600 mb-4">Choose who to share <strong>{selectedFile.name}</strong> with.</p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={()=>setShareTarget('community')}
                    className={`px-4 py-3 rounded-xl border-2 transition-all ${
                      shareTarget==='community'
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-1">🌍</div>
                    <div className="text-sm font-medium">Community</div>
                  </button>
                  <button
                    onClick={()=>setShareTarget('family')}
                    className={`px-4 py-3 rounded-xl border-2 transition-all ${
                      shareTarget==='family'
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-1">👨‍👩‍👧‍👦</div>
                    <div className="text-sm font-medium">Family</div>
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

export default EnhancedFilesScreen;
