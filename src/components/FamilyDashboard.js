import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FamilyDashboard = () => {
  const [selectedMember, setSelectedMember] = useState(null);

  const familyMembers = [
    {
      id: 1,
      name: 'John Doe',
      relationship: 'Self',
      age: 35,
      status: 'Active',
      lastCheckup: '2024-01-15',
      conditions: ['Hypertension'],
      avatar: '👤',
      color: 'blue'
    },
    {
      id: 2,
      name: 'Sarah Doe',
      relationship: 'Spouse',
      age: 32,
      status: 'Active',
      lastCheckup: '2024-01-10',
      conditions: ['Diabetes Type 2'],
      avatar: '👩',
      color: 'pink'
    },
    {
      id: 3,
      name: 'Emma Doe',
      relationship: 'Daughter',
      age: 8,
      status: 'Pending',
      lastCheckup: '2024-01-05',
      conditions: ['Asthma'],
      avatar: '👶',
      color: 'green'
    },
    {
      id: 4,
      name: 'Robert Doe',
      relationship: 'Father',
      age: 68,
      status: 'Active',
      lastCheckup: '2024-01-12',
      conditions: ['Heart Disease', 'Arthritis'],
      avatar: '👴',
      color: 'gray'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-600';
      case 'Pending': return 'bg-yellow-100 text-yellow-600';
      case 'Inactive': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getConditionColor = (condition) => {
    const colors = {
      'Hypertension': 'bg-red-50 text-red-700',
      'Diabetes Type 2': 'bg-blue-50 text-blue-700',
      'Asthma': 'bg-yellow-50 text-yellow-700',
      'Heart Disease': 'bg-red-50 text-red-700',
      'Arthritis': 'bg-purple-50 text-purple-700'
    };
    return colors[condition] || 'bg-gray-50 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-white pb-24 max-w-mobile mx-auto">
      {/* Header */}
      <div className="px-4 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Family Health</h1>
        <p className="text-xs text-gray-500 mt-1">Manage health records for your family</p>
      </div>

      {/* Family Overview */}
      <div className="px-4 mb-4">
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-600 mb-1">Total Members</p>
              <p className="text-xl font-semibold text-gray-900">{familyMembers.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Active</p>
              <p className="text-xl font-semibold text-green-600">
                {familyMembers.filter(m => m.status === 'Active').length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Pending</p>
              <p className="text-xl font-semibold text-yellow-600">
                {familyMembers.filter(m => m.status === 'Pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-blue-600 text-white p-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            👥 Add Family Member
          </button>
          <button className="bg-green-600 text-white p-3 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
            📋 Health Summary
          </button>
        </div>
      </div>

      {/* Family Members List */}
      <div className="px-4">
        <h2 className="text-base font-medium text-gray-900 mb-3">Family Members</h2>
        <div className="space-y-3">
          {familyMembers.map((member) => (
            <motion.div
              key={member.id}
              whileHover={{ scale: 1.02 }}
              className="bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setSelectedMember(member)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{member.avatar}</span>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{member.name}</h3>
                    <p className="text-xs text-gray-600">{member.relationship} • {member.age} years old</p>
                    <p className="text-xs text-gray-500">Last checkup: {member.lastCheckup}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] px-2 py-1 rounded ${getStatusColor(member.status)}`}>
                    {member.status}
                  </span>
                </div>
              </div>
              
              {/* Conditions */}
              <div className="mt-3 flex flex-wrap gap-1">
                {member.conditions.map((condition, idx) => (
                  <span
                    key={idx}
                    className={`text-[10px] px-2 py-1 rounded ${getConditionColor(condition)}`}
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{selectedMember.avatar}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedMember.name}</h3>
                  <p className="text-xs text-gray-600">{selectedMember.relationship}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {/* Basic Info */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 text-sm">Basic Information</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Age:</span>
                    <span className="ml-1 font-medium">{selectedMember.age} years</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={`ml-1 px-2 py-1 rounded ${getStatusColor(selectedMember.status)}`}>
                      {selectedMember.status}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Last Checkup:</span>
                    <span className="ml-1 font-medium">{selectedMember.lastCheckup}</span>
                  </div>
                </div>
              </div>

              {/* Health Conditions */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 text-sm">Health Conditions</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedMember.conditions.map((condition, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-2 py-1 rounded ${getConditionColor(condition)}`}
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t space-y-2">
                <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  View Health Records
                </button>
                <button className="w-full py-2 px-4 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">
                  Schedule Appointment
                </button>
                <button className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                  Edit Profile
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default FamilyDashboard;
