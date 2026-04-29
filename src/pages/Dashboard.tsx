import React, { useState } from 'react';
import { 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Gift, 
  TrendingUp, 
  Users, 
  Zap,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  X,
  PieChart as PieIcon,
  Target,
  Trophy,
  ArrowRightLeft,
  Copy,
  Check,
  Wallet,
  LogOut,
  Eye,
  EyeOff,
  LayoutDashboard,
  ExternalLink,
  History as HistoryIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useStore } from '../services/store';
import { connectStellarWallet, StellarWalletsKit } from '../services/wallet';
import { StellarService, server } from '../services/stellar';
import { TransactionBuilder, Networks } from 'stellar-sdk';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';

export default function Dashboard() {
  const { 
    state, 
    addTransaction, 
    updateBalance, 
    transferBetweenPockets, 
    updatePocketAllocations,
    connectWallet, 
    disconnectWallet,
    toggleBalanceVisibility,
    checkDailyLogin,
    addSavingGoal,
    addNotification,
    fundSavingGoal,
    setWalletAddress,
    addPendingApproval
  } = useStore();
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [showManualWalletModal, setShowManualWalletModal] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [manualAddressError, setManualAddressError] = useState('');
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showFundGoalModal, setShowFundGoalModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [liveHistory, setLiveHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const [transferData, setTransferData] = useState({ from: 'fees', to: 'savings', amount: '' });
  const [sendData, setSendData] = useState({ address: '', amount: '', pocketId: 'fun' });
  const [goalData, setGoalData] = useState({ name: '', target: '', deadline: '' });
  const [copied, setCopied] = useState<string | null>(null);

  React.useEffect(() => {
    checkDailyLogin();
  }, [checkDailyLogin]);

  React.useEffect(() => {
    const fetchHistory = async () => {
      if (state.walletAddress) {
        setIsLoadingHistory(true);
        const history = await StellarService.getHistory(state.walletAddress);
        setLiveHistory(history);
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 60000); 
    return () => clearInterval(interval);
  }, [state.walletAddress]);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const [transferMode, setTransferMode] = useState<'funds' | 'allocations'>('funds');
  const [tempAllocations, setTempAllocations] = useState<Record<string, number>>({});

  React.useEffect(() => {
    if (showTransferModal) {
      const initialAllocations: Record<string, number> = {};
      state.pockets.forEach(p => {
        initialAllocations[p.id] = p.allocation;
      });
      setTempAllocations(initialAllocations);
    }
  }, [showTransferModal, state.pockets]);

  const handleConnect = async (type: 'stellar' | 'freighter' | 'albedo' | 'manual') => {
    try {
      if (type === 'manual') {
        setShowWalletOptions(false);
        setShowManualWalletModal(true);
        return;
      }

      // Use the unified StellarWalletsKit for all real wallet types
      const address = await connectStellarWallet();
      if (address) {
        connectWallet(address);
        addNotification({ 
          title: 'Wallet Connected', 
          message: `Connected to ${address.slice(0, 8)}...`, 
          type: 'success' 
        });
        setShowWalletOptions(false);
      }
    } catch (err) {
      console.error('Connection error:', err);
      // Don't show error if user just closed the modal
      if (err !== 'MODAL_CLOSED') {
        addNotification({ title: 'Connection Failed', message: 'Could not connect to the wallet.', type: 'warning' });
      }
    }
  };

  const handleManualConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualAddress.trim().startsWith('G') && manualAddress.trim().length >= 56) {
      setWalletAddress(manualAddress.trim());
      setShowManualWalletModal(false);
      setManualAddress('');
      setManualAddressError('');
    } else {
      setManualAddressError('Invalid Stellar address. Must start with G and be 56 characters.');
    }
  };

  const handleConvert = () => {
    const points = parseInt(state.points.toString().replace(/,/g, ''));
    if (points >= 1000) {
      setIsConverting(true);
      setTimeout(() => {
        updateBalance(10, -1000, 0, 'savings');
        addTransaction({
          type: 'convert',
          target: 'Points to XLM',
          amount: '-1000 PTS'
        });
        addTransaction({
          type: 'receive',
          target: 'XLM from Points',
          amount: '+10.00 XLM'
        });
        setIsConverting(false);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setShowConvertModal(false);
        }, 2000);
      }, 1500);
    }
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferMode === 'funds') {
      const amount = parseFloat(transferData.amount);
      if (amount > 0) {
        transferBetweenPockets(transferData.from, transferData.to, amount);
        setShowTransferModal(false);
        setTransferData({ from: 'fees', to: 'savings', amount: '' });
      }
    } else {
      const total = Object.values(tempAllocations).reduce((a, b) => (a as number) + (b as number), 0);
      if (total === 100) {
        const newAllocations = Object.entries(tempAllocations).map(([id, allocation]) => ({ id, allocation: allocation as number }));
        updatePocketAllocations(newAllocations);
        setShowTransferModal(false);
        addNotification({ title: 'Allocations Updated', message: 'Your pocket allocations have been updated successfully.', type: 'success' });
      } else {
        addNotification({ title: 'Invalid Allocations', message: `Total must be 100%. Current: ${total}%`, type: 'warning' });
      }
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(sendData.amount);
    const currentXlm = parseFloat(state.xlm.toString().replace(/,/g, ''));
    
    if (amount > 0 && amount <= currentXlm) {
      if (!state.walletAddress) {
        addNotification({ title: 'Wallet Required', message: 'Please connect your wallet to send XLM.', type: 'warning' });
        return;
      }

      setIsSending(true);
      try {
        const pocketName = state.pockets.find(p => p.id === sendData.pocketId)?.name || 'Fun';
        
        if (amount > 500) {
          // Multi-sig simulation or actual multi-sig logic can go here
          // For now we keep the multi-sig approval flow logic as it was but with a real build attempt
          addPendingApproval({
            amount,
            target: `Wallet: ${sendData.address.slice(0, 8)}...`,
            pocketId: sendData.pocketId,
            date: new Date().toLocaleDateString()
          });
          addNotification({
            title: 'Approval Required',
            message: `Transaction of ${amount} XLM requires multi-sig approval from Council Secretary and Treasurer.`,
            type: 'warning'
          });
          setIsSending(false);
          setShowSendModal(false);
          setSendData({ address: '', amount: '', pocketId: 'fun' });
          return;
        }

        // 1. Build Transaction
        const tx = await StellarService.buildPaymentTransaction(
          state.walletAddress,
          sendData.address,
          amount.toFixed(7)
        );

        // 2. Sign with Wallet Kit
        const { signedTxXdr } = await StellarWalletsKit.signTransaction(tx.toXDR());

        // 3. Submit
        const signedTxObj = TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET);
        const result = await server.submitTransaction(signedTxObj);
        console.log('Send Success:', result);

        updateBalance(-amount, 0, 0, sendData.pocketId);
        addTransaction({
          type: 'send',
          target: `Wallet: ${sendData.address.slice(0, 8)}...`,
          amount: `-${amount.toFixed(2)} XLM`,
          pocket: pocketName,
          hash: result.hash
        });
        
        setIsSending(false);
        setIsSuccess(true);
        setLastTxHash(result.hash);
        
        // Refresh history immediately
        const history = await StellarService.getHistory(state.walletAddress);
        setLiveHistory(history);

        setTimeout(() => {
          setIsSuccess(false);
          setShowSendModal(false);
          setLastTxHash(null);
          setSendData({ address: '', amount: '', pocketId: 'fun' });
        }, 8000);
      } catch (err: any) {
        console.error('Send failed', err);
        setIsSending(false);
        addNotification({ 
          title: 'Transaction Failed', 
          message: err.message || 'Validation error or network issues.', 
          type: 'warning' 
        });
      }
    }
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(goalData.target);
    if (target > 0) {
      addSavingGoal({
        name: goalData.name,
        target,
        deadline: goalData.deadline
      });
      setShowAddGoalModal(false);
      setGoalData({ name: '', target: '', deadline: '' });
      
      addNotification({
        title: 'Goal Added!',
        message: `You've set a new goal: ${goalData.name}. Stay consistent to earn bonus XLM!`,
        type: 'success'
      });
    }
  };
  
  const handleFundGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(fundAmount);
    if (selectedGoalId && amount > 0) {
      const savingsPocket = state.pockets.find(p => p.id === 'savings');
      if (savingsPocket && savingsPocket.balance >= amount) {
        fundSavingGoal(selectedGoalId, amount);
        setShowFundGoalModal(false);
        setFundAmount('');
        setSelectedGoalId(null);
        addNotification({
          title: 'Goal Funded!',
          message: `Successfully added ${amount.toFixed(2)} XLM to your goal.`,
          type: 'success'
        });
      } else {
        addNotification({
          title: 'Insufficient Savings',
          message: 'You do not have enough balance in your Savings pocket.',
          type: 'warning'
        });
      }
    }
  };

  const chartData = (state.pockets || []).map(p => ({ name: p.name, value: p.balance, color: p.color.replace('bg-', '') }));

  return (
    <div className="space-y-8 pb-20 min-h-screen moon-arc-container p-8 rounded-[3rem] relative overflow-hidden">
      {/* Decorative Arcs */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[120%] aspect-square rounded-full border border-indigo-500/10 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[120%] aspect-square rounded-full border border-blue-500/10 pointer-events-none" />

      <header className="flex justify-between items-end relative z-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter">
            {state.studentId ? `HELLO, ${state.studentId}` : 'HELLO, GUEST'}! 👋
          </h1>
          <p className="text-slate-400 font-medium tracking-tight">Welcome back to your Campus Wallet.</p>
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Stellar Network</p>
          <div className="text-sm font-black text-green-500 flex items-center justify-end gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            TESTNET ACTIVE
          </div>
        </div>
      </header>

      {/* Main Balance & Pockets */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* AI Pocket Nudge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white shadow-xl relative overflow-hidden group"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                    <TrendingUp size={20} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest opacity-80">AI Pocket Analysis</span>
                </div>
                <h3 className="text-2xl font-black mb-2">Smart Nudge</h3>
                <p className="text-indigo-100 font-medium text-sm">
                  {state.pockets.find(p => p.id === 'fun')!.balance > 50 
                    ? "Your 'Fun' pocket is looking a bit heavy! Consider moving 10 XLM to 'Savings' to reach your Laptop goal 15 days faster."
                    : "Great job! Your 'Savings' allocation is consistent. You're on track to hit your next milestone by June."}
                </p>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <LayoutDashboard size={120} />
              </div>
            </motion.div>

            {/* Stoic Widget */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group"
            >
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-indigo-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stoic Wisdom</span>
                  </div>
                  <Zap size={16} className="text-amber-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-black text-slate-900 dark:text-white leading-tight italic">
                    "Waste no more time arguing what a good man should be. Be one."
                  </p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">— Marcus Aurelius</p>
                </div>
                <div className="pt-2">
                  <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-indigo-600"
                      initial={{ width: "0%" }}
                      animate={{ width: "65%" }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Daily Progress: 65%</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.div 
              whileHover={{ y: -4 }}
              className="relative overflow-hidden rounded-[3rem] bg-indigo-600 p-10 text-white shadow-2xl shadow-indigo-200 dark:shadow-none"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold opacity-80 uppercase tracking-wider">Stellar Balance</span>
                    {state.walletAddress ? (
                      <div className="flex items-center gap-2 group">
                        <span className="text-[10px] font-mono opacity-60 truncate max-w-[120px]">
                          {state.walletAddress}
                        </span>
                        <button 
                          onClick={disconnectWallet}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/60 hover:text-white"
                          title="Disconnect Wallet"
                        >
                          <LogOut size={12} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setShowWalletOptions(true)}
                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl transition-all active:scale-95 w-fit"
                      >
                        <Wallet size={12} /> Connect Wallet
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={toggleBalanceVisibility}
                      className="p-3 rounded-2xl bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all"
                    >
                      {state.isBalanceVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-md">
                      <Coins size={24} />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-5xl font-black tracking-tight">
                    {state.isBalanceVisible ? state.xlm : '••••••'}
                  </span>
                  <span className="text-xl font-bold opacity-60">XLM</span>
                </div>
                <div className="mt-10 flex gap-4">
                  <button 
                    onClick={() => setShowSendModal(true)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white/20 py-4 text-sm font-bold backdrop-blur-md transition-all hover:bg-white/30 active:scale-95"
                  >
                    <ArrowUpRight size={18} /> Send
                  </button>
                  <button 
                    onClick={() => setShowReceiveModal(true)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white py-4 text-sm font-bold text-indigo-600 transition-all hover:bg-indigo-50 active:scale-95"
                  >
                    <ArrowDownLeft size={18} /> Receive
                  </button>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            </motion.div>

            <motion.div 
              whileHover={{ y: -4 }}
              className="relative overflow-hidden rounded-[3rem] bg-amber-500 p-10 text-white shadow-2xl shadow-amber-100 dark:shadow-none"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold opacity-80 uppercase tracking-wider">Campus Rewards</span>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">KPP Points</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={toggleBalanceVisibility}
                      className="p-3 rounded-2xl bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all"
                    >
                      {state.isBalanceVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-md">
                      <Trophy size={24} />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-5xl font-black tracking-tight">
                    {state.isBalanceVisible ? state.points : '••••••'}
                  </span>
                  <span className="text-xl font-bold opacity-60">PTS</span>
                </div>
                <div className="mt-10 flex gap-4">
                  <button 
                    onClick={() => setShowConvertModal(true)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white/20 py-4 text-sm font-bold backdrop-blur-md transition-all hover:bg-white/30 active:scale-95"
                  >
                    <RefreshCw size={18} /> Convert to XLM
                  </button>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            </motion.div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(state.pockets || []).map(pocket => (
              <div key={pocket.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`h-3 w-3 rounded-full ${pocket.color}`} />
                  <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{pocket.name}</span>
                </div>
                <p className="text-xl font-black text-slate-900 dark:text-white">{pocket.balance.toFixed(2)}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{pocket.allocation}% Alloc</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Allocation Insights</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`var(--color-${entry.color})`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <button 
            onClick={() => setShowTransferModal(true)}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-50 dark:bg-slate-800 py-4 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
          >
            <ArrowRightLeft size={18} /> Transfer Between Pockets
          </button>
        </div>
      </div>

      {/* Savings Goals */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="text-indigo-600" /> Savings Goals
          </h2>
          <button 
            onClick={() => setShowAddGoalModal(true)}
            className="text-sm font-bold text-indigo-600 hover:underline"
          >
            Add Goal
          </button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {state.savingsGoals.map(goal => (
            <div key={goal.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="text-lg font-black text-slate-900 dark:text-white">{goal.name}</h4>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">By {goal.deadline}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-500">{goal.current} / {goal.target} XLM</span>
                  <span className="font-black text-indigo-600">{((goal.current / goal.target) * 100).toFixed(0)}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                    className="h-full bg-indigo-600 rounded-full"
                  />
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedGoalId(goal.id);
                  setShowFundGoalModal(true);
                }}
                className="w-full py-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
              >
                Fund Goal
              </button>
            </div>
          ))}
        </div>
      </section>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* On-Chain Activity */}
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <HistoryIcon size={20} className="text-indigo-600" /> On-Chain Activity
            </h2>
            <Link to="/history" className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">View Ledger</Link>
          </div>
          
          <div className="space-y-4">
            {isLoadingHistory ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-4">
                <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
                <p className="font-bold text-sm tracking-widest uppercase">Fetching Ledger...</p>
              </div>
            ) : liveHistory.length > 0 ? (
              liveHistory.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 group hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <HistoryIcon size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                        {tx.memo}
                        <a 
                          href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                        >
                          <ExternalLink size={12} className="text-slate-400" />
                        </a>
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400">{tx.date} at {tx.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {tx.hash.slice(0, 4)}...{tx.hash.slice(-4)}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Confirmed</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 opacity-50">
                <HistoryIcon size={48} className="mb-4 stroke-[1.5]" />
                <p className="font-bold text-sm tracking-widest uppercase">No ledger history found</p>
                <p className="text-[10px] font-medium text-center">Your transactions will appear here once confirmed.</p>
              </div>
            )}
          </div>
        </section>

        {/* Support Section */}
        <section className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl">
           <div className="relative z-10 space-y-6">
              <h2 className="text-xl font-black italic">"The best way to predict the future is to create it."</h2>
              <div className="space-y-4">
                <p className="text-sm text-indigo-200 leading-relaxed font-medium">
                  Kaiitzn Pocket Pay is bridging the gap between student life and digital assets on Stellar.
                </p>
                <div className="flex gap-4">
                  <div className="flex-1 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-1">Asset Security</p>
                    <p className="text-sm font-bold">Immutable Ledger</p>
                  </div>
                  <div className="flex-1 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-1">Network Fees</p>
                    <p className="text-sm font-bold">~0.00001 XLM</p>
                  </div>
                </div>
              </div>
           </div>
           <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        </section>
      </div>

      {/* Transfer & Allocation Modal */}
      <AnimatePresence>
        {showTransferModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-[3rem] bg-white dark:bg-slate-900 p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Pocket Management</h2>
                <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8">
                <button 
                  onClick={() => setTransferMode('funds')}
                  className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${transferMode === 'funds' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                >
                  Transfer Funds
                </button>
                <button 
                  onClick={() => setTransferMode('allocations')}
                  className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${transferMode === 'allocations' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                >
                  Set Allocations
                </button>
              </div>
              
              <form onSubmit={handleTransfer} className="space-y-6">
                {transferMode === 'funds' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">From</label>
                        <select 
                          value={transferData.from}
                          onChange={e => setTransferData(d => ({ ...d, from: e.target.value }))}
                          className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 font-bold outline-none border border-slate-100 dark:border-slate-700 dark:text-white"
                        >
                          {state.pockets.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.balance.toFixed(1)})</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">To</label>
                        <select 
                          value={transferData.to}
                          onChange={e => setTransferData(d => ({ ...d, to: e.target.value }))}
                          className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 font-bold outline-none border border-slate-100 dark:border-slate-700 dark:text-white"
                        >
                          {state.pockets.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Amount (XLM)</label>
                      <input 
                        type="number" 
                        required
                        value={transferData.amount}
                        onChange={e => setTransferData(d => ({ ...d, amount: e.target.value }))}
                        placeholder="0.00"
                        className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 font-bold outline-none border border-slate-100 dark:border-slate-700 dark:text-white"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    {state.pockets.map(p => (
                      <div key={p.id} className="flex items-center gap-4">
                        <div className={`h-3 w-3 rounded-full ${p.color}`} />
                        <span className="flex-1 font-bold text-slate-700 dark:text-slate-300">{p.name}</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number"
                            value={tempAllocations[p.id] || 0}
                            onChange={e => setTempAllocations(prev => ({ ...prev, [p.id]: parseInt(e.target.value) || 0 }))}
                            className="w-20 rounded-xl bg-slate-50 dark:bg-slate-800 p-2 text-center font-black outline-none border border-slate-100 dark:border-slate-700 dark:text-white"
                          />
                          <span className="font-black text-slate-400">%</span>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-sm font-black text-slate-400 uppercase">Total Allocation</span>
                      <span className={`text-lg font-black ${Object.values(tempAllocations).reduce((a, b) => (a as number) + (b as number), 0) === 100 ? 'text-green-500' : 'text-red-500'}`}>
                        {Object.values(tempAllocations).reduce((a, b) => (a as number) + (b as number), 0)}%
                      </span>
                    </div>
                  </div>
                )}
                
                <button 
                  type="submit"
                  disabled={transferMode === 'allocations' && Object.values(tempAllocations).reduce((a, b) => (a as number) + (b as number), 0) !== 100}
                  className="w-full rounded-2xl bg-indigo-600 py-5 font-black text-white shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {transferMode === 'funds' ? 'Transfer Funds' : 'Save Allocations'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fund Goal Modal */}
      <AnimatePresence>
        {showFundGoalModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-[3rem] bg-white dark:bg-slate-900 p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Fund Goal</h2>
                <button onClick={() => setShowFundGoalModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 rounded-[2rem] bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Savings Balance</span>
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                    {state.pockets.find(p => p.id === 'savings')?.balance.toFixed(2)} XLM
                  </span>
                </div>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Funds will be taken from your Savings pocket</p>
              </div>
              
              <form onSubmit={handleFundGoal} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Amount to Fund (XLM)</label>
                  <input 
                    type="number" 
                    required
                    step="0.01"
                    min="0.01"
                    max={state.pockets.find(p => p.id === 'savings')?.balance}
                    value={fundAmount}
                    onChange={e => setFundAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 font-bold outline-none border border-slate-100 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full rounded-2xl bg-indigo-600 py-5 font-black text-white shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all"
                >
                  Confirm Funding
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Wallet Options Modal */}
      <AnimatePresence>
        {showWalletOptions && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-[3rem] bg-white dark:bg-slate-900 p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Connect Wallet</h2>
                <button onClick={() => setShowWalletOptions(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <button 
                  onClick={() => handleConnect('manual')}
                  className="w-full flex items-center gap-4 p-6 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all group"
                >
                  <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                    <Copy size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-slate-900 dark:text-white">Manual Entry</p>
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">No Extension Required</p>
                  </div>
                  <ChevronRight size={20} className="ml-auto text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                </button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-900 px-4 font-black text-slate-400 tracking-widest">Or Real Wallet</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleConnect('stellar')}
                  className="w-full flex items-center gap-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group border border-slate-100 dark:border-slate-700"
                >
                  <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                    <Wallet size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-slate-900 dark:text-white">Stellar Wallets Kit</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lobstr • Freighter • Albedo • xBull</p>
                  </div>
                  <ChevronRight size={20} className="ml-auto text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Wallet Modal */}
      <AnimatePresence>
        {showManualWalletModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-[3rem] bg-white dark:bg-slate-900 p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Manual Wallet Entry</h2>
                <button onClick={() => setShowManualWalletModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleManualConnect} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Stellar Public Key</label>
                  <input 
                    type="text" 
                    required
                    value={manualAddress}
                    onChange={e => {
                      setManualAddress(e.target.value);
                      if (manualAddressError) setManualAddressError('');
                    }}
                    placeholder="G..."
                    className={`w-full rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 font-bold outline-none border ${manualAddressError ? 'border-red-500' : 'border-slate-100 dark:border-slate-700'} dark:text-white`}
                  />
                  {manualAddressError && (
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{manualAddressError}</p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                  <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 leading-relaxed">
                    Enter your Stellar public key (starting with 'G'). This will allow you to simulate transactions and view your balance.
                  </p>
                </div>

                <button 
                  type="submit"
                  className="w-full rounded-2xl bg-indigo-600 py-5 font-black text-white shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all"
                >
                  Connect Wallet
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddGoalModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-[3rem] bg-white dark:bg-slate-900 p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Add Saving Goal</h2>
                <button onClick={() => setShowAddGoalModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleAddGoal} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Goal Name</label>
                  <input 
                    type="text" 
                    required
                    value={goalData.name}
                    onChange={e => setGoalData(d => ({ ...d, name: e.target.value }))}
                    placeholder="e.g. New Laptop"
                    className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 font-bold outline-none border border-slate-100 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Target Amount (XLM)</label>
                  <input 
                    type="number" 
                    required
                    value={goalData.target}
                    onChange={e => setGoalData(d => ({ ...d, target: e.target.value }))}
                    placeholder="0.00"
                    className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 font-bold outline-none border border-slate-100 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Deadline</label>
                  <input 
                    type="date" 
                    required
                    value={goalData.deadline}
                    onChange={e => setGoalData(d => ({ ...d, deadline: e.target.value }))}
                    className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 font-bold outline-none border border-slate-100 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full rounded-2xl bg-indigo-600 py-5 font-black text-white shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all"
                >
                  Create Goal
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Convert Modal */}
      <AnimatePresence>
        {showConvertModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-[3rem] bg-white dark:bg-slate-900 p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Convert Points</h2>
                <button onClick={() => setShowConvertModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              {isSuccess ? (
                <div className="py-12 text-center space-y-4">
                  <div className="mx-auto h-24 w-24 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-inner">
                    <CheckCircle2 size={56} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Conversion Successful!</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">1000 PTS converted to 10 XLM.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Conversion Rate</p>
                    <p className="text-2xl font-black text-indigo-600">1000 PTS = 10 XLM</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-slate-500">Available Points</span>
                      <span className="text-slate-900 dark:text-white">{state.points} PTS</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-slate-500">You will receive</span>
                      <span className="text-green-600">10.00 XLM</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleConvert}
                    disabled={isConverting || parseInt(state.points) < 1000}
                    className="w-full rounded-2xl bg-indigo-600 py-5 font-black text-white shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                  >
                    {isConverting ? <RefreshCw size={24} className="animate-spin" /> : 'Confirm Conversion'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Send Modal */}
      <AnimatePresence>
        {showSendModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-[3rem] bg-white dark:bg-slate-900 p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Send Funds</h2>
                <button onClick={() => setShowSendModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              {isSuccess ? (
                <div className="py-12 text-center space-y-6">
                  <div className="mx-auto h-24 w-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 shadow-inner">
                    <CheckCircle2 size={56} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Sent Successfully!</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Your transaction is now on the Stellar ledger.</p>
                  </div>
                  
                  {lastTxHash && (
                    <a 
                      href={`https://stellar.expert/explorer/testnet/tx/${lastTxHash}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-indigo-600 font-black text-sm hover:underline"
                    >
                      View Receipt on Explorer <ExternalLink size={16} />
                    </a>
                  )}

                  <button 
                    onClick={() => {
                      setIsSuccess(false);
                      setShowSendModal(false);
                      setLastTxHash(null);
                    }}
                    className="w-full rounded-2xl bg-indigo-600 py-4 font-black text-white hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSend} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Recipient Address</label>
                    <input 
                      type="text" 
                      required
                      value={sendData.address}
                      onChange={e => setSendData(d => ({ ...d, address: e.target.value }))}
                      placeholder="G..."
                      className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 font-mono text-sm font-bold outline-none border border-slate-100 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Amount (XLM)</label>
                      <input 
                        type="number" 
                        required
                        step="0.01"
                        value={sendData.amount}
                        onChange={e => setSendData(d => ({ ...d, amount: e.target.value }))}
                        placeholder="0.00"
                        className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 font-bold outline-none border border-slate-100 dark:border-slate-700 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">From Pocket</label>
                      <select 
                        value={sendData.pocketId}
                        onChange={e => setSendData(d => ({ ...d, pocketId: e.target.value }))}
                        className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 font-bold outline-none border border-slate-100 dark:border-slate-700 dark:text-white"
                      >
                        {state.pockets.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.balance.toFixed(1)})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={isSending || !sendData.address || !sendData.amount}
                    className="w-full rounded-2xl bg-indigo-600 py-5 font-black text-white shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                  >
                    {isSending ? <RefreshCw size={24} className="animate-spin" /> : 'Confirm Send'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Receive Modal */}
      <AnimatePresence>
        {showReceiveModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-[3rem] bg-white dark:bg-slate-900 p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Receive Funds</h2>
                <button onClick={() => setShowReceiveModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8 text-center">
                <div className="p-8 bg-white rounded-3xl inline-block shadow-inner mx-auto">
                  <QRCodeSVG 
                    value={state.walletAddress || state.kppId || ''}
                    size={200}
                    level="H"
                  />
                </div>

                <div className="space-y-4 text-left">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">KPP Stellar ID</label>
                    <div className="flex items-center gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <span className="flex-1 font-mono text-sm font-bold text-slate-900 dark:text-white truncate">
                        {state.kppId}
                      </span>
                      <button 
                        onClick={() => handleCopy(state.kppId || '', 'kpp')}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                      >
                        {copied === 'kpp' ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>

                  {state.walletAddress && (
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Wallet Address</label>
                      <div className="flex items-center gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <span className="flex-1 font-mono text-xs font-bold text-slate-900 dark:text-white truncate">
                          {state.walletAddress}
                        </span>
                        <button 
                          onClick={() => handleCopy(state.walletAddress || '', 'wallet')}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                        >
                          {copied === 'wallet' ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Scan QR or share ID to receive XLM
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuickAction({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <button className="flex flex-col items-center gap-4 rounded-[2rem] bg-white dark:bg-slate-900 p-6 transition-all hover:shadow-xl border border-slate-50 dark:border-slate-800 active:scale-95 group">
      <div className={`rounded-2xl p-4 transition-transform group-hover:scale-110 ${color}`}>
        {icon}
      </div>
      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{label}</span>
    </button>
  );
}
