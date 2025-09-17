import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Calendar, Bell, Camera } from 'lucide-react';

const PatientDashboard = ({ user, onNavigate }) => {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'ai', message: `Hi ${user?.user_metadata?.full_name || 'Jane'}, how are you feeling today?`, timestamp: new Date() }
  ]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-20 max-w-mobile mx-auto">
      {/* Header - Perfect spacing and typography */}
      <div className="px-6 py-8 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-light text-gray-900 tracking-tight">Health</h1>
            <p className="text-base text-gray-500 font-light">Welcome back, {user?.user_metadata?.full_name || 'Jane'}</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">👩</span>
          </div>
        </div>
      </div>

      {/* AI Chatbot - Perfect Main Section */}
      <div className="px-6 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
        >
          {/* Chatbot Header - Perfect typography */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-light text-gray-900 tracking-tight">AI Assistant</h3>
              <p className="text-lg text-gray-500 font-light">👋 Hi {user?.user_metadata?.full_name || 'Jane'}, how are you today?</p>
            </div>
          </div>

          {/* Chat Messages - Perfect spacing and design */}
          <div className="bg-gray-50/50 rounded-2xl p-6 mb-6 max-h-64 overflow-y-auto scrollbar-hide">
            <div className="space-y-4">
              {chatMessages.map((msg, index) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                      : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                  }`}>
                    {msg.message}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Chat Input - Perfect interaction design */}
          <div className="flex space-x-3">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
              placeholder="Ask about your health..."
              className="flex-1 px-6 py-4 border border-gray-200 rounded-2xl text-base focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 placeholder-gray-400"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleChatSend}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium shadow-lg"
            >
              Send
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions - Perfect design */}
      <div className="px-6 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <h2 className="text-xl font-light text-gray-900 mb-6 tracking-tight">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={action.action}
                className={`group p-6 rounded-2xl bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 ${
                  action.color === 'blue' ? 'hover:bg-blue-50/50' :
                  action.color === 'green' ? 'hover:bg-green-50/50' :
                  action.color === 'purple' ? 'hover:bg-purple-50/50' :
                  'hover:bg-orange-50/50'
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 ${
                    action.color === 'blue' ? 'bg-blue-100 group-hover:bg-blue-200' :
                    action.color === 'green' ? 'bg-green-100 group-hover:bg-green-200' :
                    action.color === 'purple' ? 'bg-purple-100 group-hover:bg-purple-200' :
                    'bg-orange-100 group-hover:bg-orange-200'
                  }`}>
                    <action.icon className={`w-6 h-6 ${
                      action.color === 'blue' ? 'text-blue-600' :
                      action.color === 'green' ? 'text-green-600' :
                      action.color === 'purple' ? 'text-purple-600' :
                      'text-orange-600'
                    }`} />
                  </div>
                  <p className="text-sm font-medium text-gray-900 text-center leading-tight">{action.title}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Removed old AI Health Assistant section - now integrated above */}

      {/* Removed Recent Activities and Points sections for cleaner design */}
    </div>
  );
};

export default PatientDashboard;
