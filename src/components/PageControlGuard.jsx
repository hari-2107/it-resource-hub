import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PageStatusScreen } from './PageStatusScreen';
import { AlertTriangle, Lock, EyeOff, ShieldAlert, Info } from 'lucide-react';

export const PageControlGuard = ({ 
  pageId, 
  children, 
  onGoHome 
}) => {
  const { pageControls } = useData();
  const { currentUser } = useAuth();

  const ctrl = pageControls ? pageControls[pageId] : null;
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'faculty';

  // If no specific page control defined, render normally
  if (!ctrl) {
    return <>{children}</>;
  }

  // 1. Scheduled Maintenance Check (Automated Time Window)
  const now = new Date().getTime();
  let effectiveStatus = ctrl.status || 'live';

  if (ctrl.scheduledStartTime && ctrl.scheduledEndTime) {
    const start = new Date(ctrl.scheduledStartTime).getTime();
    const end = new Date(ctrl.scheduledEndTime).getTime();

    if (now >= start && now <= end) {
      effectiveStatus = 'maintenance';
    } else if (now > end && ctrl.status === 'maintenance') {
      effectiveStatus = 'live'; // Automatically returns to live mode after scheduled end!
    }
  }

  // 2. Audience / Role Target Check
  const checkRoleAccess = () => {
    if (isAdmin) return true; // Admin bypasses audience restrictions
    const target = ctrl.roleTarget || 'everyone';
    
    switch (target) {
      case 'admins_only':
        return false;
      case 'students_only':
        return currentUser?.role === 'student' || !currentUser;
      case 'year_3':
        return currentUser?.year === '3rd Year';
      case 'year_4':
        return currentUser?.year === '4th Year';
      case 'sec_ita':
        return currentUser?.classSection === 'IT-A';
      case 'placement_eligible':
        return (currentUser?.cgpa || 7.5) >= 6.0;
      default:
        return true;
    }
  };

  const hasRoleAccess = checkRoleAccess();

  // 3. Status Evaluator
  if (effectiveStatus === 'hidden' && !isAdmin) {
    return <PageStatusScreen customStatus="hidden" pageControl={ctrl} onGoHome={onGoHome} />;
  }

  if (!hasRoleAccess) {
    const customType = (ctrl.roleTarget === 'admins_only') ? 'admin_only' : 'student_restricted';
    return <PageStatusScreen customStatus={customType} pageControl={ctrl} onGoHome={onGoHome} />;
  }

  // 4. Handle Lock & Maintenance Statuses
  if (effectiveStatus === 'maintenance' || effectiveStatus === 'coming_soon' || effectiveStatus === 'closed') {
    if (ctrl.displayMode === 'banner_mode' && !isAdmin) {
      // Banner Mode: Render warning banner + page content
      return (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-300 flex items-start space-x-3 shadow-lg">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold block text-sm">{ctrl.title || '🚧 Maintenance Notice'}</span>
              <p className="text-slate-300 mt-1">{ctrl.message || 'This page is undergoing maintenance, but you can continue using available features.'}</p>
            </div>
          </div>
          {children}
        </div>
      );
    }

    if (ctrl.displayMode === 'read_only' && !isAdmin) {
      // Read Only Mode: Render banner + disabled non-interactive content
      return (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 text-xs text-indigo-300 flex items-start space-x-3 shadow-lg">
            <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold block text-sm">{ctrl.title || '🔒 Read-Only Mode Active'}</span>
              <p className="text-slate-300 mt-1">{ctrl.message || 'You can view content on this page, but interactive submissions and modifications are currently locked.'}</p>
            </div>
          </div>
          <div className="pointer-events-none opacity-80 select-none">
            {children}
          </div>
        </div>
      );
    }

    // Default Full Lock: Show status screen
    return <PageStatusScreen customStatus={effectiveStatus} pageControl={ctrl} onGoHome={onGoHome} />;
  }

  // Live Mode
  return <>{children}</>;
};
