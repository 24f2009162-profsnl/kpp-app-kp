import React from 'react';
import { Trophy, Medal, Star, Zap, Flame, Award, TrendingUp, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../services/store';

const MOCK_LEADERBOARD = [
  { id: '1', name: 'Alex Stellar', points: 12500, tasks: 45, badges: ['7 crore', 'Top Supporter'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
  { id: '2', name: 'Sarah KPP', points: 10200, tasks: 38, badges: ['Light Speed Anime'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { id: '3', name: 'Jordan Dev', points: 9800, tasks: 32, badges: ['7 crore'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan' },
  { id: '4', name: 'Casey Campus', points: 8500, tasks: 28, badges: ['Top Supporter'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Casey' },
  { id: '5', name: 'Taylor Tech', points: 7200, tasks: 22, badges: ['Faah'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor' },
];

export default function Leaderboard() {
  const { state } = useStore();

  const currentUserRank = {
    name: state.studentId || 'You',
    points: state.kppPoints || 0,
    tasks: state.userTasks.filter(t => t.status === 'Completed').length,
    badges: state.badges,
    avatar: state.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${state.studentId}`
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 p-8 rounded-[3rem] pop-art-pattern border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
      <header className="text-center space-y-4 bg-white p-10 rounded-[3rem] border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1/4 opacity-10 pointer-events-none hidden md:block">
          <img 
            src="https://picsum.photos/seed/leaderboard-collage/400/400" 
            alt="Decorative" 
            className="h-full w-full object-cover grayscale contrast-150"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10">
          <div className="inline-flex p-4 rounded-[2rem] bg-amber-400 text-slate-900 border-4 border-slate-900 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Trophy size={48} strokeWidth={2.5} />
          </div>
          <h1 className="text-5xl font-black text-slate-900 italic uppercase tracking-tighter">Campus Hall of Fame</h1>
          <p className="text-slate-600 font-bold max-w-lg mx-auto">
            The top contributors, earners, and campus legends. Are you on the list?
          </p>
        </div>
      </header>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 items-end pt-10">
        {/* 2nd Place */}
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="h-20 w-20 rounded-[1.5rem] bg-slate-200 dark:bg-slate-800 overflow-hidden border-4 border-slate-300 dark:border-slate-700">
              <img src={MOCK_LEADERBOARD[1].avatar} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-slate-400 text-white flex items-center justify-center font-black text-sm shadow-lg">2</div>
          </div>
          <div className="h-24 w-full bg-white dark:bg-slate-900 rounded-t-[2rem] shadow-sm border-x border-t border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center p-4">
            <p className="text-xs font-black text-slate-900 dark:text-white truncate w-full text-center">{MOCK_LEADERBOARD[1].name}</p>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{MOCK_LEADERBOARD[1].points} PTS</p>
          </div>
        </div>

        {/* 1st Place */}
        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            <div className="h-28 w-28 rounded-[2rem] bg-amber-100 dark:bg-amber-900/30 overflow-hidden border-4 border-amber-400">
              <img src={MOCK_LEADERBOARD[0].avatar} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-amber-400 text-white flex items-center justify-center font-black text-lg shadow-lg">
              <Trophy size={20} />
            </div>
          </div>
          <div className="h-32 w-full bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-xl border-x border-t border-amber-100 dark:border-amber-900/30 flex flex-col items-center justify-center p-4">
            <p className="text-sm font-black text-slate-900 dark:text-white truncate w-full text-center">{MOCK_LEADERBOARD[0].name}</p>
            <p className="text-xs font-black text-amber-600 uppercase tracking-widest">{MOCK_LEADERBOARD[0].points} PTS</p>
          </div>
        </div>

        {/* 3rd Place */}
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="h-16 w-16 rounded-[1.25rem] bg-orange-50 dark:bg-orange-900/20 overflow-hidden border-4 border-orange-300 dark:border-orange-800">
              <img src={MOCK_LEADERBOARD[2].avatar} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute -bottom-2 -right-2 h-7 w-7 rounded-lg bg-orange-400 text-white flex items-center justify-center font-black text-xs shadow-lg">3</div>
          </div>
          <div className="h-20 w-full bg-white dark:bg-slate-900 rounded-t-[1.5rem] shadow-sm border-x border-t border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center p-4">
            <p className="text-[10px] font-black text-slate-900 dark:text-white truncate w-full text-center">{MOCK_LEADERBOARD[2].name}</p>
            <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{MOCK_LEADERBOARD[2].points} PTS</p>
          </div>
        </div>
      </div>

      {/* Full List */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Leaderboard</h3>
          <div className="flex gap-2">
            <span className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500">Global</span>
          </div>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-slate-800">
          {MOCK_LEADERBOARD.map((user, i) => (
            <div key={user.id} className="p-6 flex items-center gap-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
              <span className="w-8 text-lg font-black text-slate-300 dark:text-slate-700">#{i + 1}</span>
              <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img src={user.avatar} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-slate-900 dark:text-white">{user.name}</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {user.badges.map((badge, i) => (
                    <span key={`${badge}-${i}`} className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-slate-900 dark:text-white">{user.points.toLocaleString()}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.tasks} Tasks</p>
              </div>
            </div>
          ))}

          {/* Current User Row */}
          <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 flex items-center gap-6 border-t-2 border-indigo-100 dark:border-indigo-900/30">
            <span className="w-8 text-lg font-black text-indigo-600">#99+</span>
            <div className="h-14 w-14 rounded-2xl bg-indigo-600 overflow-hidden">
              <img src={currentUserRank.avatar} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1">
              <h4 className="font-black text-slate-900 dark:text-white">{currentUserRank.name} (You)</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {currentUserRank.badges.map((badge, i) => (
                  <span key={`${badge}-${i}`} className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-indigo-600">{currentUserRank.points.toLocaleString()}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentUserRank.tasks} Tasks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Badge Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <BadgeCard icon={<Flame className="text-orange-500" />} title="7 crore" desc="High Earner Legend" />
        <BadgeCard icon={<Star className="text-slate-400" />} title="Faah" desc="Just Starting Out" />
        <BadgeCard icon={<Users className="text-indigo-500" />} title="Top Supporter" desc="Community Pillar" />
        <BadgeCard icon={<Zap className="text-amber-500" />} title="Light Speed" desc="Task Master" />
      </div>
    </div>
  );
}

function BadgeCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 text-center space-y-2">
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{title}</p>
      <p className="text-[10px] font-medium text-slate-400">{desc}</p>
    </div>
  );
}
