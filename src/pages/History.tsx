import React, { useState, useMemo } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Download,
  ExternalLink,
  Calendar,
  Gift,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore, Transaction } from '../services/store';

export default function TransactionHistory() {
  const { state } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);

  const filteredTransactions = useMemo(() => {
    return state.transactions.filter(tx => {
      const matchesSearch = tx.target.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (tx.hash && tx.hash.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'All' || tx.status === statusFilter;
      const matchesType = typeFilter === 'All' || tx.type === typeFilter;
      
      let matchesDate = true;
      if (dateRange.start) {
        matchesDate = matchesDate && new Date(tx.date) >= new Date(dateRange.start);
      }
      if (dateRange.end) {
        matchesDate = matchesDate && new Date(tx.date) <= new Date(dateRange.end);
      }

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  }, [state.transactions, searchQuery, statusFilter, typeFilter, dateRange]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setTypeFilter('All');
    setDateRange({ start: '', end: '' });
  };

  const getStatusStyles = (status: Transaction['status']) => {
    switch (status) {
      case 'Completed': return 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30';
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30';
      case 'Rejected': return 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30';
      case 'Revisions Needed': return 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-900/30';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const handleExport = () => {
    if (filteredTransactions.length === 0) return;

    const headers = ['ID', 'Type', 'Target', 'Amount', 'Date', 'Time', 'Status', 'Hash'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(tx => [
        tx.id,
        tx.type,
        `"${tx.target}"`,
        tx.amount,
        tx.date,
        tx.time,
        tx.status,
        tx.hash || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `stellar_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">On-Chain Ledger</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Track your campus economy in real-time.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-3 text-sm font-black text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
          >
            <Download size={18} /> Export
          </button>
        </div>
      </header>

      {/* Advanced Filters */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by hash, target, or type..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 pl-12 pr-6 outline-none focus:border-indigo-500 transition-all font-medium dark:text-white shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-2xl border px-6 py-3 text-sm font-black transition-all shadow-sm active:scale-95 ${showFilters ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
            >
              <Filter size={18} /> Filters
            </button>
            {(searchQuery || statusFilter !== 'All' || typeFilter !== 'All' || dateRange.start || dateRange.end) && (
              <button 
                onClick={clearFilters}
                className="flex items-center gap-2 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 px-6 py-3 text-sm font-black text-red-600 dark:text-red-400 hover:bg-red-100 transition-all active:scale-95"
              >
                <X size={18} /> Clear
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid gap-6 md:grid-cols-4 p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-3 px-4 outline-none focus:border-indigo-500 text-sm font-bold dark:text-white"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Revisions Needed">Revisions Needed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</label>
                  <select 
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-3 px-4 outline-none focus:border-indigo-500 text-sm font-bold dark:text-white"
                  >
                    <option value="All">All Types</option>
                    <option value="send">Send</option>
                    <option value="receive">Receive</option>
                    <option value="reward">Reward</option>
                    <option value="convert">Convert</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From Date</label>
                  <input 
                    type="date" 
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-3 px-4 outline-none focus:border-indigo-500 text-sm font-bold dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To Date</label>
                  <input 
                    type="date" 
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-3 px-4 outline-none focus:border-indigo-500 text-sm font-bold dark:text-white"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-[3rem] bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                <th className="px-8 py-6">Transaction</th>
                <th className="px-8 py-6">Amount</th>
                <th className="px-8 py-6">Date & Time</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredTransactions.length > 0 ? filteredTransactions.map((tx) => (
                <tr key={tx.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`rounded-2xl p-3 ${
                        tx.type === 'send' ? 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400' : 
                        tx.type === 'receive' ? 'bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-green-400' : 
                        tx.type === 'convert' ? 'bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20 dark:text-indigo-400' :
                        'bg-amber-50 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400'
                      }`}>
                        {tx.type === 'send' ? <ArrowUpRight size={18} /> : 
                         tx.type === 'convert' ? <RefreshCw size={18} /> :
                         tx.type === 'reward' ? <Gift size={18} /> :
                         <ArrowDownLeft size={18} />}
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 dark:text-white">{tx.target}</p>
                        <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">{tx.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-base font-black ${
                      tx.amount.startsWith('+') ? 'text-green-500' : 'text-slate-900 dark:text-white'
                    }`}>
                      {tx.amount}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{tx.date}</p>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{tx.time}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <button className="flex items-center gap-1 text-xs font-mono font-bold text-indigo-600 hover:underline">
                      {tx.hash ? `${tx.hash.slice(0, 6)}...${tx.hash.slice(-4)}` : 'N/A'} <ExternalLink size={12} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="mx-auto h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 mb-4">
                      <Search size={32} />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-bold">No transactions found matching your filters.</p>
                    <button onClick={clearFilters} className="mt-2 text-indigo-600 font-black uppercase tracking-widest text-xs hover:underline">Clear all filters</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
