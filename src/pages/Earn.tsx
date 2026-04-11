import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare,
  ChevronRight,
  X,
  Briefcase,
  Trophy,
  Users,
  Calendar,
  Bell,
  BellOff,
  TrendingUp,
  PieChart,
  BarChart3,
  LayoutGrid,
  ListTodo,
  Share2,
  ShoppingCart,
  Tag,
  Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore, Gig } from '../services/store';

export default function Earn() {
  const { state, addGig, applyToGig, completeTask, verifyTask, toggleReminder, addReferral, useReferralCode, redeemItem } = useStore();
  const [activeTab, setActiveTab] = useState<'marketplace' | 'tasks' | 'analytics' | 'redeem'>('marketplace');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [applyData, setApplyData] = useState({ what: '', how: '', proof: '' });
  const [taskProofLinks, setTaskProofLinks] = useState<Record<string, string>>({});

  const categories = ['All', 'Design', 'Tech', 'Volunteering', 'Content', 'Events', 'Selling', 'Buying'];

  const handleReferralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (referralCode) {
      useReferralCode(referralCode);
      setReferralCode('');
      setShowReferralModal(false);
    }
  };

  const filteredGigs = useMemo(() => {
    return state.gigs.filter(gig => {
      const matchesSearch = gig.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           gig.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || gig.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [state.gigs, searchQuery, selectedCategory]);

  const stats = useMemo(() => {
    const completedTasks = state.userTasks.filter(t => t.status === 'Completed');
    const completed = completedTasks.length;
    const pending = state.userTasks.filter(t => t.status === 'Pending').length;
    const totalEarned = completedTasks.reduce((acc, t) => {
      const gig = state.gigs.find(g => g.id === t.gigId);
      return acc + (gig?.reward || 0);
    }, 0);
    return { completed, pending, totalEarned, activeReminders: state.reminders.length };
  }, [state.userTasks, state.gigs, state.reminders]);

  const handleCreateGig = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newGigData: Omit<Gig, 'id'> = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as any,
      reward: parseInt(formData.get('reward') as string),
      deadline: formData.get('deadline') as string,
      author: formData.get('author') as string,
      authorId: state.studentId || 'Anonymous',
      status: 'Available',
      contactInfo: formData.get('contact') as string
    };
    addGig(newGigData);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Campus Economy</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Contribute to campus life and earn KPP Points.</p>
        </div>
        
        {/* 4-Pallet Grid for Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TabPallet 
            active={activeTab === 'marketplace'} 
            onClick={() => setActiveTab('marketplace')}
            icon={<LayoutGrid size={24} />}
            label="Marketplace"
            description="Find campus gigs"
            color="bg-indigo-600"
          />
          <TabPallet 
            active={activeTab === 'tasks'} 
            onClick={() => setActiveTab('tasks')}
            icon={<ListTodo size={24} />}
            label="My Tasks"
            description="Track your work"
            color="bg-emerald-600"
          />
          <TabPallet 
            active={activeTab === 'analytics'} 
            onClick={() => setActiveTab('analytics')}
            icon={<TrendingUp size={24} />}
            label="Analytics"
            description="View earnings"
            color="bg-amber-600"
          />
          <TabPallet 
            active={activeTab === 'redeem'} 
            onClick={() => setActiveTab('redeem')}
            icon={<Gift size={24} />}
            label="Redeem"
            description="Spend points"
            color="bg-rose-600"
          />
        </div>
      </header>

      {activeTab === 'marketplace' && (
        <div className="space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search gigs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 pl-12 pr-6 outline-none focus:border-indigo-500 transition-all font-medium dark:text-white"
              />
            </div>
            <div className="relative">
              <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar scroll-smooth snap-x snap-mandatory px-1">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 snap-start whitespace-nowrap px-7 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all border-2 ${selectedCategory === cat ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none scale-105' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-indigo-200 hover:bg-slate-50'}`}
                  >
                    {cat === 'Selling' ? <Tag size={14} className="inline mr-2" /> : cat === 'Buying' ? <ShoppingCart size={14} className="inline mr-2" /> : null}
                    {cat}
                  </button>
                ))}
              </div>
              {/* Fade indicators for scrolling */}
              <div className="absolute right-0 top-0 bottom-6 w-12 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent pointer-events-none" />
              <div className="absolute left-0 top-0 bottom-6 w-12 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowReferralModal(true)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-4 text-sm font-black text-white shadow-xl shadow-amber-100 dark:shadow-none hover:bg-amber-600 transition-all active:scale-95"
              >
                <Share2 size={20} /> Refer & Earn
              </button>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-black text-white shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95"
              >
                <Plus size={20} /> Create Gig
              </button>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGigs.map(gig => (
              <motion.div 
                key={gig.id} 
                layoutId={gig.id}
                className="group relative flex flex-col rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 p-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <Briefcase size={24} />
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleReminder(gig.id); }}
                    className={`p-3 rounded-xl transition-all ${state.reminders.includes(gig.id) ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600'}`}
                  >
                    {state.reminders.includes(gig.id) ? <Bell size={18} /> : <BellOff size={18} />}
                  </button>
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{gig.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 font-medium">{gig.description}</p>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy size={16} className="text-amber-500" />
                    <span className="text-lg font-black text-slate-900 dark:text-white">{gig.reward} KPP</span>
                  </div>
                  <button 
                    onClick={() => setSelectedGig(gig)}
                    className="rounded-xl bg-slate-900 dark:bg-slate-800 px-5 py-2.5 text-xs font-black text-white hover:bg-indigo-600 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Earned</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalEarned} KPP</p>
            </div>
            <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Completed</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.completed}</p>
            </div>
            <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.pending}</p>
            </div>
            <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reminders</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.activeReminders}</p>
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Active Task Management</h3>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {state.userTasks.length > 0 ? state.userTasks.map(task => {
                const gig = state.gigs.find(g => g.id === task.gigId);
                return (
                  <div key={task.id} className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-6">
                      <div className={`rounded-2xl p-4 ${
                        task.status === 'Completed' ? 'bg-green-50 text-green-600' : 
                        task.status === 'Rejected' ? 'bg-red-50 text-red-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {task.status === 'Completed' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white">{gig?.title}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{gig?.category}</span>
                          <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">{gig?.reward} KPP Reward</span>
                        </div>
                      </div>
                    </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                          task.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-100' : 
                          task.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {task.status}
                        </span>
                        
                        {task.status === 'Pending' && (
                          <div className="flex flex-col gap-2">
                            <input 
                              type="text"
                              placeholder="Proof Link (Required)"
                              value={taskProofLinks[task.id] || ''}
                              onChange={e => setTaskProofLinks(prev => ({ ...prev, [task.id]: e.target.value }))}
                              className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[10px] font-bold outline-none focus:border-indigo-500"
                            />
                            <button 
                              onClick={() => completeTask(task.id, taskProofLinks[task.id])}
                              disabled={!taskProofLinks[task.id]}
                              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-black text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              Submit for Verification
                            </button>
                          </div>
                        )}

                        {/* Admin Verification (Twisha Only) */}
                        {state.studentId === 'Twisha' && task.status === 'Pending' && task.proofLink && (
                          <div className="flex gap-2 mt-2">
                            <button 
                              onClick={() => verifyTask(task.id, 'Completed')}
                              className="px-4 py-2 rounded-xl bg-green-600 text-white text-[10px] font-black hover:bg-green-700 transition-all"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => verifyTask(task.id, 'Rejected')}
                              className="px-4 py-2 rounded-xl bg-red-600 text-white text-[10px] font-black hover:bg-red-700 transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                  </div>
                );
              }) : (
                <div className="p-20 text-center text-slate-400 font-bold">You haven't applied to any gigs yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Live Metrics</h3>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Real-time</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { label: 'Active Tasks', value: stats.pending, icon: ListTodo, color: 'text-amber-500' },
                  { label: 'Success Rate', value: '98%', icon: CheckCircle2, color: 'text-green-500' },
                  { label: 'Avg. Reward', value: '450 KPP', icon: Trophy, color: 'text-indigo-500' },
                  { label: 'Global Rank', value: '#42', icon: TrendingUp, color: 'text-blue-500' }
                ].map((metric, i) => (
                  <div key={i} className="space-y-2">
                    <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 w-fit ${metric.color}`}>
                      <metric.icon size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{metric.label}</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white">{metric.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2.5rem] bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-100 dark:shadow-none relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-black mb-2">StellarGuard Active</h3>
                <p className="text-sm font-medium opacity-80 mb-6">Your account is protected by multi-sig security and real-time monitoring.</p>
                <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-4 backdrop-blur-md">
                  <CheckCircle2 size={24} className="text-green-300" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest">Security Status</p>
                    <p className="text-sm font-bold">Enhanced Protection</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-10">
                <TrendingUp size={160} />
              </div>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Earnings Trend</h3>
                <TrendingUp className="text-indigo-600" size={24} />
              </div>
              <div className="h-64 flex items-end justify-between gap-2 px-4">
                {[40, 25, 60, 45, 80, 55, 90].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      className="w-full rounded-t-xl bg-indigo-600/20 hover:bg-indigo-600 transition-colors cursor-pointer relative group"
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {h * 10} KPP
                      </div>
                    </motion.div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Day {i + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Task Distribution</h3>
                <PieChart className="text-indigo-600" size={24} />
              </div>
              <div className="space-y-6">
                {[
                  { label: 'Design', value: 45, color: 'bg-indigo-500' },
                  { label: 'Tech', value: 30, color: 'bg-amber-500' },
                  { label: 'Volunteering', value: 15, color: 'bg-green-500' },
                  { label: 'Other', value: 10, color: 'bg-slate-400' }
                ].map(item => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="text-slate-900 dark:text-white">{item.value}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        className={`h-full ${item.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'redeem' && (
        <div className="space-y-8">
          <div className="rounded-[2.5rem] bg-indigo-600 p-10 text-white shadow-xl shadow-indigo-100 dark:shadow-none overflow-hidden relative">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-4xl font-black mb-4">Redeem Your KPP Points</h2>
              <p className="text-lg font-medium opacity-80 mb-8">Use your hard-earned points for college essentials, canteen vouchers, and exclusive campus perks.</p>
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Available Balance</p>
                  <p className="text-2xl font-black">{state.kppPoints} KPP</p>
                </div>
              </div>
            </div>
            <Gift size={200} className="absolute -right-10 -bottom-10 opacity-10 rotate-12" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {state.redeemableItems.map(item => (
              <div key={item.id} className="group rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all hover:-translate-y-1">
                <div className="flex justify-between items-start mb-6">
                  <div className={`rounded-2xl p-4 text-white ${
                    item.category === 'College' ? 'bg-blue-500' :
                    item.category === 'Food' ? 'bg-orange-500' :
                    item.category === 'Tech' ? 'bg-indigo-500' : 'bg-slate-500'
                  }`}>
                    {item.category === 'College' ? <Briefcase size={24} /> : 
                     item.category === 'Food' ? <ShoppingCart size={24} /> : 
                     item.category === 'Tech' ? <TrendingUp size={24} /> : <Gift size={24} />}
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.category}</span>
                </div>
                <div className="space-y-2 mb-8">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{item.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{item.description}</p>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                  <p className="text-lg font-black text-slate-900 dark:text-white">{item.price} KPP</p>
                  <button 
                    onClick={() => redeemItem(item.id)}
                    disabled={state.kppPoints < item.price}
                    className={`rounded-xl px-6 py-2.5 text-xs font-black transition-all ${
                      state.kppPoints >= item.price 
                        ? 'bg-slate-900 dark:bg-slate-800 text-white hover:bg-indigo-600 active:scale-95' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {state.kppPoints >= item.price ? 'Redeem Now' : 'Insufficient Points'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {selectedGig && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-2xl rounded-[3rem] bg-white dark:bg-slate-900 p-10 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-8">
                <div className="space-y-2">
                  <span className="px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                    {selectedGig.category}
                  </span>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{selectedGig.title}</h2>
                </div>
                <button onClick={() => setSelectedGig(null)} className="text-slate-400 hover:text-slate-600"><X size={32} /></button>
              </div>

              <div className="grid gap-8 md:grid-cols-3 mb-10">
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reward</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{selectedGig.reward} KPP</p>
                </div>
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deadline</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{selectedGig.deadline}</p>
                </div>
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Posted By</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{selectedGig.author}</p>
                </div>
              </div>

              <div className="space-y-6 mb-10">
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Description</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{selectedGig.description}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setShowApplyForm(true)}
                  className="flex-1 rounded-2xl bg-indigo-600 py-5 font-black text-white shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95"
                >
                  Apply Now
                </button>
                <button className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 py-5 font-black text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                  <MessageSquare size={20} /> Contact Author
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showApplyForm && selectedGig && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md rounded-[3rem] bg-white dark:bg-slate-900 p-10 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Gig Application</h2>
                <button onClick={() => setShowApplyForm(false)} className="text-slate-400 hover:text-slate-600"><X size={32} /></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                applyToGig(selectedGig.id);
                setShowApplyForm(false);
                setSelectedGig(null);
              }} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">What will you do?</label>
                  <textarea 
                    required 
                    value={applyData.what}
                    onChange={e => setApplyData(d => ({ ...d, what: e.target.value }))}
                    placeholder="Briefly describe your contribution..." 
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-4 px-6 outline-none focus:border-indigo-500 dark:text-white font-bold resize-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">How will you do it?</label>
                  <textarea 
                    required 
                    value={applyData.how}
                    onChange={e => setApplyData(d => ({ ...d, how: e.target.value }))}
                    placeholder="Describe your approach or tools..." 
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-4 px-6 outline-none focus:border-indigo-500 dark:text-white font-bold resize-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proof of Submission (Link/File)</label>
                  <input 
                    required 
                    value={applyData.proof}
                    onChange={e => setApplyData(d => ({ ...d, proof: e.target.value }))}
                    placeholder="Link to portfolio or draft..." 
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-4 px-6 outline-none focus:border-indigo-500 dark:text-white font-bold" 
                  />
                </div>
                <button type="submit" className="w-full rounded-2xl bg-indigo-600 py-5 font-black text-white shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95">
                  Submit Application
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showReferralModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md rounded-[3rem] bg-white dark:bg-slate-900 p-10 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Refer & Earn</h2>
                <button onClick={() => setShowReferralModal(false)} className="text-slate-400 hover:text-slate-600"><X size={32} /></button>
              </div>
              
              <div className="space-y-8">
                <div className="p-6 rounded-3xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-center">
                  <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">Your Referral Code</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white tracking-widest">KPP-{state.studentId?.slice(-4).toUpperCase()}</p>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`KPP-${state.studentId?.slice(-4).toUpperCase()}`);
                      addReferral();
                    }}
                    className="mt-4 px-6 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs font-black text-indigo-600 shadow-sm hover:scale-105 transition-transform"
                  >
                    Copy & Share
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
                  <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-white dark:bg-slate-900 px-4 text-slate-400">OR</span></div>
                </div>

                <form onSubmit={handleReferralSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Have a referral code?</label>
                    <input 
                      type="text" 
                      required 
                      value={referralCode}
                      onChange={e => setReferralCode(e.target.value)}
                      placeholder="Enter code (e.g. KPP-1234)" 
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-4 px-6 outline-none focus:border-indigo-500 dark:text-white font-bold" 
                    />
                  </div>
                  <button type="submit" className="w-full rounded-2xl bg-slate-900 dark:bg-slate-800 py-5 font-black text-white hover:bg-indigo-600 transition-all active:scale-95">
                    Apply Code & Get 100 KPP
                  </button>
                </form>

                <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Earn 1500 pts for every successful referral!
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-2xl rounded-[3rem] bg-white dark:bg-slate-900 p-10 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Create New Gig</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600"><X size={32} /></button>
              </div>
              <form onSubmit={handleCreateGig} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gig Title</label>
                    <input name="title" required placeholder="e.g. Design Club Logo" className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-4 px-6 outline-none focus:border-indigo-500 dark:text-white font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                    <select name="category" className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-4 px-6 outline-none focus:border-indigo-500 dark:text-white font-bold">
                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                  <textarea name="description" required rows={4} placeholder="Describe the task and requirements..." className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-4 px-6 outline-none focus:border-indigo-500 dark:text-white font-bold resize-none" />
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reward (KPP)</label>
                    <input name="reward" type="number" required placeholder="500" className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-4 px-6 outline-none focus:border-indigo-500 dark:text-white font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deadline</label>
                    <input name="deadline" type="date" required className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-4 px-6 outline-none focus:border-indigo-500 dark:text-white font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Author (Club/Name)</label>
                    <input name="author" required placeholder="e.g. Design Club" className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-4 px-6 outline-none focus:border-indigo-500 dark:text-white font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info</label>
                  <input name="contact" required placeholder="Email or Phone" className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-4 px-6 outline-none focus:border-indigo-500 dark:text-white font-bold" />
                </div>
                <button type="submit" className="w-full rounded-2xl bg-indigo-600 py-5 font-black text-white shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95">
                  Post Gig to Marketplace
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TabPallet({ active, onClick, icon, label, description, color }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; description: string; color: string }) {
  return (
    <button 
      onClick={onClick}
      className={`relative flex flex-col items-start p-6 rounded-[2.5rem] border transition-all text-left group overflow-hidden ${active ? 'bg-white dark:bg-slate-900 border-indigo-600 shadow-xl shadow-indigo-100 dark:shadow-none' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-200'}`}
    >
      <div className={`mb-4 p-3 rounded-2xl transition-all ${active ? `${color} text-white` : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-600'}`}>
        {icon}
      </div>
      <div className="space-y-1">
        <p className={`text-sm font-black uppercase tracking-widest ${active ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{label}</p>
        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {active && (
        <motion.div 
          layoutId="active-tab-indicator"
          className="absolute bottom-0 left-0 right-0 h-1.5 bg-indigo-600"
        />
      )}
    </button>
  );
}
