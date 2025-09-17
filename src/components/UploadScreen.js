import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Sparkles, MessageCircle, FileText, Trash2 } from 'lucide-react';
import { AIService } from '../services/aiService';
import { storage, database } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

const UploadScreen = () => {
  const { user } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const aiInputRef = useRef(null);
  const aiLogRef = useRef(null);

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

  const handleFileUpload = async (files) => {
    const uploadedFiles = Array.from(files);
    if (uploadedFiles.length === 0) return;

    setUploading(true);
    try {
      for (const file of uploadedFiles) {
        const content = await readFileContent(file);
        
        // Get AI-suggested filename
        const suggestedName = await AIService.suggestFileName(content, file.name, getFileType(file.name));
        
        // Create file record for demo (without Supabase)
        const fileData = {
          id: `uploaded-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          user_id: user?.id || 'demo-user',
          file_path: `demo/${suggestedName}`,
          file_name: suggestedName,
          file_type: getFileType(file.name),
          file_size: formatFileSize(file.size),
          status: 'private',
          icon: getFileIcon(file.name),
          earnings: 0,
          description: '',
          content: content,
          ai_analyzed: true,
          uploaded_at: new Date().toISOString()
        };

        // Add to local state immediately
        setUploadedFiles(prev => [fileData, ...prev]);

        // Try to save to Supabase if user is logged in
        if (user) {
          try {
            const filePath = `${user.id}/${Date.now()}-${suggestedName}`;
            const { error: uploadError } = await storage.uploadFile(file, user.id, filePath);
            if (!uploadError) {
              fileData.file_path = filePath;
            }
          } catch (error) {
            console.log('Supabase upload failed, using local storage:', error);
          }

          try {
            await database.addFile(fileData);
          } catch (error) {
            console.log('Database save failed, using local storage:', error);
          }

          try {
            await database.addAuditLog({
              user_id: user.id,
              actor: 'Patient',
              action: 'File Uploaded',
              scope: fileData.file_type,
              details: `File: ${fileData.file_name}, Size: ${fileData.file_size}`
            });
          } catch (error) {
            console.log('Audit log failed:', error);
          }
        }
      }
    } catch (error) {
      console.error('File upload process error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInputChange = (e) => {
    handleFileUpload(e.target.files);
  };

  const handleFileClick = (file) => {
    setSelectedFile(file);
    setShowAI(true);
    setAiMessages([]);
  };

  const handleAIChatSend = async () => {
    if (!aiInput.trim() || !selectedFile) return;

    console.log('Upload AI Chat: Sending message:', aiInput.trim());
    console.log('Upload AI Chat: Selected file:', selectedFile);

    const userMessage = { sender: 'user', text: aiInput.trim(), timestamp: new Date() };
    setAiMessages(prev => [...prev, userMessage]);

    // Only save to database if it's a real uploaded file and user is logged in
    if (user && !selectedFile.id.startsWith('mock-')) {
      try {
        await database.addAIChat({
          user_id: user.id,
          file_id: selectedFile.id,
          message: aiInput.trim(),
          sender: 'user'
        });
      } catch (error) {
        console.log('Database save failed:', error);
      }
    }

    const currentInput = aiInput.trim();
    setAiInput('');

    try {
      console.log('Upload AI Chat: Calling AIService.answerHealthQuestion');
      const aiResponseText = await AIService.answerHealthQuestion(currentInput, selectedFile.content);
      console.log('Upload AI Chat: Received response:', aiResponseText);
      
      const aiMessage = { sender: 'ai', text: aiResponseText, timestamp: new Date() };
      setAiMessages(prev => [...prev, aiMessage]);
      
      // Only save to database if it's a real uploaded file and user is logged in
      if (user && !selectedFile.id.startsWith('mock-')) {
        try {
          await database.addAIChat({
            user_id: user.id,
            file_id: selectedFile.id,
            message: aiResponseText,
            sender: 'ai'
          });
        } catch (error) {
          console.log('Database save failed:', error);
        }
      }
    } catch (error) {
      console.error('Error getting AI chat response:', error);
      const errorMessage = { sender: 'ai', text: 'Sorry, I could not process your request at this time.', timestamp: new Date() };
      setAiMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleRemoveFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    if (selectedFile && selectedFile.id === fileId) {
      setSelectedFile(null);
      setShowAI(false);
      setAiMessages([]);
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
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Upload Documents</h1>
          <p className="text-sm text-gray-600">Upload your medical files and ask AI questions</p>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.dcm,.txt,.xlsx,.csv"
            onChange={handleFileInputChange}
            className="hidden"
            id="file-upload"
          />
          
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
              </h3>
              <p className="text-sm text-gray-600">
                Support for PDF, DOC, images, and more
              </p>
            </div>
            
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </label>
          </div>
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Files</h3>
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">{file.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm truncate">{file.file_name}</h4>
                      <p className="text-xs text-gray-600">{file.file_type} • {file.file_size}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleFileClick(file)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Ask AI about this file"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveFile(file.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Chat Modal */}
      <AnimatePresence>
        {showAI && selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => { setShowAI(false); setAiMessages([]); }}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => { setShowAI(false); setAiMessages([]); }}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-4">
                <span className="text-4xl block mb-2">{selectedFile.icon}</span>
                <h3 className="text-lg font-bold text-gray-900">{selectedFile.file_name}</h3>
                <p className="text-sm text-gray-600">Ask AI about this document</p>
              </div>

              {/* AI Chat */}
              <div className="space-y-4">
                <div ref={aiLogRef} className="h-48 overflow-y-auto bg-gray-50 p-4 rounded-lg text-sm space-y-3">
                  {aiMessages.length === 0 ? (
                    <div className="text-center text-gray-500">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                      <p className="italic">Ask me anything about this file!</p>
                    </div>
                  ) : (
                    aiMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${
                          msg.sender === 'user' 
                            ? 'bg-blue-100 text-blue-800' 
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
                    onKeyPress={(e) => e.key === 'Enter' && handleAIChatSend()}
                    placeholder="Ask about this document..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAIChatSend}
                    className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
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

export default UploadScreen;
