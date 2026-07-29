import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PDFViewerModal } from './components/PDFViewerModal';
import { AdminFormsModal } from './components/AdminFormsModal';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { StudentSuggestionModal } from './components/StudentSuggestionModal';
import { ReportIssueModal } from './components/ReportIssueModal';
import { AdminManagementModal } from './components/AdminManagementModal';
import { UserDirectoryModal } from './components/UserDirectoryModal';
import { ShareExperienceModal } from './components/ShareExperienceModal';
import { UploadStudentNoteModal } from './components/UploadStudentNoteModal';
import { EventDetailModal } from './components/EventDetailModal';
import { SpecialAnnouncementModal } from './components/SpecialAnnouncementModal';

import { Home } from './pages/Home';
import { MaterialsLibrary } from './pages/MaterialsLibrary';
import { AIToolsHub } from './pages/AIToolsHub';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { StudentProfile } from './pages/StudentProfile';
import { LoginRegister } from './pages/LoginRegister';
import { PlacementPrepHub } from './pages/PlacementPrepHub';
import { EventsPage } from './pages/EventsPage';
import { BrainZonePage } from './pages/BrainZonePage';
import { GraduationCap, ShieldAlert } from 'lucide-react';
import { BroadcastOverlay } from './components/BroadcastOverlay';
import { SignupWelcomeToast } from './components/SignupWelcomeToast';
import { WelcomeBackToast } from './components/WelcomeBackToast';
import { useData } from './context/DataContext';

const MainAppContent = () => {
  const { currentUser, loading, completeWelcomeScreen } = useAuth();
  const { activeBroadcast, dismissBroadcast, siteConfig } = useData();
  const [activeTab, setActiveTab] = useState('home');
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);
  const [showWelcomeBackToast, setShowWelcomeBackToast] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.role === 'student' && currentUser.hasSeenWelcome) {
      const sessionKey = `wb_toast_${currentUser.uid}`;
      const hasShownThisSession = sessionStorage.getItem(sessionKey);
      if (!hasShownThisSession) {
        setShowWelcomeBackToast(true);
      }
    } else {
      setShowWelcomeBackToast(false);
    }
  }, [currentUser]);

  const handleDismissWelcomeBack = () => {
    if (currentUser?.uid) {
      sessionStorage.setItem(`wb_toast_${currentUser.uid}`, 'true');
    }
    setShowWelcomeBackToast(false);
  };

  const handleNavigate = (tab, param = null) => {
    if (tab === 'announcements') {
      setSelectedAnnouncementId(param || null);
    }
    setActiveTab(tab);
  };
  
  // Phase 2 & 3 Modal States
  const [suggestionModalOpen, setSuggestionModalOpen] = useState(false);
  const [shareExperienceModalOpen, setShareExperienceModalOpen] = useState(false);
  const [uploadNoteModalOpen, setUploadNoteModalOpen] = useState(false);
  const [userDirectoryModalOpen, setUserDirectoryModalOpen] = useState(false);
  const [eventDetailModalState, setEventDetailModalState] = useState({ isOpen: false, event: null });
  const [reportModalState, setReportModalState] = useState({ isOpen: false, material: null });
  const [versionHistoryState, setVersionHistoryState] = useState({ isOpen: false, type: null, item: null });
  const [adminManagementState, setAdminManagementState] = useState({ isOpen: false, initialTab: 'dashboard' });
  const [specialAnnouncementModalOpen, setSpecialAnnouncementModalOpen] = useState(false);

  // Admin Form Modal State
  const [adminModalState, setAdminModalState] = useState({
    isOpen: false,
    type: null, // 'material' | 'aitool' | 'announcement' | 'timetable' | 'company' | 'event'
    initialData: null
  });

  const openAdminForm = (type, initialData = null) => {
    setAdminModalState({
      isOpen: true,
      type,
      initialData
    });
  };

  const closeAdminForm = () => {
    setAdminModalState({
      isOpen: false,
      type: null,
      initialData: null
    });
  };

  const openVersionHistory = (type, item) => {
    setVersionHistoryState({ isOpen: true, type, item });
  };

  const openReportModal = (material) => {
    setReportModalState({ isOpen: true, material });
  };

  const openAdminManagement = (initialTab = 'dashboard') => {
    setAdminManagementState({ isOpen: true, initialTab });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <p className="text-sm font-semibold">Loading IT Resource Hub...</p>
      </div>
    );
  }

  // Restrict site access: If not signed in, show Sign In page only!
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
        <header className="py-4 px-6 sm:px-8 border-b border-slate-800/80 glass-panel flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-cyan flex items-center justify-center shadow-lg shadow-brand-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white">IT Resource Hub</span>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Dept of Information Technology</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
            Sign In Required
          </span>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <LoginRegister onLoginSuccess={() => setActiveTab('home')} />
        </main>

        <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-800/60">
          © {new Date().getFullYear()} whitedevilt. All rights reserved.
        </footer>
      </div>
    );
  }

  // Check Maintenance Mode for non-admin users
  const isAdmin = currentUser.role === 'admin';
  if (!isAdmin && siteConfig?.maintenanceMode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-2xl animate-pulse">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="space-y-2 max-w-lg">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">System Under Maintenance</h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            {siteConfig.maintenanceMessage || 'The IT Resource Hub is currently undergoing scheduled maintenance. Please check back shortly.'}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 font-mono">
          Status: Scheduled Maintenance • Dept of Information Technology
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Top Header Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={handleNavigate}
        onOpenAdminManagement={openAdminManagement}
        onOpenUserDirectory={() => setUserDirectoryModalOpen(true)}
        onOpenSuggestionModal={() => setSuggestionModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {activeTab === 'home' && (
          <Home 
            onNavigate={handleNavigate} 
            onPreviewMaterial={(mat) => setPreviewMaterial(mat)} 
          />
        )}

        {activeTab === 'materials' && (
          <MaterialsLibrary 
            onPreviewMaterial={(mat) => setPreviewMaterial(mat)} 
            onOpenAdminForm={openAdminForm}
            onOpenReportModal={openReportModal}
            onOpenVersionHistory={openVersionHistory}
            onOpenSuggestionModal={() => setSuggestionModalOpen(true)}
            onOpenUploadNoteModal={() => setUploadNoteModalOpen(true)}
          />
        )}

        {activeTab === 'aitools' && (
          <AIToolsHub 
            onOpenAdminForm={openAdminForm} 
          />
        )}

        {activeTab === 'placement' && (
          <PlacementPrepHub 
            onOpenAdminForm={openAdminForm}
            onOpenShareExperience={() => setShareExperienceModalOpen(true)}
          />
        )}

        {activeTab === 'events' && (
          <EventsPage 
            onOpenAdminForm={openAdminForm}
            onOpenEventDetail={(event) => setEventDetailModalState({ isOpen: true, event })}
          />
        )}

        {activeTab === 'brainzone' && (
          <BrainZonePage 
            onOpenAdminForm={openAdminForm}
          />
        )}



        {activeTab === 'announcements' && (
          <AnnouncementsPage 
            onOpenAdminForm={openAdminForm}
            onOpenSpecialAnnouncementModal={() => setSpecialAnnouncementModalOpen(true)}
            onPreviewMaterial={(mat) => setPreviewMaterial(mat)} 
            targetAnnouncementId={selectedAnnouncementId}
          />
        )}

        {activeTab === 'profile' && (
          <StudentProfile 
            onPreviewMaterial={(mat) => setPreviewMaterial(mat)} 
            onOpenAdminForm={openAdminForm}
            onOpenAdminManagement={openAdminManagement}
            onOpenUserDirectory={() => setUserDirectoryModalOpen(true)}
          />
        )}

        {activeTab === 'auth' && (
          <LoginRegister 
            onLoginSuccess={() => setActiveTab('home')} 
          />
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* PDF Preview Modal */}
      {previewMaterial && (
        <PDFViewerModal 
          material={previewMaterial} 
          onClose={() => setPreviewMaterial(null)} 
        />
      )}

      {/* Admin Operations Modal */}
      {adminModalState.isOpen && (
        <AdminFormsModal 
          type={adminModalState.type} 
          initialData={adminModalState.initialData} 
          onClose={closeAdminForm} 
        />
      )}

      {/* Student Suggestion Modal */}
      {suggestionModalOpen && (
        <StudentSuggestionModal
          onClose={() => setSuggestionModalOpen(false)}
        />
      )}

      {/* Share Interview Experience Modal */}
      {shareExperienceModalOpen && (
        <ShareExperienceModal
          onClose={() => setShareExperienceModalOpen(false)}
        />
      )}

      {/* Upload Student Peer Notes Modal */}
      {uploadNoteModalOpen && (
        <UploadStudentNoteModal
          onClose={() => setUploadNoteModalOpen(false)}
        />
      )}

      {/* Event Detail Modal */}
      {eventDetailModalState.isOpen && (
        <EventDetailModal
          event={eventDetailModalState.event}
          onClose={() => setEventDetailModalState({ isOpen: false, event: null })}
        />
      )}

      {/* Report Issue Modal */}
      {reportModalState.isOpen && (
        <ReportIssueModal
          material={reportModalState.material}
          onClose={() => setReportModalState({ isOpen: false, material: null })}
        />
      )}

      {/* Version History Modal */}
      {versionHistoryState.isOpen && (
        <VersionHistoryModal
          type={versionHistoryState.type}
          item={versionHistoryState.item}
          onClose={() => setVersionHistoryState({ isOpen: false, type: null, item: null })}
        />
      )}

      {/* Admin Management Modal */}
      {adminManagementState.isOpen && (
        <AdminManagementModal
          key={adminManagementState.initialTab}
          initialTab={adminManagementState.initialTab}
          onClose={() => setAdminManagementState({ isOpen: false, initialTab: 'suggestions' })}
          onOpenAdminForm={openAdminForm}
          onOpenVersionHistory={openVersionHistory}
        />
      )}

      {/* User Directory & Analytics Modal */}
      <UserDirectoryModal
        isOpen={userDirectoryModalOpen}
        onClose={() => setUserDirectoryModalOpen(false)}
      />

      {/* Special Announcement Modal */}
      {specialAnnouncementModalOpen && (
        <SpecialAnnouncementModal
          onClose={() => setSpecialAnnouncementModalOpen(false)}
        />
      )}

      {/* Global Broadcast Announcement Overlay */}
      {currentUser && activeBroadcast && (
        <BroadcastOverlay
          broadcast={activeBroadcast}
          onDismiss={dismissBroadcast}
        />
      )}

      {/* Post-Registration Compact Signup Welcome Toast */}
      {currentUser && currentUser.role === 'student' && !currentUser.hasSeenWelcome && (
        <SignupWelcomeToast
          userName={currentUser.name}
          onDismiss={() => {
            completeWelcomeScreen();
            handleNavigate('home');
          }}
        />
      )}

      {/* Existing Student Login "Welcome Back" Toast */}
      {showWelcomeBackToast && currentUser && (
        <WelcomeBackToast
          userName={currentUser.name}
          onDismiss={handleDismissWelcomeBack}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainAppContent />
      </DataProvider>
    </AuthProvider>
  );
}
