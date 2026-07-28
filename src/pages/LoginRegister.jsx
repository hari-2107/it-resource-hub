import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, User, ArrowRight, Eye, EyeOff, Hash } from 'lucide-react';

export const LoginRegister = ({ onLoginSuccess }) => {
  const { login, register } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Student Fields
  const [formData, setFormData] = useState({
    name: '',
    registerNumber: '',
    year: '3rd Year',
    semester: 5,
    classSection: 'IT-A',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'year') {
      const yearSemMap = { '1st Year': 1, '2nd Year': 3, '3rd Year': 5, '4th Year': 7 };
      setFormData({ ...formData, year: value, semester: yearSemMap[value] || 5 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        if (!formData.email || !formData.email.trim()) {
          throw new Error('Email ID is mandatory for creating an account.');
        }
        if (!formData.password || formData.password.length < 4) {
          throw new Error('Password must be at least 4 characters long.');
        }
        await register(formData);
      } else {
        await login(formData.name || formData.email, formData.password);
      }
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md relative">

        {/* Background glow effects */}
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-accent-cyan/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative glass-panel rounded-3xl p-8 border border-slate-700/80 shadow-2xl">

          {/* Header Branding */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-cyan flex items-center justify-center shadow-xl shadow-brand-500/20">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {isRegister ? 'Create Account' : 'Sign In'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              IT Department Central Resource & Learning Platform
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-900/90 p-1 rounded-2xl border border-slate-800 mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-2 rounded-xl transition-all ${!isRegister
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 py-2 rounded-xl transition-all ${isRegister
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* SIGN IN FIELD (Name / Roll No) */}
            {!isRegister ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Registered Name or Roll No</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2 bg-slate-900/80 text-sm text-slate-100 placeholder-slate-500 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 font-medium"
                  />
                </div>
              </div>
            ) : (
              <>
                {/* REGISTER EXTRA FIELDS */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-9 pr-4 py-2 bg-slate-900/80 text-sm text-slate-100 placeholder-slate-500 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Register Number</label>
                  <div className="relative">
                    <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="registerNumber"
                      required
                      placeholder="Register Number"
                      value={formData.registerNumber}
                      onChange={handleChange}
                      className="w-full pl-9 pr-4 py-2 bg-slate-900/80 text-sm text-slate-100 placeholder-slate-500 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Year</label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-900/80 text-xs text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Class</label>
                    <select
                      name="classSection"
                      value={formData.classSection}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-900/80 text-xs text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                    >
                      <option value="IT-A">Class A</option>
                      <option value="IT-B">Class B</option>
                      <option value="IT-C">Class C</option>
                    </select>
                  </div>
                </div>

                {/* Mandatory Email Field for Registration */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email ID <span className="text-rose-400 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="alex@gmail.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-9 pr-4 py-2 bg-slate-900/80 text-sm text-slate-100 placeholder-slate-500 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Password Field with Show/Hide Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password {isRegister && <span className="text-slate-400 font-normal">(Min 4 characters)</span>}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={4}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-9 pr-10 py-2 bg-slate-900/80 text-sm text-slate-100 placeholder-slate-500 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/30 flex items-center justify-center space-x-2 transition-all mt-6"
            >
              <span>
                {loading
                  ? 'Authenticating...'
                  : isRegister
                    ? 'Complete Registration'
                    : 'Sign In'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
