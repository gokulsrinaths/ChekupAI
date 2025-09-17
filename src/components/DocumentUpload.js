import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DocumentUpload = ({ onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    setUploading(true);
    
    // Simulate file processing
    setTimeout(() => {
      const newFiles = Array.from(files).map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        type: getFileType(file.name),
        size: formatFileSize(file.size),
        date: new Date().toISOString().slice(0, 10),
        status: 'uploaded',
        icon: getFileIcon(file.name)
      }));
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setUploading(false);
      
      // Notify parent component
      if (onUpload) {
        onUpload(newFiles);
      }
    }, 1500);
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

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <div className="min-h-screen bg-white pb-24 max-w-mobile mx-auto">
      {/* Header */}
      <div className="px-4 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Upload Documents</h1>
        <p className="text-xs text-gray-500 mt-1">Upload your health records and medical documents</p>
      </div>

      {/* Upload Area */}
      <div className="px-4 mb-4">
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-3">
            <div className="text-4xl">📁</div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm">Drop files here</h3>
              <p className="text-xs text-gray-600">or click to browse</p>
            </div>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.dcm,.txt,.xlsx,.csv"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Choose Files
            </label>
          </div>
        </div>
      </div>

      {/* Supported Formats */}
      <div className="px-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="font-medium text-gray-900 text-sm mb-2">Supported Formats</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>📄 PDF Documents</div>
            <div>🖼️ Images (JPG, PNG)</div>
            <div>📝 Word Documents</div>
            <div>🏥 DICOM Files</div>
            <div>📊 Excel Files</div>
            <div>📋 Text Files</div>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="px-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-700">Processing files...</span>
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="px-4">
          <h2 className="text-base font-medium text-gray-900 mb-3">Uploaded Files</h2>
          <div className="space-y-2">
            <AnimatePresence>
              {uploadedFiles.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{file.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                      <p className="text-xs text-gray-600">{file.type} • {file.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] px-2 py-1 rounded bg-green-100 text-green-600">
                      {file.status}
                    </span>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Healthcare Provider Integration */}
      <div className="px-4 mt-6">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 text-sm mb-2">Connect Healthcare Provider</h3>
          <p className="text-xs text-gray-600 mb-3">
            Automatically retrieve your medical records from your healthcare providers
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-green-600 text-white py-2 px-3 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors">
              🏥 Connect Provider
            </button>
            <button className="bg-blue-600 text-white py-2 px-3 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
              📱 Sync Mobile App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
