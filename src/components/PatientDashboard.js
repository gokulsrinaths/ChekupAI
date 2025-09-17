import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Calendar, Bell, Camera, Upload, Users, Settings, Award, Heart, Activity } from 'lucide-react';

const PatientDashboard = ({ user, onNavigate }) => {
  const [currentFamilyMember, setCurrentFamilyMember] = useState('jane');
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'ai', message: `Hi ${user?.user_metadata?.full_name || 'Jane'}, how are you feeling today?`, timestamp: new Date() }
  ]);

  const familyMembers = [
    { id: 'jane', name: 'Jane Doe', role: 'You', avatar: '👩', healthScore: 85, lastCheckup: '2024-01-15' },
    { id: 'john', name: 'John Doe', role: 'Husband', avatar: '👨', healthScore: 92, lastCheckup: '2024-01-10' },
    { id: 'emma', name: 'Emma Doe', role: 'Daughter', avatar: '👶', healthScore: 78, lastCheckup: '2024-01-20' }
  ];

  const quickActions = [
    { id: 'appointment', title: 'Book Appointment', icon: Calendar, color: 'blue', action: () => onNavigate('appointments') },
    { id: 'reminders', title: 'Set Reminders', icon: Bell, color: 'green', action: () => onNavigate('reminders') },
    { id: 'calendar', title: 'Health Calendar', icon: Calendar, color: 'purple', action: () => onNavigate('calendar') },
    { id: 'scan', title: 'Scan Document', icon: Camera, color: 'orange', action: () => onNavigate('scan') }
  ];

  const recentActivities = [
    { id: 1, type: 'appointment', title: 'Cardiology Checkup', date: '2024-01-20', status: 'upcoming' },
    { id: 2, type: 'medication', title: 'Blood Pressure Medication', date: '2024-01-18', status: 'completed' },
    { id: 3, type: 'test', title: 'Blood Test Results', date: '2024-01-15', status: 'completed' }
  ];

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

  const currentMember = familyMembers.find(m => m.id === currentFamilyMember);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-24 max-w-mobile mx-auto">
      {/* Header */}
      <div className="px-4 py-6 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Health Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome back, {currentMember?.name}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">{currentMember?.avatar}</span>
            </div>
          </div>
        </div>

        {/* Family Member Switcher */}
        <div className="flex space-x-2">
          {familyMembers.map(member => (
            <button
              key={member.id}
              onClick={() => setCurrentFamilyMember(member.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all ${
                currentFamilyMember === member.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{member.avatar}</span>
              <span>{member.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Health Score Card */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Health Score</h3>
              <p className="text-sm text-gray-600">Overall wellness</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">{currentMember?.healthScore}</div>
              <div className="text-sm text-gray-500">/ 100</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${currentMember?.healthScore}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Last checkup: {currentMember?.lastCheckup}</p>
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

      {/* AI Health Assistant */}
      <div className="px-4 py-2">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-semibold">AI Health Assistant</h3>
            </div>
            <button
              onClick={() => setShowChatbot(!showChatbot)}
              className="text-white/80 hover:text-white transition-colors"
            >
              {showChatbot ? 'Hide' : 'Chat'}
            </button>
          </div>
          
          {showChatbot && (
            <div className="space-y-3">
              <div className="bg-white/20 rounded-lg p-3 max-h-32 overflow-y-auto">
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-2 rounded-lg text-sm ${
                      msg.sender === 'user' ? 'bg-white/30' : 'bg-white/10'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                  placeholder="Ask about your health..."
                  className="flex-1 px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-transparent"
                />
                <button
                  onClick={handleChatSend}
                  className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
          <button 
            onClick={() => onNavigate('activities')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View All
          </button>
        </div>
        <div className="space-y-2">
          {recentActivities.map(activity => (
            <div key={activity.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'appointment' ? 'bg-blue-100' :
                    activity.type === 'medication' ? 'bg-green-100' :
                    'bg-purple-100'
                  }`}>
                    {activity.type === 'appointment' ? <Calendar className="w-4 h-4 text-blue-600" /> :
                     activity.type === 'medication' ? <Heart className="w-4 h-4 text-green-600" /> :
                     <Activity className="w-4 h-4 text-purple-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.date}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activity.status === 'upcoming' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {activity.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Points & Rewards */}
      <div className="px-4 py-2">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Health Points</h3>
              <p className="text-sm opacity-90">Keep up the good work!</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">1,250</div>
              <div className="text-xs opacity-90">points</div>
            </div>
          </div>
          <div className="mt-3 flex space-x-2">
            <button 
              onClick={() => onNavigate('rewards')}
              className="flex-1 bg-white/20 hover:bg-white/30 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
            >
              View Rewards
            </button>
            <button 
              onClick={() => onNavigate('points')}
              className="flex-1 bg-white/20 hover:bg-white/30 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
            >
              Earn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
