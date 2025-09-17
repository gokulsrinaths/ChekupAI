import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PAGE_TRANSITION, slideVariants } from '../motion';
// Authentication removed - direct access to dashboard
import SplashScreen from './SplashScreen';
import OnboardingScreen from './OnboardingScreen';
import DashboardScreen from './DashboardScreen';
import PatientDashboard from './PatientDashboard';
import EnhancedFilesScreen from './EnhancedFilesScreen';
import FilesScreen from './FilesScreen';
import UploadScreen from './UploadScreen';
import WalletScreen from './WalletScreen';
import PointsRewardsScreen from './PointsRewardsScreen';
import SettingsScreen from './SettingsScreen';
import BottomNavigation from './BottomNavigation';
import TopBar from './TopBar';
import TrustPolicyModal from './TrustPolicyModal';
import ConsentReceiptModal from './ConsentReceiptModal';
import PackagingModal from './PackagingModal';
import PWAInstallBanner from './PWAInstallBanner';
import DemoMode from './DemoMode';
import OfflineBanner from './OfflineBanner';
import ConsentManager from './ConsentManager';
import PayoutsScreen from './PayoutsScreen';
import LegalScreen from './LegalScreen';
import SupportScreen from './SupportScreen';
import { ToastContainer } from './Toast';
import AIAssistantScreen from './AIAssistantScreen';
import DemoGuide from './DemoGuide';

// Lazy-loaded heavy screens
const DoctorViewScreen = React.lazy(() => import('./DoctorViewScreen'));
const PharmaViewScreen = React.lazy(() => import('./PharmaViewScreen'));
const FamilyDashboard = React.lazy(() => import('./FamilyDashboard'));
const DocumentUpload = React.lazy(() => import('./DocumentUpload'));
const HealthChatbot = React.lazy(() => import('./HealthChatbot'));
const AuditLogScreen = React.lazy(() => import('./AuditLogScreen'));
const TrustComplianceScreen = React.lazy(() => import('./TrustComplianceScreen'));
const AnalyticsScreen = React.lazy(() => import('./AnalyticsScreen'));
const PricingScreen = React.lazy(() => import('./PricingScreen'));

const MainApp = () => {
  // Mock user data for demo
  const user = { id: 'demo-user', user_metadata: { full_name: 'Jane Doe' } };
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
    balance: 0,
    files: [],
    allowResearch: false
  });

  // Skip authentication - go directly to dashboard

  const handleScreenChange = (screen) => {
    setCurrentScreen(screen);
  };

  const handleDataUpdate = (updates) => {
    setUserData(prev => ({ ...prev, ...updates }));
  };

  const addAuditEvent = (event) => {
    setAuditEvents(prev => [...prev, { ...event, id: Date.now(), timestamp: new Date().toISOString() }]);
  };

  const handleConsentToggle = () => {
    setUserData(prev => ({ ...prev, allowResearch: !prev.allowResearch }));
    addAuditEvent({
      actor: 'Patient',
      action: 'Research Consent Toggled',
      scope: 'Data Sharing',
      details: `Research participation: ${!userData.allowResearch ? 'Enabled' : 'Disabled'}`
    });
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
    addAuditEvent({
      actor: 'Pharma',
      action: 'Requested Dataset',
      scope: dataset.name,
      details: `Dataset: ${dataset.name}, Price: $${dataset.price}`
    });
  };

  const handlePackagingComplete = (dataset) => {
    setShowPackagingModal(false);
    addToast('Dataset request submitted successfully', 'success');
  };

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'onboarding':
        return <OnboardingScreen />;
      case 'dashboard':
        return <PatientDashboard 
          user={user}
          onNavigate={setCurrentScreen}
        />;
      case 'doctor':
        return <DoctorViewScreen onViewCase={handleDoctorViewCase} sharedFiles={userData.files} />;
      case 'files':
        return <FilesScreen />;
      case 'pharma':
        return <PharmaViewScreen 
          onRequestDataset={handlePharmaRequestDataset}
        />;
      case 'wallet':
        return <WalletScreen userData={userData} onDataUpdate={handleDataUpdate} />;
      case 'points':
        return <PointsRewardsScreen />;
      case 'settings':
        return <SettingsScreen userData={userData} onDataUpdate={handleDataUpdate} onViewAuditLog={() => setCurrentScreen('audit-log')} onNavigate={setCurrentScreen} />;
      case 'family':
        return <FamilyDashboard />;
      case 'upload':
        return <UploadScreen />;
      case 'chatbot':
        return <HealthChatbot />;
      case 'audit-log':
        return <AuditLogScreen events={auditEvents} />;
      case 'consent-manager':
        return <ConsentManager onConsentToggle={handleConsentToggle} allowResearch={userData.allowResearch} />;
      case 'payouts':
        return <PayoutsScreen userData={userData} />;
      case 'trust-compliance':
        return <TrustComplianceScreen />;
      case 'analytics':
        return <AnalyticsScreen userData={userData} />;
      case 'pricing':
        return <PricingScreen />;
      case 'legal':
        return <LegalScreen />;
      case 'support':
        return <SupportScreen />;
      case 'ai':
        return <AIAssistantScreen />;
      default:
        return <DashboardScreen 
          userData={userData} 
          onDataUpdate={handleDataUpdate} 
          onConsentToggle={handleConsentToggle}
          onNavigate={setCurrentScreen}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Top Bar */}
        <TopBar 
          onInfoClick={() => setShowTrustModal(true)}
        />

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
      
      {/* Bottom Navigation */}
        <BottomNavigation 
          currentScreen={currentScreen} 
          onScreenChange={handleScreenChange}
          currentRole="patient"
        />

      {/* Modals */}
      <TrustPolicyModal 
        isOpen={showTrustModal}
        onClose={() => setShowTrustModal(false)}
      />
      
      <ConsentReceiptModal 
        isOpen={showConsentReceipt} 
        onClose={() => setShowConsentReceipt(false)} 
      />
      
      <PackagingModal 
        isOpen={showPackagingModal} 
        onClose={() => setShowPackagingModal(false)}
        dataset={selectedDataset}
        onComplete={handlePackagingComplete}
      />

      {/* Banners */}
      <PWAInstallBanner />
      <OfflineBanner />

      {/* Demo Mode */}
      <DemoMode 
        onReset={() => {
          setUserData({ balance: 0, files: [], allowResearch: false });
          setAuditEvents([]);
          setToasts([]);
        }}
        onRunScript={() => {
          addToast('Demo script completed', 'success');
        }}
        onShowGuide={() => setShowGuide(true)}
      />

      {/* Demo Guide */}
      {showGuide && (
        <DemoGuide onClose={() => setShowGuide(false)} />
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default MainApp;
