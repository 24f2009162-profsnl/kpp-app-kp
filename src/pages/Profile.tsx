import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Wallet, 
  Shield, 
  Moon, 
  Sun, 
  LogOut, 
  Copy, 
  Check,
  ChevronRight,
  Award,
  Lock,
  Smartphone,
  Camera,
  RefreshCw,
  Layout,
  X,
  History,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { useStore } from '../services/store';

const CUTE_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Buddy',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Cookie',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Daisy',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ginger',
];

export default function Profile() {
  const { state, logout, toggleDarkMode, updateAvatar, setup2FA, disable2FA, setAppLock, disableAppLock } = useStore();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showAppLockModal, setShowAppLockModal] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [twoFactorStep, setTwoFactorStep] = useState<'intro' | 'qr' | 'verify'>('intro');
  const [verificationCode, setVerificationCode] = useState('');
  const [appLockPassword, setAppLockPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const webcamRef = useRef<Webcam>(null);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(state.kppId || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAvatarSelect = (url: string) => {
    updateAvatar(url);
    setShowAvatarModal(false);
  };

  const handleCapture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      updateAvatar(imageSrc);
      setIsCameraActive(false);
      setShowAvatarModal(false);
    }
  };

  const userAwards = state.posts
    .filter(p => p.authorId === state.studentId)
    .reduce((acc, post) => [...acc, ...(post.awards || [])], [] as string[]);

  const AWARDS_ICONS: Record<string, string> = {
    'Helpful': '🌟',
    'Creative': '🎨',
    'Stellar': '🚀',
    'Friendly': '🤝',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 min-h-screen moon-arc-container p-8 rounded-[3rem] relative overflow-hidden">
      {/* Decorative Arcs */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[120%] aspect-square rounded-full border border-indigo-500/10 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[120%] aspect-square rounded-full border border-blue-500/10 pointer-events-none" />

      <header className="flex flex-col md:flex-row items-center gap-8 glass-card p-10 rounded-[3rem] relative z-10">
        <div className="relative group">
          <div className="h-40 w-40 rounded-[3rem] bg-indigo-600 overflow-hidden flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-indigo-500/20">
            {state.avatar ? (
              <img src={state.avatar} alt="Avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              state.studentId?.slice(0, 2)
            )}
          </div>
          <button 
            onClick={() => setShowAvatarModal(true)}
            className="absolute -bottom-2 -right-2 h-12 w-12 rounded-2xl bg-indigo-600 border-4 border-slate-950 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
          >
            <Camera size={24} />
          </button>
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter">{state.studentId}</h1>
            <p className="text-indigo-400 font-black uppercase text-xs tracking-widest">Verified Student</p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">KPP ID:</span>
              <code className="text-sm font-mono text-indigo-400">{state.kppId?.slice(0, 12)}...</code>
              <button onClick={copyToClipboard} className="text-slate-500 hover:text-white transition-colors">
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            {state.badges.map(badge => (
              <span key={badge} className="px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-400/20">
                {badge}
              </span>
            ))}
            {userAwards.map((award, i) => (
              <span key={i} title={award} className="px-3 py-1 rounded-full bg-indigo-400/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-400/20 flex items-center gap-1">
                {AWARDS_ICONS[award] || '🏆'} {award}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Security & Settings */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              <Shield size={24} />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Security & Widgets</h2>
          </div>

          <div className="space-y-3">
            <div onClick={() => setShow2FAModal(true)}>
              <SettingItem 
                icon={<Smartphone size={20} />} 
                label="Two-Factor Auth" 
                value={state.is2FAEnabled ? "Enabled" : "Disabled"} 
                active={state.is2FAEnabled}
              />
            </div>
            <div onClick={() => setShowAppLockModal(true)}>
              <SettingItem 
                icon={<Lock size={20} />} 
                label="App Lock" 
                value={state.appLockPassword ? "Enabled" : "Disabled"} 
                active={!!state.appLockPassword}
              />
            </div>
            <SettingItem 
              icon={<Layout size={20} />} 
              label="Dashboard Widgets" 
              value="Customized" 
            />
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={toggleDarkMode}
                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <div className="flex items-center gap-3">
                  {state.isDarkMode ? <Moon size={20} className="text-indigo-600" /> : <Sun size={20} className="text-amber-500" />}
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {state.isDarkMode ? 'Dark Mode' : 'Light Mode'}
                  </span>
                </div>
                <div className={`h-6 w-12 rounded-full p-1 transition-colors ${state.isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                  <div className={`h-4 w-4 rounded-full bg-white transition-transform ${state.isDarkMode ? 'translate-x-6' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <Award size={24} />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Achievements</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Streak</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{state.loginStreak} Days</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Referrals</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{state.referrals}</p>
            </div>
          </div>

          {state.pastUsernames.length > 0 && (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <History size={16} className="text-slate-400" />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Past Usernames</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {state.pastUsernames.map((name, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-500 border border-slate-100 dark:border-slate-700">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <button 
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          await logout();
          navigate('/');
        }}
        className="w-full py-6 rounded-[2rem] bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-black flex items-center justify-center gap-3 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all active:scale-95 select-none touch-manipulation"
      >
        <LogOut size={24} /> Sign Out from KPP
      </button>

      {/* 2FA Modal */}
      <AnimatePresence>
        {show2FAModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-[3rem] bg-white dark:bg-slate-900 p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Two-Factor Auth</h2>
                <button onClick={() => setShow2FAModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              {state.is2FAEnabled ? (
                <div className="space-y-6 text-center">
                  <div className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Check size={40} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">2FA is Active</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Your account is protected with Google Authenticator.</p>
                  </div>
                  <button 
                    onClick={() => {
                      disable2FA();
                      setShow2FAModal(false);
                    }}
                    className="w-full py-4 rounded-2xl bg-red-50 text-red-600 font-black hover:bg-red-100 transition-all"
                  >
                    Disable 2FA
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {twoFactorStep === 'intro' && (
                    <div className="space-y-6">
                      <p className="text-slate-500 dark:text-slate-400 font-medium">Add an extra layer of security to your account using Google Authenticator.</p>
                      <button 
                        onClick={() => setTwoFactorStep('qr')}
                        className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-all"
                      >
                        Get Started
                      </button>
                    </div>
                  )}
                  {twoFactorStep === 'qr' && (
                    <div className="space-y-6 text-center">
                      <div className="p-4 bg-white rounded-3xl inline-block shadow-inner">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/KPP:User?secret=JBSWY3DPEHPK3PXP&issuer=KPP" alt="QR Code" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-black text-slate-900 dark:text-white">Scan this QR code</p>
                        <p className="text-xs text-slate-500">Open Google Authenticator and scan the code above.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Secret Key</p>
                        <p className="font-mono font-bold text-slate-700 dark:text-slate-300">JBSW Y3DP EHPK 3PXP</p>
                      </div>
                      <button 
                        onClick={() => setTwoFactorStep('verify')}
                        className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-all"
                      >
                        I've Scanned It
                      </button>
                    </div>
                  )}
                  {twoFactorStep === 'verify' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Verification Code</label>
                        <input 
                          type="text" 
                          maxLength={6}
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          placeholder="000000"
                          className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 p-5 text-center text-3xl font-black tracking-[0.5em] outline-none border-2 border-transparent focus:border-indigo-500 dark:text-white"
                        />
                      </div>
                      <button 
                        onClick={() => {
                          if (verificationCode.length === 6) {
                            setup2FA('JBSWY3DPEHPK3PXP');
                            setShow2FAModal(false);
                            setTwoFactorStep('intro');
                            setVerificationCode('');
                          }
                        }}
                        disabled={verificationCode.length !== 6}
                        className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-all disabled:opacity-30"
                      >
                        Verify & Enable
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* App Lock Modal */}
      <AnimatePresence>
        {showAppLockModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-[3rem] bg-white dark:bg-slate-900 p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">App Lock</h2>
                <button onClick={() => setShowAppLockModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              {state.appLockPassword ? (
                <div className="space-y-6 text-center">
                  <div className="mx-auto h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Lock size={40} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">App Lock is Active</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Your app is protected with a password.</p>
                  </div>
                  <button 
                    onClick={() => {
                      disableAppLock();
                      setShowAppLockModal(false);
                    }}
                    className="w-full py-4 rounded-2xl bg-red-50 text-red-600 font-black hover:bg-red-100 transition-all"
                  >
                    Disable App Lock
                  </button>
                </div>
              ) : (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (appLockPassword !== confirmPassword) {
                      setPasswordError('Passwords do not match');
                      return;
                    }
                    if (appLockPassword.length < 4) {
                      setPasswordError('Password must be at least 4 characters');
                      return;
                    }
                    setAppLock(appLockPassword);
                    setShowAppLockModal(false);
                    setAppLockPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                  }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">New Password</label>
                      <input 
                        type="password" 
                        required
                        value={appLockPassword}
                        onChange={(e) => setAppLockPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 font-bold outline-none border border-slate-100 dark:border-slate-700 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Confirm Password</label>
                      <input 
                        type="password" 
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 font-bold outline-none border border-slate-100 dark:border-slate-700 dark:text-white"
                      />
                    </div>
                    {passwordError && <p className="text-xs font-bold text-red-500">{passwordError}</p>}
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-all"
                  >
                    Enable App Lock
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Avatar Modal */}
      <AnimatePresence>
        {showAvatarModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-[3rem] bg-white dark:bg-slate-900 p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Choose Avatar</h2>
                <button onClick={() => setShowAvatarModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              {isCameraActive ? (
                <div className="space-y-6 text-center">
                  <div className="aspect-square rounded-3xl bg-slate-900 flex items-center justify-center text-white overflow-hidden relative">
                    {/* @ts-ignore */}
                    <Webcam
                      audio={false}
                      ref={webcamRef as any}
                      screenshotFormat="image/jpeg"
                      className="h-full w-full object-cover"
                      videoConstraints={{ facingMode: 'user' }}
                    />
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={handleCapture}
                      className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-black"
                    >
                      Capture Photo
                    </button>
                    <button 
                      onClick={() => setIsCameraActive(false)}
                      className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-3 gap-4">
                    {CUTE_AVATARS.map((url, i) => (
                      <button 
                        key={i}
                        onClick={() => handleAvatarSelect(url)}
                        className="aspect-square rounded-2xl overflow-hidden border-4 border-transparent hover:border-indigo-600 transition-all"
                      >
                        <img src={url} alt={`Avatar ${i}`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-100 dark:border-slate-800" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase font-black text-slate-400 tracking-widest">
                      <span className="bg-white dark:bg-slate-900 px-4">Or</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsCameraActive(true)}
                    className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-black hover:bg-slate-100 transition-all"
                  >
                    <Camera size={24} /> Use Camera
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SettingItem({ icon, label, value, active }: { icon: React.ReactNode; label: string; value: string; active?: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className="text-slate-400 group-hover:text-indigo-600 transition-colors">
          {icon}
        </div>
        <span className="font-bold text-slate-700 dark:text-slate-300">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-black uppercase tracking-widest ${active ? 'text-green-500' : 'text-slate-400'}`}>{value}</span>
        <ChevronRight size={16} className="text-slate-300" />
      </div>
    </div>
  );
}
