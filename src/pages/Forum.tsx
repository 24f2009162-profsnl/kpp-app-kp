import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Heart, 
  MessageCircle, 
  X,
  Send,
  MoreVertical,
  Award,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../services/store';

export default function Forum() {
  const { state, addPost, editPost, deletePost, awardPost, likePost } = useStore();
  const [showNewPost, setShowNewPost] = useState(false);
  const [showEditPost, setShowEditPost] = useState<string | null>(null);
  const [showAwardModal, setShowAwardModal] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' as any });
  const [editingPost, setEditingPost] = useState({ title: '', content: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPost.title && newPost.content) {
      addPost({
        authorId: state.studentId || 'Anonymous',
        authorName: state.studentId || 'Anonymous',
        authorBadge: state.badges[0],
        ...newPost
      });
      setNewPost({ title: '', content: '', category: 'General' });
      setShowNewPost(false);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showEditPost && editingPost.title && editingPost.content) {
      editPost(showEditPost, editingPost.title, editingPost.content);
      setShowEditPost(null);
    }
  };

  const handleAward = (postId: string, award: string) => {
    awardPost(postId, award);
    setShowAwardModal(null);
  };

  const AWARDS = [
    { label: 'Helpful', icon: '🌟', color: 'bg-amber-100 text-amber-600' },
    { label: 'Creative', icon: '🎨', color: 'bg-purple-100 text-purple-600' },
    { label: 'Stellar', icon: '🚀', color: 'bg-blue-100 text-blue-600' },
    { label: 'Friendly', icon: '🤝', color: 'bg-green-100 text-green-600' },
  ];

  return (
    <div className="space-y-8 pb-20 p-8 rounded-[3rem] pop-art-pattern border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-8 rounded-3xl border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden md:block">
          <img 
            src="https://picsum.photos/seed/student-collage/400/400" 
            alt="Decorative" 
            className="h-full w-full object-cover grayscale contrast-125"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter">Campus Forum</h1>
          <p className="text-slate-600 font-bold">Discuss Stellar, micro-earning, and campus life.</p>
        </div>
        <button 
          onClick={() => setShowNewPost(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-black text-white border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          <Plus size={20} /> Start Discussion
        </button>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search discussions..." 
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 pl-12 pr-6 outline-none focus:border-indigo-500 transition-all font-medium dark:text-white"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          {['All', 'Stellar', 'Micro-earning', 'App', 'General'].map((cat) => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`whitespace-nowrap rounded-2xl px-6 py-4 text-sm font-black transition-all ${filter === cat ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {state.posts.filter(p => filter === 'All' || p.category === filter).map(post => (
          <motion.article 
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 space-y-6 relative"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                  {post.authorName.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-slate-900 dark:text-white">{post.authorName}</h4>
                    {post.authorId !== 'Anonymous' && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/50">
                        <Check size={10} /> Verified Student
                      </div>
                    )}
                    {post.authorBadge && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[8px] font-black uppercase tracking-widest border border-amber-100 dark:border-amber-900/50">
                        {post.authorBadge}
                      </span>
                    )}
                    <div className="flex gap-1">
                      {post.awards?.map((award, i) => {
                        const awardInfo = AWARDS.find(a => a.label === award);
                        return (
                          <span key={`${award}-${i}`} title={award} className={`px-1.5 py-0.5 rounded-lg ${awardInfo?.color || 'bg-slate-100'} text-[10px] font-bold flex items-center gap-1`}>
                            {awardInfo?.icon}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {new Date(post.createdAt).toLocaleDateString()} • {post.category}
                  </p>
                </div>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowMenu(showMenu === post.id ? null : post.id)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2"
                >
                  <MoreVertical size={20} />
                </button>
                
                <AnimatePresence>
                  {showMenu === post.id && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 z-10 overflow-hidden"
                    >
                      <button 
                        onClick={() => {
                          setEditingPost({ title: post.title, content: post.content });
                          setShowEditPost(post.id);
                          setShowMenu(null);
                        }}
                        className="w-full px-6 py-3 text-left text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        Edit Post
                      </button>
                      <button 
                        onClick={() => {
                          deletePost(post.id);
                          setShowMenu(null);
                        }}
                        className="w-full px-6 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        Delete Post
                      </button>
                      <button 
                        onClick={() => {
                          setShowAwardModal(post.id);
                          setShowMenu(null);
                        }}
                        className="w-full px-6 py-3 text-left text-sm font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                      >
                        Award Post
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{post.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{post.content}</p>
            </div>

            <div className="flex items-center gap-6 pt-4 border-t border-slate-50 dark:border-slate-800">
              <button 
                onClick={() => likePost(post.id)}
                className="flex items-center gap-2 text-slate-500 hover:text-pink-500 transition-colors group"
              >
                <Heart size={20} className="group-active:scale-125 transition-transform" />
                <span className="text-sm font-bold">{post.likes}</span>
              </button>
              <button className="flex items-center gap-2 text-slate-500 hover:text-indigo-500 transition-colors">
                <MessageCircle size={20} />
                <span className="text-sm font-bold">{post.comments.length}</span>
              </button>
              <button 
                onClick={() => setShowAwardModal(post.id)}
                className="flex items-center gap-2 text-slate-500 hover:text-amber-500 transition-colors ml-auto"
              >
                <Award size={20} />
                <span className="text-sm font-bold uppercase tracking-widest text-[10px]">Award</span>
              </button>
            </div>
          </motion.article>
        ))}
      </div>

      <AnimatePresence>
        {showNewPost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl rounded-[3rem] bg-white dark:bg-slate-900 p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">New Discussion</h2>
                <button onClick={() => setShowNewPost(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Category</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {['Stellar', 'Micro-earning', 'App', 'General'].map((cat) => (
                      <button 
                        key={cat}
                        type="button"
                        onClick={() => setNewPost(p => ({ ...p, category: cat as any }))}
                        className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-black transition-all ${newPost.category === cat ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Title</label>
                  <input 
                    type="text" 
                    required
                    value={newPost.title}
                    onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))}
                    placeholder="What's on your mind?"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-4 px-6 outline-none focus:border-indigo-500 transition-all font-bold dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Content</label>
                  <textarea 
                    required
                    rows={5}
                    value={newPost.content}
                    onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
                    placeholder="Share your thoughts with the campus..."
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-4 px-6 outline-none focus:border-indigo-500 transition-all font-medium dark:text-white resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full rounded-2xl bg-indigo-600 py-5 font-black text-white shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                >
                  <Send size={20} /> Post to Forum
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showEditPost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl rounded-[3rem] bg-white dark:bg-slate-900 p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Edit Discussion</h2>
                <button onClick={() => setShowEditPost(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Title</label>
                  <input 
                    type="text" 
                    required
                    value={editingPost.title}
                    onChange={e => setEditingPost(p => ({ ...p, title: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-4 px-6 outline-none focus:border-indigo-500 transition-all font-bold dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Content</label>
                  <textarea 
                    required
                    rows={5}
                    value={editingPost.content}
                    onChange={e => setEditingPost(p => ({ ...p, content: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-4 px-6 outline-none focus:border-indigo-500 transition-all font-medium dark:text-white resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full rounded-2xl bg-indigo-600 py-5 font-black text-white shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                >
                  <Check size={20} /> Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showAwardModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-[3rem] bg-white dark:bg-slate-900 p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Award Post</h2>
                <button onClick={() => setShowAwardModal(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {AWARDS.map((award) => (
                  <button 
                    key={award.label}
                    onClick={() => handleAward(showAwardModal, award.label)}
                    className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-indigo-500 transition-all group"
                  >
                    <span className="text-4xl group-hover:scale-110 transition-transform">{award.icon}</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{award.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
