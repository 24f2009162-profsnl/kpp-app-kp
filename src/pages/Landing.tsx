import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, MessageSquare, User, Send, X } from 'lucide-react';
import { useStore } from '../services/store';

export default function Landing() {
  const navigate = useNavigate();
  const { state, setShowLoginModal } = useStore();
  const [showContactModal, setShowContactModal] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending
    setShowContactModal(false);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-slate-950 text-white relative overflow-hidden flex flex-col items-center justify-center p-6 sm:p-12"
    >
      {/* Dynamic Background Spotlight */}
      <motion.div 
        className="pointer-events-none absolute z-20 w-[800px] h-[800px] rounded-full opacity-20 hidden md:block"
        animate={{
          x: mousePos.x - 400,
          y: mousePos.y - 400,
        }}
        transition={{ type: 'spring', damping: 40, stiffness: 150, mass: 0.8 }}
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.5) 0%, rgba(99, 102, 241, 0) 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-30 text-center space-y-12 max-w-5xl relative"
      >
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
          <Zap size={14} className="animate-pulse" />
          KPP v2.0 Platform
        </div>
        
        <div className="relative">
          <h1 className="text-[5rem] md:text-[12rem] font-black tracking-tighter leading-[0.85] relative z-10 select-none flex flex-col items-center">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } }
              }}
              className="flex"
            >
              {"KOIN".split("").map((char, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { y: 100, opacity: 0, scale: 0.8 },
                    visible: { y: 0, opacity: 1, scale: 1 }
                  }}
                  transition={{ 
                    type: "spring", 
                    damping: 15, 
                    stiffness: 150 
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.div>
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } }
              }}
              className="flex text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-500"
            >
              {"KPP".split("").map((char, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { y: 100, opacity: 0, scale: 0.8 },
                    visible: { y: 0, opacity: 1, scale: 1 }
                  }}
                  transition={{ 
                    type: "spring", 
                    damping: 15, 
                    stiffness: 150 
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.div>
          </h1>
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.15 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 pointer-events-none"
          >
             <img 
               src="https://picsum.photos/seed/vault/1000/1000" 
               alt="Vault" 
               className="w-[30rem] md:w-[45rem] rounded-full grayscale brightness-200"
               referrerPolicy="no-referrer"
             />
          </motion.div>
        </div>
        
        <p className="text-slate-400 text-lg font-medium max-w-4xl mx-auto leading-relaxed">
          Kaiitzn Pocket Pay helps students and creators take control of their finances by tracking 3,000+ assets.<br />
          Built on Stellar and XLM, our secure platform is designed specifically for the fast-paced campus economy.<br />
          The ultimate financial ecosystem for students that works seamlessly with all national banks.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-6">
          <button 
            onClick={() => {
              if (state.studentId) {
                navigate('/dashboard');
              } else {
                setShowLoginModal(true);
              }
            }}
            className="group relative px-12 py-6 rounded-[2rem] bg-indigo-600 text-white font-black shadow-[0_0_50px_rgba(79,70,229,0.3)] hover:scale-105 hover:bg-indigo-500 transition-all active:scale-95 flex items-center gap-3 overflow-hidden"
          >
            Start Free Analysis
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={() => setShowContactModal(true)}
            className="group relative px-12 py-6 rounded-[2rem] bg-slate-900 border border-slate-800 font-black text-white hover:bg-slate-800 hover:border-slate-700 transition-all flex items-center gap-3 shadow-2xl"
          >
            <div className="p-2 bg-indigo-500/10 rounded-xl">
              <Mail size={18} className="text-indigo-400 group-hover:rotate-12 transition-transform" />
            </div>
            Contact Us
          </button>
        </div>
      </motion.div>

      {/* Floating Elements Background */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-600/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-600/10 rounded-full blur-[100px] animate-pulse" />

      {/* Contact Modal */}
      <AnimatePresence>
        {showContactModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-[3.5rem] p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              {/* Modal Spotlight */}
              <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter mb-2">Get in Touch</h2>
                    <p className="text-slate-400 font-medium">Have a question? We're here to help.</p>
                  </div>
                  <button 
                    onClick={() => setShowContactModal(false)}
                    className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-95"
                  >
                    <X size={28} />
                  </button>
                </div>

                <form className="space-y-8" onSubmit={handleSubmit}>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Full Name</label>
                    <div className="relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 p-1.5 bg-slate-800 rounded-lg group-focus-within:bg-indigo-500 transition-colors">
                        <User size={16} className="text-slate-400 group-focus-within:text-white" />
                      </div>
                      <input 
                        type="text" 
                        required 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Twisha Shriyam" 
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-6 pl-16 pr-8 outline-none focus:border-indigo-500 focus:bg-slate-950 transition-all font-bold text-white text-lg placeholder:text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Email Address</label>
                    <div className="relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 p-1.5 bg-slate-800 rounded-lg group-focus-within:bg-indigo-500 transition-colors">
                        <Mail size={16} className="text-slate-400 group-focus-within:text-white" />
                      </div>
                      <input 
                        type="email" 
                        required 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="twisha@example.com" 
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-6 pl-16 pr-8 outline-none focus:border-indigo-500 focus:bg-slate-950 transition-all font-bold text-white text-lg placeholder:text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Your Message</label>
                    <div className="relative group">
                      <div className="absolute left-6 top-7 p-1.5 bg-slate-800 rounded-lg group-focus-within:bg-indigo-500 transition-colors">
                        <MessageSquare size={16} className="text-slate-400 group-focus-within:text-white" />
                      </div>
                      <textarea 
                        required 
                        rows={5} 
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        placeholder="Tell us what's on your mind..." 
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-6 pl-16 pr-8 outline-none focus:border-indigo-500 focus:bg-slate-950 transition-all font-bold text-white text-lg placeholder:text-slate-700 resize-none"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="group w-full py-6 bg-indigo-600 rounded-2xl font-black text-white shadow-[0_20px_40px_rgba(79,70,229,0.3)] hover:bg-indigo-500 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
                  >
                    Send Message
                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Zap = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
