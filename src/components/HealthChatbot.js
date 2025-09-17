import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HealthChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! I\'m your Health Assistant. I can help you understand your medical records, answer health questions, and provide insights about your family\'s health. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(inputText);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    // Health-related responses
    if (input.includes('blood pressure') || input.includes('hypertension')) {
      return {
        id: Date.now() + 1,
        type: 'bot',
        text: 'I can help you understand your blood pressure readings. Normal blood pressure is typically below 120/80 mmHg. If you have readings above this, I recommend discussing with your doctor about lifestyle changes or medication. Would you like me to analyze your recent blood pressure data?',
        timestamp: new Date()
      };
    }
    
    if (input.includes('diabetes') || input.includes('blood sugar')) {
      return {
        id: Date.now() + 1,
        type: 'bot',
        text: 'Managing diabetes involves monitoring blood sugar levels, maintaining a healthy diet, regular exercise, and taking prescribed medications. I can help you track your glucose readings and provide dietary recommendations. What specific aspect of diabetes management would you like to discuss?',
        timestamp: new Date()
      };
    }
    
    if (input.includes('family') || input.includes('children')) {
      return {
        id: Date.now() + 1,
        type: 'bot',
        text: 'I can help you manage your family\'s health records and provide insights about hereditary conditions. I notice you have family members with different health conditions. Would you like me to create a family health summary or discuss preventive care strategies?',
        timestamp: new Date()
      };
    }
    
    if (input.includes('medication') || input.includes('drug') || input.includes('prescription')) {
      return {
        id: Date.now() + 1,
        type: 'bot',
        text: 'I can help you understand your medications, potential interactions, and side effects. I can also remind you about medication schedules and help you track adherence. What medication information do you need help with?',
        timestamp: new Date()
      };
    }
    
    if (input.includes('appointment') || input.includes('doctor') || input.includes('visit')) {
      return {
        id: Date.now() + 1,
        type: 'bot',
        text: 'I can help you prepare for doctor visits by summarizing your recent health data, preparing questions to ask, and organizing your medical records. I can also help you schedule follow-up appointments and set health reminders.',
        timestamp: new Date()
      };
    }
    
    if (input.includes('symptoms') || input.includes('pain') || input.includes('ache')) {
      return {
        id: Date.now() + 1,
        type: 'bot',
        text: 'I can help you track symptoms and provide general health information. However, I cannot diagnose medical conditions. If you\'re experiencing concerning symptoms, please consult with a healthcare professional. I can help you prepare a symptom log for your doctor visit.',
        timestamp: new Date()
      };
    }
    
    // Default response
    return {
      id: Date.now() + 1,
      type: 'bot',
      text: 'I understand you\'re asking about health-related topics. I can help you with understanding your medical records, tracking health metrics, managing family health data, medication information, and preparing for doctor visits. Could you be more specific about what you\'d like to know?',
      timestamp: new Date()
    };
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    'Analyze my recent health data',
    'Help with medication management',
    'Family health summary',
    'Prepare for doctor visit',
    'Track symptoms',
    'Health reminders'
  ];

  return (
    <div className="min-h-screen bg-white pb-24 max-w-mobile mx-auto">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900">Health Assistant</h1>
        <p className="text-xs text-gray-500 mt-1">AI-powered health insights and support</p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 px-4 py-4 space-y-4 max-h-96 overflow-y-auto">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p>{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 text-gray-900 px-3 py-2 rounded-lg text-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      <div className="px-4 mb-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Questions</h3>
        <div className="grid grid-cols-2 gap-2">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => setInputText(question)}
              className="text-xs bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-left"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your health..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>

      {/* Health Tips */}
      <div className="px-4 mb-4">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3">
          <h4 className="font-medium text-gray-900 text-sm mb-2">💡 Health Tip</h4>
          <p className="text-xs text-gray-600">
            Regular exercise, balanced nutrition, and adequate sleep are the foundation of good health. 
            Track your daily habits to maintain optimal wellness.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthChatbot;
