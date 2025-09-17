import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WalletScreen = ({ userData, onDataUpdate }) => {
  const [showCashOutModal, setShowCashOutModal] = useState(false);

  const transactions = [
    {
      id: 1,
      type: 'earned',
      amount: 5.00,
      description: 'Doctor viewed your MRI',
      date: '2024-01-15',
      time: '2:30 PM',
      icon: '🩺'
    },
    {
      id: 2,
      type: 'earned',
      amount: 20.00,
      description: 'PharmaX added your file',
      date: '2024-01-14',
      time: '10:15 AM',
      icon: '💊'
    },
    {
      id: 3,
      type: 'earned',
      amount: 2.00,
      description: 'Doctor viewed your blood test',
      date: '2024-01-13',
      time: '4:45 PM',
      icon: '🩸'
    },
    {
      id: 4,
      type: 'earned',
      amount: 8.00,
      description: 'Research participation bonus',
      date: '2024-01-12',
      time: '9:20 AM',
      icon: '🔬'
    },
    {
      id: 5,
      type: 'earned',
      amount: 15.00,
      description: 'Dataset contribution',
      date: '2024-01-11',
      time: '3:10 PM',
      icon: '📊'
    }
  ];

  const handleCashOut = () => {
    setShowCashOutModal(true);
  };

  const confirmCashOut = () => {
    // In a real app, this would trigger a payment process
    onDataUpdate({ balance: 0 });
    setShowCashOutModal(false);
  };


  return (
    <div className="min-h-screen bg-white pb-24 max-w-mobile mx-auto">
      {/* Header */}
      <div className="px-4 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Wallet</h1>
      </div>

      {/* Balance Card */}
      <div className="px-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-600">Balance</p>
              <p className="text-xl font-semibold text-gray-900">${userData.balance.toFixed(2)}</p>
            </div>
            <span className="text-lg">💳</span>
          </div>
          
          <button
            onClick={handleCashOut}
            disabled={userData.balance === 0}
            className={`w-full py-2 rounded-lg font-medium text-sm ${
              userData.balance === 0 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Cash Out
          </button>
        </div>
      </div>


      {/* Transaction History */}
      <div className="px-4">
        <h2 className="text-base font-medium text-gray-900 mb-3">Recent Activity</h2>
        <div className="space-y-2">
          {transactions.map((transaction, index) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{transaction.icon}</span>
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-600">{transaction.date}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-green-600">
                +${transaction.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Cash Out Modal */}
      <AnimatePresence>
        {showCashOutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCashOutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-money-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💸</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Cash Out</h3>
                <p className="text-gray-600 mb-4">
                  You're about to withdraw <strong>${userData.balance.toFixed(2)}</strong> to your bank account.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Funds will be transferred within 1-2 business days.
                </p>
                
                <div className="flex space-x-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCashOutModal(false)}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={confirmCashOut}
                    className="flex-1 py-3 px-4 bg-money-green text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Confirm
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletScreen;
