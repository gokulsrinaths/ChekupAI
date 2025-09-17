import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Gift, Target, TrendingUp, Calendar, Heart, Activity } from 'lucide-react';

const PointsRewardsScreen = () => {
  const [activeTab, setActiveTab] = useState('points');
  
  const points = 1250;
  const level = 'Gold';
  const nextLevelPoints = 2000;
  const progress = (points / nextLevelPoints) * 100;

  const recentEarnings = [
    { id: 1, action: 'Completed Health Checkup', points: 50, date: '2024-01-20', icon: Heart },
    { id: 2, action: 'Uploaded Medical Document', points: 25, date: '2024-01-18', icon: Activity },
    { id: 3, action: 'Set Medication Reminder', points: 15, date: '2024-01-17', icon: Calendar },
    { id: 4, action: 'Shared Health Data', points: 30, date: '2024-01-15', icon: Target },
    { id: 5, action: 'Completed Daily Check-in', points: 10, date: '2024-01-14', icon: Star }
  ];

  const availableRewards = [
    { id: 1, title: 'Free Health Consultation', cost: 500, description: '30-minute video call with a health expert', icon: Heart, color: 'blue' },
    { id: 2, title: 'Premium Health Report', cost: 300, description: 'Detailed AI analysis of your health data', icon: Award, color: 'purple' },
    { id: 3, title: 'Health Tracking Device', cost: 1000, description: 'Smart fitness tracker with health monitoring', icon: Activity, color: 'green' },
    { id: 4, title: 'Nutrition Plan', cost: 200, description: 'Personalized meal planning and recipes', icon: Gift, color: 'orange' },
    { id: 5, title: 'Meditation App Premium', cost: 150, description: '1-year subscription to premium meditation app', icon: Star, color: 'pink' }
  ];

  const waysToEarn = [
    { action: 'Complete daily health check-in', points: 10, frequency: 'Daily' },
    { action: 'Upload medical documents', points: 25, frequency: 'Per document' },
    { action: 'Share anonymized health data', points: 30, frequency: 'Per share' },
    { action: 'Complete health assessments', points: 50, frequency: 'Per assessment' },
    { action: 'Maintain medication adherence', points: 20, frequency: 'Weekly' },
    { action: 'Attend scheduled appointments', points: 40, frequency: 'Per appointment' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 pb-24 max-w-mobile mx-auto">
      {/* Header */}
      <div className="px-4 py-6 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Points & Rewards</h1>
        <p className="text-sm text-gray-600 mt-1">Earn points for healthy activities and redeem rewards</p>
      </div>

      {/* Points Overview */}
      <div className="px-4 py-4">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{points.toLocaleString()}</h2>
              <p className="text-sm opacity-90">Total Points</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <Award className="w-6 h-6" />
                <span className="text-lg font-semibold">{level}</span>
              </div>
              <p className="text-xs opacity-90">Current Level</p>
            </div>
          </div>
          
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress to next level</span>
              <span>{nextLevelPoints - points} points to go</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('points')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'points' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Points
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'rewards' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Rewards
          </button>
          <button
            onClick={() => setActiveTab('earn')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'earn' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Earn More
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {activeTab === 'points' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Points Earned</h3>
            <div className="space-y-3">
              {recentEarnings.map(earning => (
                <motion.div
                  key={earning.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <earning.icon className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{earning.action}</p>
                        <p className="text-xs text-gray-500">{earning.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">+{earning.points}</p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Available Rewards</h3>
            <div className="grid grid-cols-1 gap-4">
              {availableRewards.map(reward => (
                <motion.div
                  key={reward.id}
                  whileHover={{ scale: 1.02 }}
                  className={`bg-white rounded-xl p-4 shadow-sm border border-gray-200 ${
                    points >= reward.cost ? 'hover:shadow-md' : 'opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        reward.color === 'blue' ? 'bg-blue-100' :
                        reward.color === 'purple' ? 'bg-purple-100' :
                        reward.color === 'green' ? 'bg-green-100' :
                        reward.color === 'orange' ? 'bg-orange-100' :
                        'bg-pink-100'
                      }`}>
                        <reward.icon className={`w-6 h-6 ${
                          reward.color === 'blue' ? 'text-blue-600' :
                          reward.color === 'purple' ? 'text-purple-600' :
                          reward.color === 'green' ? 'text-green-600' :
                          reward.color === 'orange' ? 'text-orange-600' :
                          'text-pink-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{reward.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{reward.cost}</div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                  </div>
                  
                  <button
                    disabled={points < reward.cost}
                    className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      points >= reward.cost
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {points >= reward.cost ? 'Redeem Reward' : 'Not enough points'}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'earn' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Ways to Earn Points</h3>
            <div className="space-y-3">
              {waysToEarn.map((way, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{way.action}</p>
                      <p className="text-xs text-gray-500">{way.frequency}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">+{way.points}</div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Pro Tip</h4>
              </div>
              <p className="text-sm text-blue-800">
                Complete multiple activities daily to maximize your points and unlock exclusive rewards!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsRewardsScreen;
