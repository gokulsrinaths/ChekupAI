import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, Sparkles, MessageCircle, Eye, Download, Trash2 } from 'lucide-react';
import { AIService } from '../services/aiService';
import { storage, database } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

const FilesScreen = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const aiInputRef = useRef(null);
  const aiLogRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load files from Supabase
  const loadFiles = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await database.getUserFiles(user.id);
      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      loadFiles();
    }
  }, [user, loadFiles]);

  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const types = {
      'pdf': 'Document', 'doc': 'Document', 'docx': 'Document',
      'jpg': 'Imaging', 'jpeg': 'Imaging', 'png': 'Imaging',
      'dcm': 'DICOM', 'txt': 'Notes', 'xlsx': 'Spreadsheet', 'csv': 'Data'
    };
    return types[ext] || 'Other';
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
      'pdf': '📄', 'doc': '📝', 'docx': '📝',
      'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️',
      'dcm': '🏥', 'txt': '📋', 'xlsx': '📊', 'csv': '📈'
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

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const handleFileUpload = async (event) => {
    const uploadedFiles = Array.from(event.target.files);
    if (uploadedFiles.length === 0) return;

    setUploading(true);
    try {
      for (const file of uploadedFiles) {
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
          file_path: filePath,
          file_name: suggestedName,
          file_type: getFileType(file.name),
          file_size: formatFileSize(file.size),
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
          action: 'File Uploaded',
          scope: fileData.file_type,
          details: `File: ${fileData.file_name}, Size: ${fileData.file_size}`
        });
      }
      loadFiles(); // Reload files after successful upload
    } catch (error) {
      console.error('File upload process error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileClick = (file) => {
    setSelectedFile(file);
    setShowDetail(true);
    setShowAI(false);
    setAiMessages([]);
  };

  const handleAIChatSend = async () => {
    if (!aiInput.trim() || !selectedFile || !user) return;

    const userMessage = { sender: 'user', text: aiInput.trim(), timestamp: new Date() };
    setAiMessages(prev => [...prev, userMessage]);
    await database.addAIChat({
      user_id: user.id,
      file_id: selectedFile.id,
      message: aiInput.trim(),
      sender: 'user'
    });

    setAiInput('');

    try {
      const aiResponseText = await AIService.answerHealthQuestion(aiInput.trim(), selectedFile.content);
      const aiMessage = { sender: 'ai', text: aiResponseText, timestamp: new Date() };
      setAiMessages(prev => [...prev, aiMessage]);
      await database.addAIChat({
        user_id: user.id,
        file_id: selectedFile.id,
        message: aiResponseText,
        sender: 'ai'
      });
    } catch (error) {
      console.error('Error getting AI chat response:', error);
      const errorMessage = { sender: 'ai', text: 'Sorry, I could not process your request at this time.', timestamp: new Date() };
      setAiMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    
    try {
      await database.deleteFile(fileId);
      await database.addAuditLog({
        user_id: user.id,
        actor: 'Patient',
        action: 'File Deleted',
        scope: 'File Management',
        details: `File ID: ${fileId} deleted`
      });
      loadFiles();
      setShowDetail(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-24 max-w-mobile mx-auto">
      {/* Header */}
      <div className="px-4 py-6 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Files</h1>
            <p className="text-sm text-gray-600">Upload and manage your medical documents</p>
          </div>
          <div className="flex items-center space-x-2">
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
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm cursor-pointer hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Uploading...' : 'Upload'}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Files List */}
      <div className="px-4 py-4">
        {files.length === 0 ? (
          <div className="text-center py-12">
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No files yet</h3>
            <p className="text-gray-600 mb-4">Upload your first medical document to get started</p>
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleFileClick(file)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">{file.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{file.file_name}</h3>
                    <p className="text-xs text-gray-600">{file.file_type} • {file.file_size || '—'}</p>
                    <p className="text-xs text-gray-500">{new Date(file.uploaded_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(file);
                        setShowDetail(true);
                        setShowAI(true);
                        setAiMessages([]);
                      }}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Ask AI about this file"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(file);
                        setShowDetail(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* File Detail Modal with AI Chat */}
      <AnimatePresence>
        {showDetail && selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => { setShowDetail(false); setShowAI(false); setAiMessages([]); }}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => { setShowDetail(false); setShowAI(false); setAiMessages([]); }}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-4">
                <span className="text-5xl block mb-2">{selectedFile.icon}</span>
                <h3 className="text-xl font-bold text-gray-900">{selectedFile.file_name}</h3>
                <p className="text-sm text-gray-600">{selectedFile.file_type} • {selectedFile.file_size} • {new Date(selectedFile.uploaded_at).toLocaleDateString()}</p>
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <p><strong>Status:</strong> <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">Private</span></p>
                {selectedFile.description && <p><strong>Description:</strong> {selectedFile.description}</p>}
              </div>

              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setShowAI(!showAI)}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{showAI ? 'Hide AI Chat' : 'Ask AI about this file'}</span>
                </button>
                <button
                  onClick={() => handleDeleteFile(selectedFile.id)}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* AI Chat */}
              <AnimatePresence>
                {showAI && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200 pt-4"
                  >
                    <div ref={aiLogRef} className="h-40 overflow-y-auto bg-gray-50 p-3 rounded-lg text-sm space-y-2 mb-3">
                      {aiMessages.length === 0 ? (
                        <p className="text-gray-500 italic">Ask me anything about this file!</p>
                      ) : (
                        aiMessages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-800 border border-gray-200'}`}>
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
                        onKeyPress={(e) => e.key === 'Enter' && handleAIChatSend()}
                        placeholder="Type your question..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={handleAIChatSend}
                        className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilesScreen;