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

    // Sample mock files for demo purposes
    const sampleFiles = [
      {
        id: 'sample-1',
        user_id: 'demo-user',
        file_path: 'sample/blood_test_2024.pdf',
        file_name: 'Blood_Test_Results_2024-01-15.pdf',
        file_type: 'Document',
        file_size: '2.3 MB',
        status: 'private',
        icon: '🩸',
        earnings: 0,
        description: 'Complete blood count and metabolic panel',
        content: 'Complete Blood Count Results:\n\nWhite Blood Cells: 7.2 K/μL (Normal: 4.5-11.0)\nRed Blood Cells: 4.8 M/μL (Normal: 4.0-5.2)\nHemoglobin: 14.2 g/dL (Normal: 12.0-15.5)\nHematocrit: 42.1% (Normal: 36-46)\nPlatelets: 285 K/μL (Normal: 150-450)\n\nMetabolic Panel:\nGlucose: 95 mg/dL (Normal: 70-100)\nCholesterol: 180 mg/dL (Normal: <200)\nHDL: 45 mg/dL (Normal: >40)\nLDL: 120 mg/dL (Normal: <100)\nTriglycerides: 150 mg/dL (Normal: <150)',
        ai_analyzed: true,
        uploaded_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 'sample-2',
        user_id: 'demo-user',
        file_path: 'sample/chest_xray_2024.pdf',
        file_name: 'Chest_XRay_2024-01-10.pdf',
        file_type: 'Imaging',
        file_size: '1.8 MB',
        status: 'private',
        icon: '🖼️',
        earnings: 0,
        description: 'Chest X-ray examination',
        content: 'Chest X-Ray Report:\n\nClinical History: Routine screening\n\nFindings:\n- Heart size and contour are normal\n- Lungs are clear bilaterally\n- No acute pulmonary abnormalities\n- Bony structures appear intact\n- No pleural effusion\n\nImpression:\n- Normal chest X-ray\n- No acute findings\n\nRecommendations:\n- Continue routine follow-up as clinically indicated',
        ai_analyzed: true,
        uploaded_at: '2024-01-10T14:20:00Z'
      },
      {
        id: 'sample-3',
        user_id: 'demo-user',
        file_path: 'sample/ecg_report_2024.pdf',
        file_name: 'ECG_Report_2024-01-08.pdf',
        file_type: 'Cardiac',
        file_size: '1.2 MB',
        status: 'private',
        icon: '❤️',
        earnings: 0,
        description: 'Electrocardiogram results',
        content: 'Electrocardiogram Report:\n\nPatient: Demo User\nDate: January 8, 2024\n\nHeart Rate: 72 BPM (Normal: 60-100)\nRhythm: Normal sinus rhythm\nPR Interval: 0.16 seconds (Normal: 0.12-0.20)\nQRS Duration: 0.08 seconds (Normal: 0.06-0.10)\nQT Interval: 0.40 seconds (Normal: 0.36-0.44)\n\nInterpretation:\n- Normal sinus rhythm\n- No acute ST-T wave changes\n- No evidence of arrhythmia\n- Normal intervals and morphology\n\nClinical Correlation:\n- ECG appears normal\n- No immediate cardiac concerns\n- Follow-up as clinically indicated',
        ai_analyzed: true,
        uploaded_at: '2024-01-08T09:15:00Z'
      }
    ];

    // Load files from Supabase and combine with sample files
  const loadFiles = useCallback(async () => {
    try {
      let uploadedFiles = [];
      if (user) {
        const { data, error } = await database.getUserFiles(user.id);
        if (error) throw error;
        uploadedFiles = data || [];
      }
      
      // Combine sample files with uploaded files
      setFiles([...sampleFiles, ...uploadedFiles]);
    } catch (error) {
      console.error('Error loading files:', error);
      // Still show sample files even if database fails
      setFiles(sampleFiles);
    }
  }, [user?.id]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

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
      reader.onload = (e) => {
        const result = e.target.result;
        // Use actual file content for AI analysis
        resolve(result);
      };
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  // Mock content generation removed - using real file content only

  const handleFileUpload = async (event) => {
    const uploadedFiles = Array.from(event.target.files);
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
        setFiles(prev => [fileData, ...prev]);

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

  const handleFileClick = (file) => {
    setSelectedFile(file);
    setShowDetail(true);
    setShowAI(false);
    setAiMessages([]);
  };

  const handleAIChatSend = async () => {
    if (!aiInput.trim() || !selectedFile) return;

    console.log('AI Chat: Sending message:', aiInput.trim());
    console.log('AI Chat: Selected file:', selectedFile);

    const userMessage = { sender: 'user', text: aiInput.trim(), timestamp: new Date() };
    setAiMessages(prev => [...prev, userMessage]);

    // Save to database if user is logged in
    if (user) {
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
      console.log('AI Chat: Calling AIService.answerHealthQuestion');
      const aiResponseText = await AIService.answerHealthQuestion(currentInput, selectedFile.content);
      console.log('AI Chat: Received response:', aiResponseText);
      
      const aiMessage = { sender: 'ai', text: aiResponseText, timestamp: new Date() };
      setAiMessages(prev => [...prev, aiMessage]);
      
        // Save to database if user is logged in
        if (user) {
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

    const handleDeleteFile = async (fileId) => {
      // Prevent deletion of sample files
      if (fileId.startsWith('sample-')) {
        alert('Sample files cannot be deleted');
        return;
      }
      
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
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{file.file_name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        file.id.startsWith('sample-') 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {file.id.startsWith('sample-') ? 'Sample' : 'Uploaded'}
                      </span>
                    </div>
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
                {!selectedFile.id.startsWith('sample-') && (
                  <button
                    onClick={() => handleDeleteFile(selectedFile.id)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
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