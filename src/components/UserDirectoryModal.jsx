import React, { useState } from 'react';
import { X, Users, Search, Trash2, ShieldCheck, Download, UserCheck, BarChart3, Filter } from 'lucide-react';
import { useData } from '../context/DataContext';

export const UserDirectoryModal = ({ isOpen, onClose }) => {
  const { registeredUsers, removeRegisteredUser, allMaterials } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  if (!isOpen) return null;

  const totalDownloads = (allMaterials || []).reduce((sum, m) => sum + (m.downloads || 0), 0);
  const studentCount = (registeredUsers || []).filter(u => u.role !== 'admin').length;
  const adminCount = (registeredUsers || []).filter(u => u.role === 'admin').length;

  const filteredUsers = (registeredUsers || []).filter(u => {
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const matchName = (u.name || '').toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      const matchReg = (u.registerNumber || '').toLowerCase().includes(q);
      const matchClass = (u.classSection || '').toLowerCase().includes(q);
      const matchYear = (u.year || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchReg && !matchClass && !matchYear) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Registered User Directory & Analytics</h3>
              <p className="text-xs text-slate-400">Monitor student logins, registration details, & manage user accounts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Users</span>
              <p className="text-2xl font-extrabold text-white">{(registeredUsers || []).length}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Students</span>
              <p className="text-2xl font-extrabold text-brand-400">{studentCount}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Admins</span>
              <p className="text-2xl font-extrabold text-emerald-400">{adminCount}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Downloads</span>
              <p className="text-2xl font-extrabold text-amber-400">{totalDownloads}</p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student name, email, register number, or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-950 text-xs text-white placeholder-slate-400 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 shadow-inner"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center space-x-1 self-stretch sm:self-auto">
              {['All', 'student', 'admin'].map(r => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                    roleFilter === r
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {r === 'All' ? 'All Roles' : `${r}s`}
                </button>
              ))}
            </div>
          </div>

          {/* Users List Table / Cards */}
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2 bg-slate-950/60 rounded-3xl border border-slate-800">
              <Users className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold">No registered users matched your search filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map(usr => {
                const isUserAdmin = usr.role === 'admin';

                return (
                  <div 
                    key={usr.uid || usr.email} 
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all shadow-sm"
                  >
                    {/* User Info */}
                    <div className="flex items-start space-x-3.5 min-w-0">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-base flex-shrink-0 shadow-md ${
                        isUserAdmin ? 'bg-emerald-600' : 'bg-brand-600'
                      }`}>
                        {usr.name ? usr.name.charAt(0).toUpperCase() : 'U'}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <h5 className="font-bold text-sm text-white truncate">{usr.name || 'Student Account'}</h5>
                          <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            isUserAdmin 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                              : 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                          }`}>
                            {isUserAdmin ? 'Administrator' : 'Student'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400">{usr.email}</p>

                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                          {usr.registerNumber && (
                            <span className="font-mono text-indigo-300 bg-indigo-950/60 px-2.5 py-0.5 rounded border border-indigo-500/30">
                              Reg No: {usr.registerNumber}
                            </span>
                          )}
                          {!isUserAdmin && (
                            <span className="text-slate-300 bg-slate-900 px-2.5 py-0.5 rounded border border-slate-800">
                              {usr.year || '3rd Year'} • Sem {usr.semester || 5} ({usr.classSection || 'IT-A'})
                            </span>
                          )}
                          {usr.registeredDate && (
                            <span className="text-slate-400 bg-slate-900 px-2.5 py-0.5 rounded border border-slate-800">
                              Joined: {usr.registeredDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3 self-end sm:self-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 hidden md:inline-block">
                        ● Active Account
                      </span>

                      <button
                        onClick={() => {
                          const confirmMsg = `Are you sure you want to remove user "${usr.name}" (${usr.email})?\n\nThis will revoke their account login access.`;
                          if (window.confirm(confirmMsg)) {
                            removeRegisteredUser(usr.uid || usr.email);
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-white bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/40 transition-all flex items-center space-x-1.5 shadow"
                        title="Delete user account from system"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove User</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
