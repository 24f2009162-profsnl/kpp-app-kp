import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Wallet, 
  History, 
  LayoutDashboard, 
  QrCode, 
  Gift, 
  Menu, 
  X,
  User,
  LogOut,
  MessageSquare,
  Bell,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Earn from './pages/Earn';
import Pay from './pages/Pay';
import TransactionHistory from './pages/History';
import Profile from './pages/Profile';
import Forum from './pages/Forum';
import Leaderboard from './pages/Leaderboard';

// Store
import { ErrorBoundary } from './components/ErrorBoundary';
import { useStore } from './services/store';
import { signInWithGoogle } from './services/firebase';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { state, login, logout, toggleDarkMode, markNotificationRead, unlockApp } = useStore();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [studentIdInput, setStudentIdInput] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [appLockInput, setAppLockInput] = useState('');
  const [appLockError, setAppLockError] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [isConfigLoading, setIsConfigLoading] = useState(true);

  useEffect(() => {
    // Simulate config check
    const timer = setTimeout(() => setIsConfigLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.isDarkMode]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentIdInput.trim()) {
      login(studentIdInput);
      setShowLoginModal(false);
      setStudentIdInput('');
    }
  };

  const unreadCount = state.notifications.filter(n => !n.read).length;

  return (
    <ErrorBoundary>
      <Router>
        <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white transition-colors duration-300`}>
        
        <AnimatePresence>
          {state.appLockPassword && state.isAppLocked && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950 p-4"
            >
              <div className="w-full max-w-md space-y-8 text-center">
                <div className="mx-auto h-20 w-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl">
                  <Lock size={40} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-white">App Locked</h2>
                  <p className="text-slate-400 font-medium">Enter your password to continue</p>
                </div>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (unlockApp(appLockInput)) {
                      setAppLockInput('');
                      setAppLockError(false);
                    } else {
                      setAppLockError(true);
                    }
                  }}
                  className="space-y-4"
                >
                  <input 
                    type="password" 
                    value={appLockInput}
                    onChange={(e) => setAppLockInput(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full rounded-2xl bg-white/10 p-5 text-center text-2xl font-black text-white outline-none border-2 transition-all ${appLockError ? 'border-red-500 animate-shake' : 'border-transparent focus:border-indigo-500'}`}
                  />
                  <button 
                    type="submit"
                    className="w-full rounded-2xl bg-indigo-600 py-5 font-black text-white shadow-xl hover:bg-indigo-700 transition-all"
                  >
                    Unlock App
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                  <Wallet size={28} />
                </div>
                <div className="leading-tight">
                  <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">KPP</span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Campus Wallet</p>
                </div>
              </div>

              <div className="hidden md:block">
                <div className="flex items-center gap-8">
                  <NavLink to="/">Dashboard</NavLink>
                  <NavLink to="/earn">Earn</NavLink>
                  <NavLink to="/pay">Pay</NavLink>
                  <NavLink to="/forum">Forum</NavLink>
                  <NavLink to="/leaderboard">Leaderboard</NavLink>
                  <NavLink to="/history">History</NavLink>
                  
                  {state.studentId ? (
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowNotifications(!showNotifications);
                          }}
                          className={`relative p-2 rounded-xl transition-all cursor-pointer select-none touch-manipulation ${showNotifications ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`}
                        >
                          <Bell size={22} />
                          {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-black text-white flex items-center justify-center border-2 border-white dark:border-slate-900">
                              {unreadCount}
                            </span>
                          )}
                        </button>

                        <AnimatePresence>
                          {showNotifications && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute right-0 mt-4 w-80 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden z-50"
                            >
                              <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Notifications</h3>
                                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg uppercase">{unreadCount} New</span>
                              </div>
                              <div className="max-h-96 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
                                {state.notifications.length > 0 ? state.notifications.map(n => (
                                  <div 
                                    key={n.id} 
                                    onClick={() => markNotificationRead(n.id)}
                                    className={`p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${!n.read ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                                  >
                                    <div className="flex gap-3">
                                      <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${n.type === 'success' ? 'bg-green-500' : n.type === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                                      <div className="space-y-1">
                                        <p className="text-xs font-black text-slate-900 dark:text-white">{n.title}</p>
                                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{n.message}</p>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pt-1">{n.date}</p>
                                      </div>
                                    </div>
                                  </div>
                                )) : (
                                  <div className="p-12 text-center text-slate-400 font-bold text-sm">No notifications yet</div>
                                )}
                              </div>
                              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 text-center">
                                <button 
                                  onClick={() => {
                                    setShowNotifications(false);
                                    setShowAllNotifications(true);
                                  }}
                                  className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline"
                                >
                                  View All Notifications
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <Link to="/profile" className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-indigo-200 transition-all group">
                        <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-100 dark:shadow-none group-hover:scale-105 transition-transform">
                          {state.studentId.slice(0, 2)}
                        </div>
                        <div className="leading-tight">
                          <p className="text-xs font-black text-slate-900 dark:text-white">{state.studentId}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Student Profile</p>
                        </div>
                      </Link>
                    </div>
                  ) : (
                    <button onClick={() => setShowLoginModal(true)} className="rounded-2xl bg-indigo-600 px-8 py-3.5 text-sm font-black text-white shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95">
                      Student Sign In
                    </button>
                  )}
                </div>
              </div>

              <div className="md:hidden flex items-center gap-4">
                {state.studentId && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowNotifications(!showNotifications);
                    }} 
                    className="relative text-slate-400 p-2 cursor-pointer select-none touch-manipulation"
                  >
                    <Bell size={24} />
                    {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />}
                  </button>
                )}
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="rounded-xl p-2 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800">
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 md:hidden overflow-hidden">
                <div className="space-y-1 px-4 py-4">
                  <MobileNavLink to="/" onClick={() => setIsMenuOpen(false)}>Dashboard</MobileNavLink>
                  <MobileNavLink to="/earn" onClick={() => setIsMenuOpen(false)}>Earn</MobileNavLink>
                  <MobileNavLink to="/pay" onClick={() => setIsMenuOpen(false)}>Pay</MobileNavLink>
                  <MobileNavLink to="/forum" onClick={() => setIsMenuOpen(false)}>Forum</MobileNavLink>
                  <MobileNavLink to="/leaderboard" onClick={() => setIsMenuOpen(false)}>Leaderboard</MobileNavLink>
                  <MobileNavLink to="/history" onClick={() => setIsMenuOpen(false)}>History</MobileNavLink>
                  <MobileNavLink to="/profile" onClick={() => setIsMenuOpen(false)}>Profile</MobileNavLink>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={state.studentId ? <Dashboard /> : <Landing />} />
            <Route path="/earn" element={state.studentId ? <Earn /> : <Navigate to="/" />} />
            <Route path="/pay" element={state.studentId ? <Pay /> : <Navigate to="/" />} />
            <Route path="/forum" element={state.studentId ? <Forum /> : <Navigate to="/" />} />
            <Route path="/leaderboard" element={state.studentId ? <Leaderboard /> : <Navigate to="/" />} />
            <Route path="/history" element={state.studentId ? <TransactionHistory /> : <Navigate to="/" />} />
            <Route path="/profile" element={state.studentId ? <Profile /> : <Navigate to="/" />} />
          </Routes>
        </main>

        {/* All Notifications Modal */}
        <AnimatePresence>
          {showAllNotifications && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-2xl rounded-[3rem] bg-white dark:bg-slate-900 p-8 shadow-2xl max-h-[80vh] flex flex-col"
              >
                <div className="flex justify-between items-center mb-8 shrink-0">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">All Notifications</h2>
                  <button onClick={() => setShowAllNotifications(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={24} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {state.notifications.map(n => (
                    <div 
                      key={n.id}
                      className={`p-6 rounded-3xl border transition-all ${!n.read ? 'bg-indigo-50/30 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'}`}
                    >
                      <div className="flex gap-4">
                        <div className={`mt-1 h-3 w-3 rounded-full shrink-0 ${n.type === 'success' ? 'bg-green-500' : n.type === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-4">
                            <h4 className="font-black text-slate-900 dark:text-white">{n.title}</h4>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{n.date}</span>
                          </div>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{n.message}</p>
                          {!n.read && (
                            <button 
                              onClick={() => markNotificationRead(n.id)}
                              className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline"
                            >
                              Mark as Read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {state.notifications.length === 0 && (
                    <div className="py-20 text-center text-slate-400 font-bold">
                      No notifications to show.
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showLoginModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Student Sign In</h2>
                  <button onClick={() => {
                    setShowLoginModal(false);
                    setLoginError(null);
                  }} className="text-slate-400"><X size={24} /></button>
                </div>

                {loginError && (
                  <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-bold flex items-start gap-3">
                    <div className="mt-0.5"><X size={16} /></div>
                    <p>{loginError}</p>
                  </div>
                )}
                <form onSubmit={handleLogin} className="space-y-4">
                  <input type="text" required placeholder="e.g. ME21B001" value={studentIdInput} onChange={(e) => setStudentIdInput(e.target.value)} className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-4 px-6 outline-none focus:border-indigo-500 dark:text-white" />
                  <button type="submit" className="w-full rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-200 dark:shadow-none">Enter Campus Wallet</button>
                  
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-100 dark:border-slate-800" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase font-black text-slate-400 tracking-widest">
                      <span className="bg-white dark:bg-slate-900 px-4">Or</span>
                    </div>
                  </div>

                  <button 
                    type="button"
                    disabled={isSigningIn}
                    onClick={async () => {
                      if (isSigningIn) return;
                      setIsSigningIn(true);
                      setLoginError(null);
                      try {
                        const user = await signInWithGoogle();
                        if (user) {
                          login(user.displayName || user.email || 'Student');
                          setShowLoginModal(false);
                        }
                      } catch (e: any) {
                        console.error('Google sign in failed:', e);
                        setLoginError(e.message || 'Google sign in failed. Please try again.');
                      } finally {
                        setIsSigningIn(false);
                      }
                    }}
                    className={`w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 font-bold text-slate-700 dark:text-white shadow-sm transition-all ${isSigningIn ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
                    {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Router>
  </ErrorBoundary>
  );
}

function WelcomeHero({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="py-12 sm:py-24 text-center">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">Turn Student Life into an <span className="text-indigo-600">On-Chain Economy.</span></h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">Earn rewards, split bills, and pay for campus services using Stellar micro-payments.</p>
        <button onClick={onSignIn} className="rounded-2xl bg-indigo-600 px-10 py-5 text-lg font-bold text-white shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all">Get Started</button>
      </motion.div>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`text-sm font-bold transition-colors hover:text-indigo-600 ${isActive ? 'text-indigo-600' : 'text-slate-500 dark:text-slate-400'}`}>{children}</Link>
  );
}

function MobileNavLink({ to, children, onClick }: { to: string; children: React.ReactNode; onClick: () => void }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} onClick={onClick} className={`block rounded-2xl px-4 py-3 text-base font-bold ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-slate-600 dark:text-slate-400'}`}>{children}</Link>
  );
}
