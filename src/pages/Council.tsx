import React from 'react';
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserCircle2, 
  ArrowRight,
  AlertTriangle,
  Lock,
  Unlock,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../services/store';

export default function Council() {
  const { state, approveTransaction, setCouncilRole, addNotification } = useStore();

  const getStatusColor = (approvals: { secretary: boolean; treasurer: boolean }) => {
    if (approvals.secretary && approvals.treasurer) return 'text-green-500';
    if (approvals.secretary || approvals.treasurer) return 'text-amber-500';
    return 'text-slate-400';
  };

  const handleApprove = (id: string) => {
    if (state.councilRole === 'user') {
      addNotification({
        title: 'Access Denied',
        message: 'You must switch to a Council role to approve transactions.',
        type: 'warning'
      });
      return;
    }
    
    approveTransaction(id, state.councilRole as 'secretary' | 'treasurer');
    addNotification({
      title: 'Approval Signed',
      message: `Successfully signed as Council ${state.councilRole.charAt(0).toUpperCase() + state.councilRole.slice(1)}.`,
      type: 'success'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                  <Shield size={24} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Council Portal</h1>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-bold">Multi-signature Governance & Approvals</p>
            </div>

            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              {(['user', 'secretary', 'treasurer'] as const).map((role) => {
                const isAdmin = state.studentId === 'Twisha' || state.studentId === 'Aditya';
                if (role !== 'user' && !isAdmin) return null;
                
                return (
                  <button
                    key={role}
                    onClick={() => setCouncilRole(role)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      state.councilRole === role 
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Status Overview */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Users size={20} className="text-indigo-600" />
                Council Status
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${state.councilRole === 'secretary' ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
                      <UserCircle2 size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-300">Twisha Shriyam</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secretary</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${state.councilRole === 'secretary' ? 'text-green-600' : 'text-slate-400'}`}>
                    {state.councilRole === 'secretary' ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${state.councilRole === 'treasurer' ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
                      <UserCircle2 size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-300">Aditya</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Treasurer</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${state.councilRole === 'treasurer' ? 'text-green-600' : 'text-slate-400'}`}>
                    {state.councilRole === 'treasurer' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="mt-8 p-6 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                <div className="flex gap-3">
                  <AlertTriangle className="text-indigo-600 shrink-0" size={20} />
                  <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300 leading-relaxed">
                    Transactions over 500 XLM require signatures from both the Secretary and Treasurer to be processed on the network.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white px-2">Pending Approvals</h3>
            
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {state.pendingApprovals.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 text-center border border-dashed border-slate-200 dark:border-slate-800"
                  >
                    <div className="inline-flex p-4 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 mb-4">
                      <CheckCircle2 size={32} />
                    </div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">All Clear!</h4>
                    <p className="text-slate-500 dark:text-slate-400 font-bold">No transactions are currently awaiting approval.</p>
                  </motion.div>
                ) : (
                  state.pendingApprovals.map((approval) => (
                    <motion.div
                      key={approval.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                          <div className="h-16 w-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600">
                            <Clock size={32} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-2xl font-black text-slate-900 dark:text-white">{approval.amount} XLM</span>
                              <ArrowRight size={16} className="text-slate-300" />
                              <span className="text-sm font-bold text-slate-500">{approval.target}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{approval.date}</span>
                              <span className="h-1 w-1 rounded-full bg-slate-300" />
                              <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Multi-sig Required</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4 min-w-[200px]">
                          <div className="flex gap-2">
                            <div className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-1 ${approval.approvals.secretary ? 'bg-green-50 border-green-100 text-green-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                              <UserCircle2 size={16} />
                              <span className="text-[8px] font-black uppercase tracking-tighter">Secretary</span>
                              {approval.approvals.secretary ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            </div>
                            <div className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-1 ${approval.approvals.treasurer ? 'bg-green-50 border-green-100 text-green-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                              <UserCircle2 size={16} />
                              <span className="text-[8px] font-black uppercase tracking-tighter">Treasurer</span>
                              {approval.approvals.treasurer ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            </div>
                          </div>

                          <button
                            onClick={() => handleApprove(approval.id)}
                            disabled={
                              (state.councilRole === 'secretary' && approval.approvals.secretary) ||
                              (state.councilRole === 'treasurer' && approval.approvals.treasurer) ||
                              state.councilRole === 'user'
                            }
                            className="w-full py-3 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {state.councilRole === 'user' ? (
                              <><Lock size={14} /> Switch Role to Sign</>
                            ) : (
                              <><Unlock size={14} /> Sign as {state.councilRole}</>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
