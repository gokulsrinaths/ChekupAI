import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Calendar, Bell, Camera } from 'lucide-react';

const PatientDashboard = ({ user, onNavigate }) => {
  const [chatInput, setChatInput] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentProfile, setCurrentProfile] = useState('jane');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'ai', message: `Hi ${user?.user_metadata?.full_name || 'Jane'}, how are you feeling today?`, timestamp: new Date() }
  ]);

  const profiles = [
    { id: 'jane', name: 'Jane Doe', role: 'You', avatar: '👩', healthScore: 85, lastCheckup: '2024-01-15' },
    { id: 'john', name: 'John Doe', role: 'Husband', avatar: '👨', healthScore: 92, lastCheckup: '2024-01-10' },
    { id: 'emma', name: 'Emma Doe', role: 'Daughter', avatar: '👶', healthScore: 78, lastCheckup: '2024-01-20' }
  ];

  const currentProfileData = profiles.find(p => p.id === currentProfile) || profiles[0];

  // Removed family members - focusing on individual user experience

  const quickActions = [
    { id: 'appointment', title: 'Book Appointment', icon: Calendar, color: 'blue', action: () => onNavigate('appointments') },
    { id: 'reminders', title: 'Set Reminders', icon: Bell, color: 'green', action: () => onNavigate('reminders') },
    { id: 'calendar', title: 'Health Calendar', icon: Calendar, color: 'purple', action: () => onNavigate('calendar') },
    { id: 'scan', title: 'Scan Document', icon: Camera, color: 'orange', action: () => onNavigate('scan') }
  ];

  // Removed recent activities for cleaner design

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      message: chatInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        sender: 'ai',
        message: "I understand. Let me help you with that. Would you like me to schedule an appointment or set a reminder?",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  // Removed family member logic - focusing on individual user

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-24 max-w-mobile mx-auto">
      {/* Header */}
      <div className="px-4 py-6 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Health Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome back, {currentProfileData.name}</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Family/Profile Switcher */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <span className="text-lg">{currentProfileData.avatar}</span>
              <span className="text-sm font-medium text-gray-700">{currentProfileData.name}</span>
              <span className="text-xs text-gray-500">▼</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Chatbot - Main Section */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          {/* Chatbot Header */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Health Assistant</h3>
              <p className="text-sm text-gray-600">👋 Hi {currentProfileData.name}, how are you today?</p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4 max-h-48 overflow-y-auto">
            {chatMessages.map(msg => (
              <div key={msg.id} className={`mb-3 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-3 rounded-lg text-sm max-w-[80%] ${
                  msg.sender === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}>
                  {msg.message}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
              placeholder="Ask about your health..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={handleChatSend}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-medium"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(action => (
            <motion.button
              key={action.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.action}
              className={`p-4 rounded-xl bg-white shadow-sm border border-gray-200 hover:shadow-md transition-all ${
                action.color === 'blue' ? 'hover:bg-blue-50' :
                action.color === 'green' ? 'hover:bg-green-50' :
                action.color === 'purple' ? 'hover:bg-purple-50' :
                'hover:bg-orange-50'
              }`}
            >
              <action.icon className={`w-6 h-6 mx-auto mb-2 ${
                action.color === 'blue' ? 'text-blue-600' :
                action.color === 'green' ? 'text-green-600' :
                action.color === 'purple' ? 'text-purple-600' :
                'text-orange-600'
              }`} />
              <p className="text-sm font-medium text-gray-900">{action.title}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Removed old AI Health Assistant section - now integrated above */}

      {/* Profile Switcher Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Switch Profile</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-2">
              {profiles.map(profile => (
                <button
                  key={profile.id}
                  onClick={() => {
                    setCurrentProfile(profile.id);
                    setShowProfileModal(false);
                    // Update chat greeting
                    setChatMessages(prev => [
                      ...prev,
                      { 
                        id: Date.now(), 
                        sender: 'ai', 
                        message: `Hi ${profile.name}, how are you feeling today?`, 
                        timestamp: new Date() 
                      }
                    ]);
                  }}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left transition-all ${
                    currentProfile === profile.id
                      ? 'bg-blue-50 border-2 border-blue-200'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">{profile.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{profile.name}</p>
                    <p className="text-sm text-gray-600">{profile.role}</p>
                  </div>
                  {currentProfile === profile.id && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Removed Recent Activities and Points sections for cleaner design */}
    </div>
  );
};

export default PatientDashboard;
