import React, { useState } from 'react';
import { X, ShieldCheck, KeyRound, Smartphone, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'OWNER' | 'ADMIN';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultTab = 'OWNER' }) => {
  const { login, loginWithOtp } = useAuth();
  const [activeTab, setActiveTab] = useState<'OWNER' | 'ADMIN'>(defaultTab);

  // Owner OTP states
  const [ownerLoginMode, setOwnerLoginMode] = useState<'OTP' | 'PASSWORD'>('OTP');
  const [siteNumber, setSiteNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpStep, setOtpStep] = useState<'REQUEST' | 'VERIFY'>('REQUEST');
  const [otpCode, setOtpCode] = useState('');
  const [otpHint, setOtpHint] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');

  // Password login states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Status & Error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.requestOwnerOtp(siteNumber, mobileNumber);
      setOtpStep('VERIFY');
      setOtpHint(res.demoCodeHint || '123456');
      setMaskedPhone(res.maskedMobile || mobileNumber);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch OTP. Please verify Site No. and Mobile No.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithOtp(siteNumber, mobileNumber, otpCode);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ username, password });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Quick Fill Demo Helpers
  const fillDemoOwner = () => {
    setActiveTab('OWNER');
    setOwnerLoginMode('OTP');
    setSiteNumber('125');
    setMobileNumber('9876543210');
    setOtpStep('REQUEST');
    setOtpCode('');
    setError(null);
  };

  const fillDemoAdmin = (role: 'admin' | 'treasurer' | 'secretary') => {
    setActiveTab('ADMIN');
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else if (role === 'treasurer') {
      setUsername('treasurer');
      setPassword('treasurer123');
    } else {
      setUsername('secretary');
      setPassword('secretary123');
    }
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden relative">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-6 pb-4 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-700 flex items-center justify-center text-emerald-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Upkar Gardens Portal</h3>
              <p className="text-xs text-emerald-200">Owners Association Secure Access</p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-emerald-950/60 p-1 rounded-lg mt-5 border border-emerald-800/60">
            <button
              onClick={() => { setActiveTab('OWNER'); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'OWNER' ? 'bg-white text-emerald-950 shadow-sm' : 'text-emerald-200 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Resident Owner</span>
            </button>
            <button
              onClick={() => { setActiveTab('ADMIN'); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'ADMIN' ? 'bg-white text-emerald-950 shadow-sm' : 'text-emerald-200 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Committee / Admin</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'OWNER' ? (
            <div>
              {/* Owner Sub Mode Selector */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 text-xs">
                <span className="font-medium text-slate-600">Select Authentication Method:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setOwnerLoginMode('OTP'); setOtpStep('REQUEST'); setError(null); }}
                    className={`font-semibold cursor-pointer ${ownerLoginMode === 'OTP' ? 'text-emerald-700 underline' : 'text-slate-500'}`}
                  >
                    Mobile OTP
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => { setOwnerLoginMode('PASSWORD'); setError(null); }}
                    className={`font-semibold cursor-pointer ${ownerLoginMode === 'PASSWORD' ? 'text-emerald-700 underline' : 'text-slate-500'}`}
                  >
                    Password
                  </button>
                </div>
              </div>

              {ownerLoginMode === 'OTP' ? (
                otpStep === 'REQUEST' ? (
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Site / Plot Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 125 or 42"
                        value={siteNumber}
                        onChange={(e) => setSiteNumber(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Registered Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">+91</span>
                        <input
                          type="tel"
                          placeholder="10-digit mobile number"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          required
                          className="w-full pl-12 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Mobile number must match association records for this site.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <span>Checking records...</span>
                      ) : (
                        <>
                          <Smartphone className="w-4 h-4" />
                          <span>Get Verification Code (OTP)</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900">
                      <div className="font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>OTP dispatched to {maskedPhone}</span>
                      </div>
                      <p className="mt-1 text-slate-600">
                        For demo testing, enter code: <strong className="font-mono text-emerald-800 font-bold">{otpHint}</strong>
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Enter 6-Digit OTP Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        required
                        autoFocus
                        className="w-full text-center text-lg tracking-widest font-mono font-bold px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? <span>Verifying...</span> : <span>Verify & Access Portal</span>}
                    </button>

                    <button
                      type="button"
                      onClick={() => setOtpStep('REQUEST')}
                      className="w-full text-center text-xs text-slate-500 hover:text-slate-800 cursor-pointer pt-1"
                    >
                      ← Change Site Number or Mobile
                    </button>
                  </form>
                )
              ) : (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Username / Site Login ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. owner125"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <span>Authenticating...</span> : <span>Log In to Owner Portal</span>}
                  </button>
                </form>
              )}

              {/* 1-Click Demo Owner Access */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Instant Demo Resident Test:
                </span>
                <button
                  type="button"
                  onClick={fillDemoOwner}
                  className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition flex items-center justify-between cursor-pointer"
                >
                  <span>Quick Test: Site 125 (Lokesha M. - Dues Pending)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          ) : (
            <div>
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Admin Username
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. admin or treasurer"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-semibold py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <span>Verifying role...</span> : <span>Access Management Console</span>}
                </button>
              </form>

              {/* 1-Click Committee Test Presets */}
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  1-Click Committee Role Presets:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => fillDemoAdmin('admin')}
                    className="py-1.5 px-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded text-[11px] font-medium transition text-center cursor-pointer border border-slate-200"
                  >
                    President
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAdmin('treasurer')}
                    className="py-1.5 px-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded text-[11px] font-medium transition text-center cursor-pointer border border-slate-200"
                  >
                    Treasurer
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAdmin('secretary')}
                    className="py-1.5 px-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded text-[11px] font-medium transition text-center cursor-pointer border border-slate-200"
                  >
                    Secretary
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
