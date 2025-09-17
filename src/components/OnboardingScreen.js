import React, { useState } from 'react';
import { motion } from 'framer-motion';

const OnboardingScreen = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleContinue = async () => {
    if (step === 1) {
      if (validateForm()) {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
          setIsLoading(false);
          setStep(2);
        }, 1000);
      }
    } else {
      onComplete();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleContinue();
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-white px-6 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-sm mx-auto w-full"
        >
          <div className="text-center mb-8">
            <p className="text-gray-600">Create your account to get started</p>
          </div>

          <div className="space-y-4">
            <div>
              <label 
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-trust-blue focus:border-transparent transition-all ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
                aria-describedby={errors.email ? 'email-error' : undefined}
                aria-invalid={!!errors.email}
                autoComplete="email"
                autoFocus
              />
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  id="email-error"
                  className="mt-1 text-sm text-red-600"
                  role="alert"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            <div>
              <label 
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-trust-blue focus:border-transparent transition-all ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Create a password"
                aria-describedby={errors.password ? 'password-error' : undefined}
                aria-invalid={!!errors.password}
                autoComplete="new-password"
              />
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  id="password-error"
                  className="mt-1 text-sm text-red-600"
                  role="alert"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            onClick={handleContinue}
            disabled={isLoading}
            className={`w-full mt-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all ${
              isLoading 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-trust-blue text-white hover:bg-blue-700'
            }`}
            aria-label={isLoading ? 'Creating account...' : 'Continue to next step'}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Creating account...</span>
              </div>
            ) : (
              'Continue'
            )}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-sm mx-auto w-full"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-trust-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔒</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Data, Your Control</h1>
          <p className="text-gray-600 leading-relaxed">
            Your health data belongs to <strong>YOU</strong>. Share it only when you want, 
            and earn when it's used for research and development.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-money-green rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Complete Privacy Control</h3>
              <p className="text-sm text-gray-600">
                You decide exactly what data to share and with whom
              </p>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleContinue}
          className="w-full bg-trust-blue text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          Enter Dashboard
        </motion.button>
      </motion.div>
    </div>
  );
};

export default OnboardingScreen;
