import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PAGE_TRANSITION, slideVariants } from './motion';
import SplashScreen from './components/SplashScreen';
import OnboardingScreen from './components/OnboardingScreen';
import DashboardScreen from './components/DashboardScreen';
import FilesScreen from './components/FilesScreen';
import WalletScreen from './components/WalletScreen';
import SettingsScreen from './components/SettingsScreen';
import BottomNavigation from './components/BottomNavigation';
import TopBar from './components/TopBar';
import TrustPolicyModal from './components/TrustPolicyModal';
import ConsentReceiptModal from './components/ConsentReceiptModal';
import PackagingModal from './components/PackagingModal';
import PWAInstallBanner from './components/PWAInstallBanner';
import DemoMode from './components/DemoMode';
import OfflineBanner from './components/OfflineBanner';
import ConsentManager from './components/ConsentManager';
import PayoutsScreen from './components/PayoutsScreen';
import LegalScreen from './components/LegalScreen';
import SupportScreen from './components/SupportScreen';
import { ToastContainer } from './components/Toast';
import AIAssistantScreen from './components/AIAssistantScreen';
import DemoGuide from './components/DemoGuide';

// Lazy-loaded heavy screens (must come after all static imports to satisfy ESLint import/first)
const DoctorViewScreen = React.lazy(() => import('./components/DoctorViewScreen'));
const PharmaViewScreen = React.lazy(() => import('./components/PharmaViewScreen'));
const AuditLogScreen = React.lazy(() => import('./components/AuditLogScreen'));
const TrustComplianceScreen = React.lazy(() => import('./components/TrustComplianceScreen'));
const AnalyticsScreen = React.lazy(() => import('./components/AnalyticsScreen'));
const PricingScreen = React.lazy(() => import('./components/PricingScreen'));

function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState('patient');
  const [showTrustModal, setShowTrustModal] = useState(false);
  const [showConsentReceipt, setShowConsentReceipt] = useState(false);
  const [showPackagingModal, setShowPackagingModal] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [auditEvents, setAuditEvents] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [showGuide, setShowGuide] = useState(false);
  const [userData, setUserData] = useState({
    balance: 230.00,
    files: [
      { id: 1,  name: 'MRI Brain',            type: 'Imaging',   status: 'private', icon: '🧠', date: '2025-09-01', size: '120MB', earnings: 0 },
      { id: 2,  name: 'MRI Knee',             type: 'Imaging',   status: 'shared',  icon: '🦵', date: '2025-08-28', size: '95MB',  earnings: 3.00 },
      { id: 3,  name: 'CT Chest',             type: 'Imaging',   status: 'private', icon: '🫁', date: '2025-08-20', size: '200MB', earnings: 0 },
      { id: 4,  name: 'Blood Test Panel',     type: 'Lab',       status: 'shared',  icon: '🩸', date: '2025-08-18', size: '2MB',   earnings: 5.00 },
      { id: 5,  name: 'Genetic Report',       type: 'Genomics',  status: 'private', icon: '🧬', date: '2025-08-12', size: '80MB',  earnings: 0 },
      { id: 6,  name: 'EHR Notes - Cardio',   type: 'Notes',     status: 'earned',  icon: '📋', date: '2025-08-10', size: '1.2MB', earnings: 2.00 },
      { id: 7,  name: 'X-Ray Wrist',          type: 'Imaging',   status: 'shared',  icon: '✋', date: '2025-08-05', size: '12MB',  earnings: 1.00 },
      { id: 8,  name: 'Allergy Profile',      type: 'Lab',       status: 'private', icon: '🌿', date: '2025-07-30', size: '1MB',   earnings: 0 },
      { id: 9,  name: 'Medication List',      type: 'Notes',     status: 'shared',  icon: '💊', date: '2025-07-28', size: '0.5MB', earnings: 1.50 },
      { id:10,  name: 'ECG Report',           type: 'Cardio',    status: 'earned',  icon: '❤️', date: '2025-07-25', size: '8MB',   earnings: 2.50 },
      { id:11,  name: 'Ultrasound Abdomen',   type: 'Imaging',   status: 'private', icon: '🫃', date: '2025-07-20', size: '60MB',  earnings: 0 },
      { id:12,  name: 'Pathology Report',     type: 'Pathology', status: 'shared',  icon: '🧫', date: '2025-07-18', size: '3MB',   earnings: 4.00 },
      { id:13,  name: 'EEG Study',            type: 'Neuro',     status: 'private', icon: '⚡', date: '2025-07-12', size: '50MB',  earnings: 0 },
      { id:14,  name: 'Holter Monitor 24h',   type: 'Cardio',    status: 'shared',  icon: '⌚', date: '2025-07-05', size: '150MB', earnings: 3.50 },
      { id:15,  name: 'Spirometry',           type: 'Respiratory',status:'earned',  icon: '🌬️',date: '2025-06-30', size: '1MB',   earnings: 1.25 },
      { id:16,  name: 'Vaccination Record',   type: 'Record',    status: 'shared',  icon: '💉', date: '2025-06-28', size: '0.3MB', earnings: 0.75 },
      { id:17,  name: 'Colonoscopy Video',    type: 'Imaging',   status: 'private', icon: '📹', date: '2025-06-20', size: '500MB', earnings: 0 },
      { id:18,  name: 'Mammogram',            type: 'Imaging',   status: 'shared',  icon: '🎀', date: '2025-06-18', size: '70MB',  earnings: 2.25 },
      { id:19,  name: 'HbA1c Trend',          type: 'Lab',       status: 'earned',  icon: '📈', date: '2025-06-10', size: '0.8MB', earnings: 1.10 },
      { id:20,  name: 'EHR Notes - Neuro',    type: 'Notes',     status: 'private', icon: '🧠', date: '2025-06-05', size: '1.5MB', earnings: 0 }
    ],
    allowResearch: false
  });

  useEffect(() => {
    // Load extra mock files once
    fetch('/mock/files.json')
      .then(r => r.ok ? r.json() : [])
      .then((more) => {
        if (!Array.isArray(more) || more.length === 0) return;
        setUserData(prev => {
          const existingIds = new Set(prev.files.map(f => f.id));
          const merged = [...prev.files, ...more.filter(f => !existingIds.has(f.id))];
          return { ...prev, files: merged };
        });
      })
      .catch(() => {})
  }, [currentScreen]);

  // When role changes, route to the appropriate home screen for that role
  useEffect(() => {
    if (currentRole === 'patient') {
      setCurrentScreen('dashboard');
    } else if (currentRole === 'doctor') {
      setCurrentScreen('doctor');
    } else if (currentRole === 'pharma') {
      setCurrentScreen('pharma');
    }
  }, [currentRole]);

  const handleScreenChange = (screen) => {
    setCurrentScreen(screen);
  };

  const handleDataUpdate = (newData) => {
    setUserData(prev => ({ ...prev, ...newData }));
  };

  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addAuditEvent = (event) => {
    const newEvent = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...event
    };
    setAuditEvents(prev => [newEvent, ...prev]);
  };

  const handleConsentToggle = (consent) => {
    setUserData(prev => ({ ...prev, allowResearch: consent }));
    if (consent) {
      addAuditEvent({
        actor: 'Patient',
        action: 'Consent Granted',
        scope: 'Research',
        details: 'User enabled research participation'
      });
      addToast('Consent saved.', 'success');
      setShowConsentReceipt(true);
    } else {
      addAuditEvent({
        actor: 'Patient',
        action: 'Consent Revoked',
        scope: 'Research',
        details: 'User disabled research participation'
      });
      addToast('Consent revoked.', 'info');
    }
  };

  const handleDoctorViewCase = (caseData) => {
    // Doctors can view research files without any payment involved
    addAuditEvent({
      actor: 'Doctor',
      action: 'Viewed Research File',
      scope: caseData.condition,
      details: `File type: ${caseData.type}, Patient: ${caseData.age}y ${caseData.gender}`
    });
    addToast('Research file accessed', 'info');
  };

  const handlePharmaRequestDataset = (dataset) => {
    setSelectedDataset(dataset);
    setShowPackagingModal(true);
  };

  const handlePackagingComplete = () => {
    if (selectedDataset) {
      // Add earnings to patient
      setUserData(prev => ({ 
        ...prev, 
        balance: prev.balance + 20.00 
      }));
      
      addAuditEvent({
        actor: 'Pharma',
        action: 'Requested Dataset',
        scope: selectedDataset.name,
        details: `Dataset ID: ${selectedDataset.id}, Price: $${selectedDataset.price.toLocaleString()}, Patient earned: $20.00`
      });
      addToast('Dataset ready — You earned $20.00', 'success');
    }
    setShowPackagingModal(false);
    setSelectedDataset(null);
  };

  const resetDemo = () => {
    setUserData({
      balance: 230.00,
      files: [
        { id: 1, name: 'MRI Scan', status: 'private', icon: '🔒' },
        { id: 2, name: 'Blood Test', status: 'shared', icon: '✅' },
        { id: 3, name: 'EHR Notes', status: 'earned', icon: '💰' }
      ],
      allowResearch: false
    });
    setAuditEvents([]);
    setCurrentRole('patient');
    setCurrentScreen('dashboard');
  };

  const runDemoScript = async () => {
    // Step 1: Ensure patient role and toggle consent
    setCurrentRole('patient');
    setCurrentScreen('dashboard');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    handleConsentToggle(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setShowConsentReceipt(false);
    
    // Step 2: Switch to Doctor and view case
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCurrentRole('doctor');
    setCurrentScreen('doctor');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockCase = { id: 1, condition: 'Type 2 Diabetes' };
    handleDoctorViewCase(mockCase);
    
    // Step 3: Switch to Pharma and request dataset
    await new Promise(resolve => setTimeout(resolve, 2000));
    setCurrentRole('pharma');
    setCurrentScreen('pharma');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockDataset = { id: 1, name: 'Oncology Dataset', price: 250000 };
    handlePharmaRequestDataset(mockDataset);
    
    // Step 4: Back to Patient Wallet
    await new Promise(resolve => setTimeout(resolve, 3000));
    setCurrentRole('patient');
    setCurrentScreen('wallet');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'onboarding':
        return <OnboardingScreen onComplete={() => setCurrentScreen('dashboard')} />;
      case 'dashboard':
        return <DashboardScreen 
          userData={userData} 
          onDataUpdate={handleDataUpdate} 
          onConsentToggle={handleConsentToggle}
        />;
      case 'doctor':
        return <DoctorViewScreen onViewCase={handleDoctorViewCase} sharedFiles={userData.files} />;
      case 'files':
        return <FilesScreen 
          userData={userData} 
          onDataUpdate={handleDataUpdate}
          onAddAuditEvent={addAuditEvent}
        />;
      case 'pharma':
        return <PharmaViewScreen 
          onRequestDataset={handlePharmaRequestDataset}
        />;
      case 'wallet':
        return <WalletScreen 
          userData={userData} 
          onDataUpdate={handleDataUpdate} 
        />;
      case 'settings':
        return <SettingsScreen 
          userData={userData} 
          onDataUpdate={handleDataUpdate}
          onViewAuditLog={() => setCurrentScreen('audit-log')}
          onNavigate={(screen) => setCurrentScreen(screen)}
        />;
      case 'audit-log':
        return <AuditLogScreen 
          onBack={() => setCurrentScreen('settings')}
          auditEvents={auditEvents}
        />;
      case 'consent-manager':
        return <ConsentManager files={userData.files} consents={{}} onChange={() => {}} />;
      case 'payouts':
        return <PayoutsScreen />;
      case 'trust-compliance':
        return <TrustComplianceScreen />;
      case 'analytics':
        return <AnalyticsScreen />;
      case 'pricing':
        return <PricingScreen />;
      case 'legal':
        return <LegalScreen />;
      case 'support':
        return <SupportScreen />;
      case 'ai':
        return <AIAssistantScreen files={userData.files} />;
      default:
        return <DashboardScreen 
          userData={userData} 
          onDataUpdate={handleDataUpdate}
          onConsentToggle={handleConsentToggle}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Top Bar - only show after onboarding */}
      {currentScreen !== 'splash' && currentScreen !== 'onboarding' && (
        <TopBar 
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          onInfoClick={() => setShowTrustModal(true)}
        />
      )}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          custom={1}
          initial={slideVariants.initial(1)}
          animate={slideVariants.animate}
          exit={slideVariants.exit(-1)}
          transition={PAGE_TRANSITION}
          className="w-full app-container"
        >
          <Suspense fallback={<div className="px-6 py-6 text-gray-500">Loading…</div>}>
            {renderScreen()}
          </Suspense>
        </motion.div>
      </AnimatePresence>
      
      {/* Bottom Navigation - only show after onboarding */}
      {currentScreen !== 'splash' && currentScreen !== 'onboarding' && (
        <BottomNavigation 
          currentScreen={currentScreen} 
          onScreenChange={handleScreenChange}
          currentRole={currentRole}
        />
      )}

      {/* Modals */}
      <TrustPolicyModal 
        isOpen={showTrustModal}
        onClose={() => setShowTrustModal(false)}
      />
      
      <ConsentReceiptModal 
        isOpen={showConsentReceipt}
        onClose={() => setShowConsentReceipt(false)}
        receiptData={{
          id: 'CR-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          timestamp: new Date().toISOString()
        }}
      />
      
      <PackagingModal 
        isOpen={showPackagingModal}
        onClose={() => setShowPackagingModal(false)}
        datasetName={selectedDataset?.name}
        onComplete={handlePackagingComplete}
      />

      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {/* Offline Banner */}
      <OfflineBanner />

      {/* Demo Mode */}
      {currentScreen !== 'splash' && currentScreen !== 'onboarding' && (
        <DemoMode 
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          onScreenChange={setCurrentScreen}
          onDataUpdate={handleDataUpdate}
          onResetDemo={resetDemo}
          onRunDemoScript={runDemoScript}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Step-by-step Demo Guide (floating CTA bottom-right) */}
      {currentScreen !== 'splash' && currentScreen !== 'onboarding' && (
        <>
          <button
            onClick={()=>setShowGuide(true)}
            className="fixed bottom-20 right-4 z-30 px-3 py-2 rounded-full bg-blue-600 text-white text-sm shadow-lg"
          >
            Demo Guide
          </button>
          <DemoGuide
            open={showGuide}
            onClose={()=>setShowGuide(false)}
            actions={{
              consent: ()=>{ setCurrentRole('patient'); setCurrentScreen('dashboard'); handleConsentToggle(true); },
              doctor: ()=>{ setCurrentRole('doctor'); setCurrentScreen('doctor'); setTimeout(()=>{ const mockCase={ id: 1, condition: 'Hypertension' }; handleDoctorViewCase(mockCase); }, 500); },
              pharma: ()=>{ setCurrentRole('pharma'); setCurrentScreen('pharma'); setTimeout(()=>{ const mockDataset={ id: 99, name: 'Custom: Demo Cohort', price: 20 }; handlePharmaRequestDataset(mockDataset); }, 500); },
              wallet: ()=>{ setCurrentRole('patient'); setCurrentScreen('wallet'); },
              audit: ()=>{ setCurrentRole('patient'); setCurrentScreen('audit-log'); }
            }}
          />
        </>
      )}
    </div>
  );
}

export default App;
