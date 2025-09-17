import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Filter, Search, Calendar, User, Activity } from 'lucide-react';

const AuditLogScreen = ({ onBack, auditEvents = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActor, setFilterActor] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Mock audit events if none provided
  const defaultEvents = [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      actor: 'Patient',
      action: 'Consent Granted',
      scope: 'Research',
      details: 'User enabled research participation'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      actor: 'Doctor',
      action: 'Viewed Case',
      scope: 'MRI Scan',
      details: 'Case ID: MRI-001, Payment: $10'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      actor: 'Pharma',
      action: 'Requested Dataset',
      scope: 'Oncology Dataset',
      details: 'Dataset ID: ONC-001, Price: $250,000'
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      actor: 'Patient',
      action: 'File Shared',
      scope: 'Blood Test',
      details: 'File status changed to shared'
    }
  ];

  const events = auditEvents.length > 0 ? auditEvents : defaultEvents;

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesActor = filterActor === 'all' || event.actor.toLowerCase() === filterActor;
    return matchesSearch && matchesActor;
  });

  const getActorIcon = (actor) => {
    switch (actor.toLowerCase()) {
      case 'patient': return '👤';
      case 'doctor': return '👨‍⚕️';
      case 'pharma': return '💊';
      case 'system': return '⚙️';
      default: return '👤';
    }
  };

  const getActorColor = (actor) => {
    switch (actor.toLowerCase()) {
      case 'patient': return 'bg-blue-100 text-blue-600';
      case 'doctor': return 'bg-green-100 text-green-600';
      case 'pharma': return 'bg-purple-100 text-purple-600';
      case 'system': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Audit Log</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle filters"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-4 py-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit events..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex space-x-2">
              {['all', 'patient', 'doctor', 'pharma', 'system'].map((actor) => (
                <button
                  key={actor}
                  onClick={() => setFilterActor(actor)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filterActor === actor
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {actor.charAt(0).toUpperCase() + actor.slice(1)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Events List */}
      <div className="px-4 space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No audit events found</p>
          </div>
        ) : (
          filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-lg p-4"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">{getActorIcon(event.actor)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActorColor(event.actor)}`}>
                      {event.actor}
                    </span>
                    <span className="text-xs text-gray-500">{formatTimestamp(event.timestamp)}</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{event.action}</h3>
                  <p className="text-sm text-gray-600 mb-2">{event.details}</p>
                  {event.scope && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">Scope: {event.scope}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default AuditLogScreen;
