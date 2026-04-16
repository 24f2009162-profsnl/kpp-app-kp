import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Wallet, Shield, Zap } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden flex flex-col items-center justify-center p-6 moon-arc-container">
      {/* Decorative Arcs */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[150%] aspect-square rounded-full border border-indigo-500/20 pointer-events-none" />
      <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[150%] aspect-square rounded-full border border-blue-500/20 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center space-y-8 max-w-2xl"
      >
        <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest mb-4">
          Welcome to KPP v2.0
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
          Take Control <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
            of your Finances
          </span>
        </h1>
        
        <p className="text-slate-400 text-lg font-medium">
          Discover a user-friendly platform for tracking over 3,000 financial assets. 
          Secure, fast, and built for the campus economy.
        </p>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="group relative px-8 py-4 rounded-2xl bg-indigo-600 font-black text-white shadow-2xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
          >
            Get Started Now
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 font-black text-white hover:bg-white/10 transition-all">
            Learn More
          </button>
        </div>
      </motion.div>

      {/* Feature Cards */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 z-10 w-full max-w-5xl">
        <FeatureCard 
          icon={<Wallet className="text-indigo-400" />}
          title="Stellar Wallet"
          desc="Seamlessly manage your XLM and KPP points on the Stellar network."
        />
        <FeatureCard 
          icon={<Shield className="text-blue-400" />}
          title="Secure Assets"
          desc="Enterprise-grade security with real 2FA and app locking mechanisms."
        />
        <FeatureCard 
          icon={<Zap className="text-amber-400" />}
          title="Instant Pay"
          desc="Send and receive payments across campus in seconds with zero fees."
        />
      </div>

      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 rounded-[2.5rem] glass-card space-y-4"
    >
      <div className="p-3 bg-white/5 rounded-2xl w-fit">
        {icon}
      </div>
      <h3 className="text-xl font-black">{title}</h3>
      <p className="text-slate-400 text-sm font-medium leading-relaxed">{desc}</p>
    </motion.div>
  );
}
