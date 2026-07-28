import React, { useState } from 'react';
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

import { Home } from './pages/Home';
import { MaterialsLibrary } from './pages/MaterialsLibrary';
import { AIToolsHub } from './pages/AIToolsHub';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { StudentProfile } from './pages/StudentProfile';
import { LoginRegister } from './pages/LoginRegister';
import { PlacementPrepHub } from './pages/PlacementPrepHub';
import { EventsPage } from './pages/EventsPage';
import { GraduationCap } from 'lucide-react';

const MainAppContent = () => {
  const { currentUser, loading } = useAuth();
  
  const [activeTab, setActiveTab] = useState('home');
  const [previewMaterial, setPreviewMaterial] = useState(null);
  
  // Phase 2 & 3 Modal States
  const [suggestionModalOpen, setSuggestionModalOpen] = useState(false);
  const [shareExperienceModalOpen, setShareExperienceModalOpen] = useState(false);
  const [uploadNoteModalOpen, setUploadNoteModalOpen] = useState(false);
  const [userDirectoryModalOpen, setUserDirectoryModalOpen] = useState(false);
  const [eventDetailModalState, setEventDetailModalState] = useState({ isOpen: false, event: null });
  const [reportModalState, setReportModalState] = useState({ isOpen: false, material: null });
  const [versionHistoryState, setVersionHistoryState] = useState({ isOpen: false, type: null, item: null });
  const [adminManagementState, setAdminManagementState] = useState({ isOpen: false, initialTab: 'suggestions' });

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

  const openAdminManagement = (initialTab = 'suggestions') => {
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Top Header Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onOpenAdminManagement={openAdminManagement}
        onOpenUserDirectory={() => setUserDirectoryModalOpen(true)}
        onOpenSuggestionModal={() => setSuggestionModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {activeTab === 'home' && (
          <Home 
            onNavigate={(tab) => setActiveTab(tab)} 
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



        {activeTab === 'announcements' && (
          <AnnouncementsPage 
            onOpenAdminForm={openAdminForm} 
            onPreviewMaterial={(mat) => setPreviewMaterial(mat)} 
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
