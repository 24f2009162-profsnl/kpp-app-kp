import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Download,
  ExternalLink,
  Calendar,
  History,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../services/store';
import { StellarService } from '../services/stellar';

export default function HistoryPage() {
  const { state } = useStore();
  const [liveHistory, setLiveHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      if (state.walletAddress) {
        setIsLoading(true);
        const history = await StellarService.getHistory(state.walletAddress);
        setLiveHistory(history);
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [state.walletAddress]);

  const handleExport = () => {
    if (liveHistory.length === 0) return;

    const headers = ['ID', 'Hash', 'Date', 'Time', 'Memo', 'Status'];
    const csvContent = [
      headers.join(','),
      ...liveHistory.map(tx => [
        tx.id,
        tx.hash,
        tx.date,
        tx.time,
        `"${tx.memo}"`,
        tx.successful ? 'Success' : 'Failed'
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
    <div className="space-y-12 pb-20 min-h-screen moon-arc-container p-8 rounded-[3rem] relative overflow-hidden">
      {/* Decorative Arcs */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[120%] aspect-square rounded-full border border-indigo-500/10 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[120%] aspect-square rounded-full border border-blue-500/10 pointer-events-none" />

      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-black text-white tracking-tight">On-Chain Ledger</h1>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Network
            </div>
            <button 
              onClick={handleExport}
              disabled={liveHistory.length === 0}
              className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 border border-slate-100 dark:border-slate-700 hover:text-indigo-600 transition-colors disabled:opacity-30"
            >
              <Download size={20} />
            </button>
          </div>
        </div>
        <p className="text-slate-400 font-bold max-w-2xl leading-relaxed">
          Immutable records fetched directly from the Stellar blockchain for account {state.walletAddress?.slice(0, 8)}...
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 relative z-10">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Transaction Log</h2>
          <div className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-2xl">
            {['All', 'Payments', 'Ledger'].map((tab) => (
              <button key={tab} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                tab === 'All' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-700'
              }`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-50 dark:border-slate-800 text-left">
                <th className="py-5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="py-5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Hash</th>
                <th className="py-5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                <th className="py-5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pocket</th>
                <th className="py-5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Ledger...</p>
                    </div>
                  </td>
                </tr>
              ) : liveHistory.length > 0 ? (
                liveHistory.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-6 px-4">
                      <p className="text-sm font-black text-slate-900 dark:text-white">{tx.date}</p>
                      <p className="text-[10px] font-bold text-slate-400">{tx.time}</p>
                    </td>
                    <td className="py-6 px-4">
                      <div className="flex items-center gap-2">
                        <code className="text-[10px] font-black text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md">
                          {tx.hash.slice(0, 12)}...
                        </code>
                        <a 
                          href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-all"
                        >
                          <ExternalLink size={12} className="text-slate-400 hover:text-indigo-600" />
                        </a>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">{tx.memo}</p>
                    </td>
                    <td className="py-6 px-4">
                      <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase text-slate-500 tracking-wider">
                        Ledger
                      </span>
                    </td>
                    <td className="py-6 px-4 text-right">
                      <p className={`text-sm font-black ${tx.successful ? 'text-emerald-500' : 'text-red-500'}`}>
                        {tx.successful ? 'Success' : 'Failed'}
                      </p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Confirmed</p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center opacity-50">
                    <History size={48} className="mx-auto mb-4 stroke-[1.5] text-slate-300" />
                    <p className="text-sm font-black uppercase tracking-widest text-slate-400">No ledger entries found</p>
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
