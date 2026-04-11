import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { firebaseLogout } from './firebase';

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'reward' | 'convert' | 'transfer';
  target: string;
  amount: string;
  date: string;
  time: string;
  status: 'Completed' | 'Pending' | 'Rejected' | 'Revisions Needed';
  pocket?: string;
  hash?: string;
}

export interface Gig {
  id: string;
  title: string;
  description: string;
  category: 'Design' | 'Tech' | 'Volunteering' | 'Assets' | 'Skills' | 'Surveys';
  reward: number;
  rewardXlm?: number;
  deadline: string;
  author: string;
  authorId: string;
  status: 'Available' | 'In Progress' | 'Completed' | 'Expired';
  contactInfo: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  date: string;
  read: boolean;
}

export interface UserTask {
  id: string;
  gigId: string;
  status: 'Pending' | 'Completed' | 'Rejected' | 'Revisions Needed';
  submittedAt?: string;
  rewardClaimed: boolean;
  proofLink?: string;
}

export interface Pocket {
  id: string;
  name: string;
  balance: number;
  allocation: number; // percentage
  color: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
}

export interface ForumPost {
  id: string;
  authorId: string;
  authorName: string;
  authorBadge?: string;
  title: string;
  content: string;
  category: 'Stellar' | 'Micro-earning' | 'App' | 'General';
  likes: number;
  awards: string[];
  comments: ForumComment[];
  createdAt: string;
}

export interface ForumComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface AppState {
  studentId: string | null;
  walletAddress: string | null;
  xlm: string;
  points: string;
  kppPoints: number;
  kppTokens: string;
  transactions: Transaction[];
  pockets: Pocket[];
  savingsGoals: SavingsGoal[];
  posts: ForumPost[];
  badges: string[];
  isDarkMode: boolean;
  isBalanceVisible: boolean;
  is2FAEnabled: boolean;
  twoFactorSecret: string | null;
  appLockPassword: string | null;
  isAppLocked: boolean;
  hasTutorialSeen: boolean;
  kppId: string | null;
  avatar: string | null;
  lastLoginDate: string | null;
  loginStreak: number;
  referrals: number;
  gigs: Gig[];
  notifications: Notification[];
  userTasks: UserTask[];
  reminders: string[];
  pastUsernames: string[];
  redeemableItems: RedeemableItem[];
}

export interface RedeemableItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'College' | 'Food' | 'Tech' | 'Other';
  image?: string;
}

const INITIAL_STATE: AppState = {
  studentId: null,
  walletAddress: null,
  xlm: '125.50',
  points: '450',
  kppPoints: 450,
  kppTokens: '0',
  transactions: [
    { id: '1', type: 'send', target: 'Himalaya Canteen', amount: '-12.50 XLM', date: 'Apr 02, 2026', time: '12:30 PM', status: 'Completed', pocket: 'Food' },
    { id: '2', type: 'reward', target: 'Beta Test App', amount: '+50 PTS', date: 'Apr 01, 2026', time: '04:15 PM', status: 'Completed' },
  ],
  pockets: [
    { id: 'fees', name: 'Fees', balance: 50, allocation: 40, color: 'bg-blue-500' },
    { id: 'food', name: 'Food', balance: 30, allocation: 30, color: 'bg-orange-500' },
    { id: 'fun', name: 'Fun', balance: 20, allocation: 20, color: 'bg-pink-500' },
    { id: 'savings', name: 'Savings', balance: 25.5, allocation: 10, color: 'bg-green-500' },
  ],
  savingsGoals: [
    { id: '1', name: 'New Laptop', target: 500, current: 150, deadline: '2026-12-31' }
  ],
  posts: [
    { 
      id: '1', 
      authorId: 'ME21B001', 
      authorName: 'Twisha', 
      authorBadge: 'High Earner',
      title: 'How to earn more KPP Points?', 
      content: 'I found that the social tasks pay the most. Anyone else?', 
      category: 'Micro-earning', 
      likes: 12, 
      awards: ['Helpful'],
      comments: [],
      createdAt: new Date().toISOString()
    }
  ],
  badges: ['Token Holder'],
  isDarkMode: false,
  isBalanceVisible: false,
  is2FAEnabled: false,
  twoFactorSecret: null,
  appLockPassword: null,
  isAppLocked: false,
  hasTutorialSeen: false,
  kppId: null,
  avatar: null,
  lastLoginDate: null,
  loginStreak: 0,
  referrals: 0,
  gigs: [
    { id: 'g1', title: 'Campus Mural Design', description: 'Help design a new mural for the SAC building.', category: 'Design', reward: 500, deadline: '2026-04-15', author: 'Fine Arts Club', authorId: 'FAC001', status: 'Available', contactInfo: 'fac@campus.edu' },
    { id: 'g2', title: 'Stellar Wallet Integration', description: 'Help integrate Stellar SDK into the campus portal.', category: 'Tech', reward: 2000, deadline: '2026-04-20', author: 'Tech Club', authorId: 'TC001', status: 'Available', contactInfo: 'tech@campus.edu' },
    { id: 'g3', title: 'Library Book Sorting', description: 'Assist in sorting books in the central library.', category: 'Volunteering', reward: 200, deadline: '2026-04-10', author: 'Library Admin', authorId: 'LIB001', status: 'Available', contactInfo: 'lib@campus.edu' },
    { id: 'g4', title: 'Campus Photography', description: 'Take high-quality photos of campus events.', category: 'Assets', reward: 300, deadline: '2026-04-12', author: 'Media Cell', authorId: 'MC001', status: 'Available', contactInfo: 'media@campus.edu' },
    { id: 'g5', title: 'Python Tutoring', description: 'Teach basic Python to first-year students.', category: 'Skills', reward: 800, deadline: '2026-04-25', author: 'Coding Club', authorId: 'CC001', status: 'Available', contactInfo: 'coding@campus.edu' },
    { id: 'g6', title: 'Campus Dining Survey', description: 'Provide feedback on campus dining services.', category: 'Surveys', reward: 100, deadline: '2026-04-05', author: 'Student Council', authorId: 'SC001', status: 'Available', contactInfo: 'council@campus.edu' },
    { id: 'g7', title: 'App Beta Testing', description: 'Test the new campus navigation app.', category: 'Tech', reward: 400, deadline: '2026-04-18', author: 'App Dev Team', authorId: 'ADT001', status: 'Available', contactInfo: 'appdev@campus.edu' },
    { id: 'g8', title: 'Event Management', description: 'Help organize the upcoming cultural fest.', category: 'Volunteering', reward: 1000, deadline: '2026-05-01', author: 'Fest Committee', authorId: 'FC001', status: 'Available', contactInfo: 'fest@campus.edu' },
    { id: 'g9', title: 'Logo Design for Startup', description: 'Design a logo for a student-led startup.', category: 'Design', reward: 600, deadline: '2026-04-22', author: 'E-Cell', authorId: 'EC001', status: 'Available', contactInfo: 'ecell@campus.edu' },
    { id: 'g10', title: 'Campus Flora Documentation', description: 'Document the various plant species on campus.', category: 'Assets', reward: 500, deadline: '2026-04-30', author: 'Nature Club', authorId: 'NC001', status: 'Available', contactInfo: 'nature@campus.edu' },
  ],
  notifications: [
    { id: 'n1', title: 'Welcome!', message: 'Welcome to KPP Campus Wallet. Start earning points today!', type: 'info', date: '2026-04-02', read: false },
  ],
  userTasks: [],
  reminders: [],
  pastUsernames: [],
  redeemableItems: [
    { id: 'r1', name: 'Library Fine Waiver', description: 'Wave off up to 50 INR of library fines.', price: 500, category: 'College' },
    { id: 'r2', name: 'Canteen Voucher', description: 'Get a 100 INR voucher for the main canteen.', price: 1000, category: 'Food' },
    { id: 'r3', name: 'Tech Workshop Pass', description: 'Free entry to any one tech club workshop.', price: 1500, category: 'Tech' },
    { id: 'r4', name: 'Gym Membership (1 Month)', description: 'One month free access to the campus gym.', price: 3000, category: 'Other' },
    { id: 'r5', name: 'Printing Credits (100 Pages)', description: 'Get 100 pages of free printing at the library.', price: 400, category: 'College' },
  ],
};

export interface StoreContextType {
  state: AppState;
  login: (id: string) => void;
  logout: () => Promise<void>;
  connectWallet: (address: string) => void;
  disconnectWallet: () => void;
  updateBalance: (xlmDiff: number, pointsDiff: number, tokenDiff?: number, pocketId?: string) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'date' | 'time' | 'status' | 'hash'>) => void;
  addGig: (gig: Omit<Gig, 'id' | 'status'>) => void;
  applyToGig: (gigId: string) => void;
  completeTask: (taskId: string, proofLink: string) => void;
  verifyTask: (taskId: string, status: 'Completed' | 'Rejected' | 'Revisions Needed') => void;
  addNotification: (notif: Omit<Notification, 'id' | 'date' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  toggleReminder: (gigId: string) => void;
  transferBetweenPockets: (fromId: string, toId: string, amount: number) => void;
  addPost: (post: Omit<ForumPost, 'id' | 'likes' | 'comments' | 'createdAt' | 'awards'>) => void;
  editPost: (postId: string, title: string, content: string) => void;
  deletePost: (postId: string) => void;
  awardPost: (postId: string, award: string) => void;
  likePost: (postId: string) => void;
  toggleDarkMode: () => void;
  toggleBalanceVisibility: () => void;
  updateAvatar: (avatar: string) => void;
  checkDailyLogin: () => void;
  addReferral: () => void;
  useReferralCode: (code: string) => boolean;
  addSavingGoal: (goal: Omit<SavingsGoal, 'id' | 'current'>) => void;
  updatePocketAllocations: (newAllocations: { id: string; allocation: number }[]) => void;
  redeemItem: (itemId: string) => void;
  fundSavingGoal: (goalId: string, amount: number) => void;
  setup2FA: (secret: string) => void;
  disable2FA: () => void;
  setAppLock: (password: string) => void;
  unlockApp: (password: string) => boolean;
  disableAppLock: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('kpp_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.posts) {
        parsed.posts = parsed.posts.map((p: any) => ({
          ...p,
          awards: p.awards || []
        }));
      }
      return { ...INITIAL_STATE, ...parsed };
    }
    return INITIAL_STATE;
  });

  useEffect(() => {
    localStorage.setItem('kpp_state', JSON.stringify(state));
  }, [state]);

  const login = useCallback((id: string) => setState(s => {
    const isNew = s.studentId !== id;
    const pastUsernames = s.studentId && isNew ? [...new Set([...s.pastUsernames, s.studentId])] : s.pastUsernames;
    return { 
      ...s, 
      studentId: id,
      pastUsernames,
      kppId: s.kppId || `KPP-${id.slice(-4)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    };
  }), []);

  const logout = useCallback(async () => {
    try {
      await firebaseLogout();
    } catch (e) {
      console.error('Firebase logout failed:', e);
    }
    localStorage.removeItem('kpp_state');
    setState(INITIAL_STATE);
  }, []);

  const connectWallet = useCallback((address: string) => setState(s => ({ ...s, walletAddress: address })), []);
  const disconnectWallet = useCallback(() => setState(s => ({ ...s, walletAddress: null })), []);

  const updateBalance = useCallback((xlmDiff: number, pointsDiff: number, tokenDiff: number = 0, pocketId?: string) => {
    setState(s => {
      const xlmVal = parseFloat(s.xlm.toString().replace(/,/g, ''));
      const pointsVal = parseInt(s.points.toString().replace(/,/g, ''));
      const tokensVal = parseInt(s.kppTokens.toString().replace(/,/g, ''));
      
      const newXlm = (xlmVal + xlmDiff).toFixed(2);
      const newPoints = (pointsVal + pointsDiff).toString();
      const newKppPoints = s.kppPoints + pointsDiff;
      const newTokens = (tokensVal + tokenDiff).toString();
      
      let updatedPockets = [...(s.pockets || [])];
      if (xlmDiff > 0 && s.pockets) {
        if (pocketId) {
          updatedPockets = s.pockets.map(p => p.id === pocketId ? { ...p, balance: p.balance + xlmDiff } : p);
        } else {
          updatedPockets = s.pockets.map(p => ({
            ...p,
            balance: p.balance + (xlmDiff * (p.allocation / 100))
          }));
        }
      } else if (xlmDiff < 0 && s.pockets) {
        const targetPocketId = pocketId || s.pockets.find(p => p.balance >= Math.abs(xlmDiff))?.id || s.pockets[0]?.id;
        updatedPockets = s.pockets.map(p => 
          p.id === targetPocketId ? { ...p, balance: Math.max(0, p.balance + xlmDiff) } : p
        );
      }

      return { ...s, xlm: newXlm, points: newPoints, kppPoints: newKppPoints, kppTokens: newTokens, pockets: updatedPockets };
    });
  }, []);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'date' | 'time' | 'status' | 'hash'>) => {
    const newTx: Transaction = {
      ...tx,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'Completed',
      hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    };
    setState(s => ({ ...s, transactions: [newTx, ...s.transactions] }));
  }, []);

  const addGig = useCallback((gig: Omit<Gig, 'id' | 'status'>) => {
    const newGig: Gig = {
      ...gig,
      id: Math.random().toString(36).substr(2, 9),
      status: 'Available'
    };
    setState(s => ({ ...s, gigs: [newGig, ...s.gigs] }));
    addNotification({
      title: 'New Gig Posted',
      message: `A new gig "${gig.title}" is now available in the marketplace.`,
      type: 'info'
    });
  }, []);

  const addNotification = useCallback((notif: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const newNotif: Notification = {
      ...notif,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      read: false
    };
    setState(s => ({ ...s, notifications: [newNotif, ...s.notifications] }));
  }, []);

  const applyToGig = useCallback((gigId: string) => {
    setState(s => {
      const gig = s.gigs.find(g => g.id === gigId);
      if (!gig || gig.status !== 'Available') return s;
      
      const newTask: UserTask = {
        id: Math.random().toString(36).substr(2, 9),
        gigId,
        status: 'Pending',
        submittedAt: new Date().toISOString(),
        rewardClaimed: false
      };

      return {
        ...s,
        gigs: s.gigs.map(g => g.id === gigId ? { ...g, status: 'In Progress' } : g),
        userTasks: [...s.userTasks, newTask]
      };
    });
    addNotification({
      title: 'Application Submitted',
      message: 'Your application for the gig has been submitted successfully.',
      type: 'success'
    });
  }, []);

  const completeTask = useCallback((taskId: string, proofLink: string) => {
    setState(prev => ({
      ...prev,
      userTasks: prev.userTasks.map(t => 
        t.id === taskId ? { ...t, status: 'Pending', proofLink, submittedAt: new Date().toISOString() } : t
      )
    }));
    addNotification({
      title: 'Task Submitted',
      message: 'Your task has been submitted for verification.',
      type: 'info'
    });
  }, [addNotification]);

  const verifyTask = useCallback((taskId: string, status: 'Completed' | 'Rejected' | 'Revisions Needed') => {
    setState(s => {
      const task = s.userTasks.find(t => t.id === taskId);
      if (!task) return s;
      
      const gig = s.gigs.find(g => g.id === task.gigId);
      if (!gig) return s;

      const reward = gig.reward;
      const xlmReward = gig.rewardXlm || 0;

      let newKppPoints = s.kppPoints;
      let newTransactions = [...s.transactions];
      let newXlm = s.xlm;
      let newPoints = s.points;
      let updatedPockets = [...s.pockets];

      if (status === 'Completed' && !task.rewardClaimed) {
        newKppPoints += reward;
        
        const xlmVal = parseFloat(s.xlm.toString().replace(/,/g, ''));
        const pointsVal = parseInt(s.points.toString().replace(/,/g, ''));
        
        newXlm = (xlmVal + xlmReward).toFixed(2);
        newPoints = (pointsVal + reward).toString();

        newTransactions.unshift({
          id: Math.random().toString(36).substr(2, 9),
          type: 'reward',
          target: `Gig Completion: ${gig.title}`,
          amount: `+${reward} KPP${xlmReward > 0 ? ` / +${xlmReward} XLM` : ''}`,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          status: 'Completed'
        });

        if (xlmReward > 0) {
          updatedPockets = s.pockets.map(p => ({
            ...p,
            balance: p.balance + (xlmReward * (p.allocation / 100))
          }));
        }
      }

      return {
        ...s,
        xlm: newXlm,
        points: newPoints,
        kppPoints: newKppPoints,
        transactions: newTransactions,
        pockets: updatedPockets,
        userTasks: s.userTasks.map(t => 
          t.id === taskId ? { ...t, status, rewardClaimed: status === 'Completed' } : t
        ),
        gigs: s.gigs.map(g => g.id === task.gigId && status === 'Completed' ? { ...g, status: 'Completed' as const } : g)
      };
    });

    addNotification({
      title: `Task ${status}`,
      message: `The task has been marked as ${status}.`,
      type: status === 'Completed' ? 'success' : 'warning'
    });
  }, [addNotification]);

  const markNotificationRead = useCallback((id: string) => {
    setState(s => ({
      ...s,
      notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    }));
  }, []);

  const toggleReminder = useCallback((gigId: string) => {
    setState(s => {
      const exists = s.reminders.includes(gigId);
      const updated = exists 
        ? s.reminders.filter(id => id !== gigId)
        : [...s.reminders, gigId];
      
      if (!exists) {
        const gig = s.gigs.find(g => g.id === gigId);
        addNotification({
          title: 'Reminder Set',
          message: `We'll remind you about "${gig?.title}" before it expires.`,
          type: 'info'
        });
      }

      return { ...s, reminders: updated };
    });
  }, [addNotification]);

  const transferBetweenPockets = useCallback((fromId: string, toId: string, amount: number) => {
    if (fromId === toId || amount <= 0) return;
    setState(s => {
      const fromPocket = s.pockets.find(p => p.id === fromId);
      const toPocket = s.pockets.find(p => p.id === toId);
      if (!fromPocket || !toPocket || fromPocket.balance < amount) return s;

      const updatedPockets = s.pockets.map(p => {
        if (p.id === fromId) return { ...p, balance: p.balance - amount };
        if (p.id === toId) return { ...p, balance: p.balance + amount };
        return p;
      });

      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'transfer',
        target: `Pocket Transfer: ${fromPocket.name} to ${toPocket.name}`,
        amount: `${amount.toFixed(2)} XLM`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'Completed',
        hash: Math.random().toString(16).substr(2, 32)
      };

      return { ...s, pockets: updatedPockets, transactions: [newTx, ...s.transactions] };
    });
  }, []);

  const updatePocketAllocations = useCallback((newAllocations: { id: string; allocation: number }[]) => {
    setState(s => ({
      ...s,
      pockets: s.pockets.map(p => {
        const match = newAllocations.find(a => a.id === p.id);
        return match ? { ...p, allocation: match.allocation } : p;
      })
    }));
  }, []);

  const addPost = useCallback((post: Omit<ForumPost, 'id' | 'likes' | 'comments' | 'createdAt' | 'awards'>) => {
    const newPost: ForumPost = {
      ...post,
      id: Math.random().toString(36).substr(2, 9),
      likes: 0,
      awards: [],
      comments: [],
      createdAt: new Date().toISOString()
    };
    setState(s => ({ ...s, posts: [newPost, ...s.posts] }));
  }, []);

  const editPost = useCallback((postId: string, title: string, content: string) => {
    setState(s => ({
      ...s,
      posts: s.posts.map(p => p.id === postId ? { ...p, title, content } : p)
    }));
  }, []);

  const deletePost = useCallback((postId: string) => {
    setState(s => ({
      ...s,
      posts: s.posts.filter(p => p.id !== postId)
    }));
  }, []);

  const awardPost = useCallback((postId: string, award: string) => {
    setState(s => ({
      ...s,
      posts: s.posts.map(p => p.id === postId ? { ...p, awards: [...(p.awards || []), award] } : p)
    }));
    addNotification({
      title: 'Post Awarded!',
      message: `A post has been awarded with "${award}".`,
      type: 'success'
    });
  }, [addNotification]);

  const likePost = useCallback((postId: string) => {
    setState(s => ({
      ...s,
      posts: s.posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p)
    }));
  }, []);

  const toggleDarkMode = useCallback(() => setState(s => ({ ...s, isDarkMode: !s.isDarkMode })), []);
  const toggleBalanceVisibility = useCallback(() => setState(s => ({ ...s, isBalanceVisible: !s.isBalanceVisible })), []);
  const updateAvatar = useCallback((avatar: string) => setState(s => ({ ...s, avatar })), []);
  
  const checkDailyLogin = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setState(s => {
      if (s.lastLoginDate === today) return s;
      
      const newPoints = (parseInt(s.points) + 100).toString();
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const newStreak = s.lastLoginDate === yesterday ? s.loginStreak + 1 : 1;

      let bonusXlm = 0;
      if (newStreak > 0 && newStreak % 30 === 0) {
        bonusXlm = 1;
      }

      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'reward',
        target: 'Daily Login Bonus',
        amount: '+100 PTS',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'Completed',
        hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      };

      const newNotif: Notification = {
        id: Math.random().toString(36).substr(2, 9),
        title: 'Daily Bonus!',
        message: `You earned 100 PTS for logging in today! Streak: ${newStreak} days.`,
        type: 'success',
        date: today,
        read: false
      };

      const updatedTransactions = [newTx, ...s.transactions];
      const updatedNotifications = [newNotif, ...s.notifications];

      if (bonusXlm > 0) {
        updatedTransactions.unshift({
          id: Math.random().toString(36).substr(2, 9),
          type: 'reward',
          target: 'Consistency Bonus',
          amount: '+1.00 XLM',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          status: 'Completed',
          hash: Math.random().toString(16).substr(2, 32)
        });
        updatedNotifications.unshift({
          id: Math.random().toString(36).substr(2, 9),
          title: 'Consistency Bonus!',
          message: `Wow! ${newStreak} days streak. You earned a bonus 1.00 XLM!`,
          type: 'success',
          date: today,
          read: false
        });
      }

      return {
        ...s,
        points: newPoints,
        xlm: (parseFloat(s.xlm) + bonusXlm).toFixed(2),
        lastLoginDate: today,
        loginStreak: newStreak,
        transactions: updatedTransactions,
        notifications: updatedNotifications
      };
    });
  }, []);

  const addReferral = useCallback(() => {
    setState(s => {
      const newPoints = (parseInt(s.points) + 1500).toString();
      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'reward',
        target: 'Referral Bonus',
        amount: '+1500 PTS',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'Completed',
        hash: Math.random().toString(16).substr(2, 32)
      };

      return {
        ...s,
        points: newPoints,
        kppPoints: s.kppPoints + 1500,
        referrals: s.referrals + 1,
        transactions: [newTx, ...s.transactions]
      };
    });
    addNotification({
      title: 'Referral Successful!',
      message: 'You earned 1500 PTS for a successful referral.',
      type: 'success'
    });
  }, [addNotification]);

  const useReferralCode = useCallback((code: string) => {
    if (code.length < 4) return false;

    setState(s => {
      const newPoints = (parseInt(s.points) + 100).toString();
      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'reward',
        target: `Referral Code: ${code}`,
        amount: '+100 PTS',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'Completed',
        hash: Math.random().toString(16).substr(2, 32)
      };

      return {
        ...s,
        points: newPoints,
        kppPoints: s.kppPoints + 100,
        transactions: [newTx, ...s.transactions]
      };
    });

    addNotification({
      title: 'Referral Code Applied!',
      message: 'You earned 100 KPP Points for using a referral code.',
      type: 'success'
    });
    return true;
  }, [addNotification]);

  const addSavingGoal = useCallback((goal: Omit<SavingsGoal, 'id' | 'current'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: Math.random().toString(36).substr(2, 9),
      current: 0
    };
    setState(s => ({ ...s, savingsGoals: [...s.savingsGoals, newGoal] }));
  }, []);

  const redeemItem = useCallback((itemId: string) => {
    setState(s => {
      const item = s.redeemableItems.find(i => i.id === itemId);
      if (!item || s.kppPoints < item.price) return s;

      const newPoints = (parseInt(s.points) - item.price).toString();
      const newKppPoints = s.kppPoints - item.price;

      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'send',
        target: `Redemption: ${item.name}`,
        amount: `-${item.price} PTS`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'Completed',
        hash: Math.random().toString(16).substr(2, 32)
      };

      return {
        ...s,
        points: newPoints,
        kppPoints: newKppPoints,
        transactions: [newTx, ...s.transactions]
      };
    });

    addNotification({
      title: 'Redemption Successful!',
      message: 'Your item has been redeemed. Check your email for details.',
      type: 'success'
    });
  }, [addNotification]);

  const fundSavingGoal = useCallback((goalId: string, amount: number) => {
    setState(s => {
      const goal = s.savingsGoals.find(g => g.id === goalId);
      const savingsPocket = s.pockets.find(p => p.id === 'savings');
      
      if (!goal || !savingsPocket || savingsPocket.balance < amount || amount <= 0) {
        return s;
      }

      const updatedGoals = s.savingsGoals.map(g => 
        g.id === goalId ? { ...g, current: g.current + amount } : g
      );

      const updatedPockets = s.pockets.map(p => 
        p.id === 'savings' ? { ...p, balance: p.balance - amount } : p
      );

      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'transfer',
        target: `Goal Funding: ${goal.name}`,
        amount: `${amount.toFixed(2)} XLM`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'Completed',
        hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      };

      return { 
        ...s, 
        savingsGoals: updatedGoals, 
        pockets: updatedPockets,
        transactions: [newTx, ...s.transactions]
      };
    });
  }, []);

  const setup2FA = useCallback((secret: string) => {
    setState(s => ({ ...s, is2FAEnabled: true, twoFactorSecret: secret }));
    addNotification({
      title: '2FA Enabled',
      message: 'Two-factor authentication has been successfully set up.',
      type: 'success'
    });
  }, [addNotification]);

  const disable2FA = useCallback(() => {
    setState(s => ({ ...s, is2FAEnabled: false, twoFactorSecret: null }));
    addNotification({
      title: '2FA Disabled',
      message: 'Two-factor authentication has been disabled.',
      type: 'warning'
    });
  }, [addNotification]);

  const setAppLock = useCallback((password: string) => {
    setState(s => ({ ...s, appLockPassword: password }));
    addNotification({
      title: 'App Lock Set',
      message: 'Your application lock password has been updated.',
      type: 'success'
    });
  }, [addNotification]);

  const unlockApp = useCallback((password: string) => {
    let success = false;
    setState(s => {
      if (s.appLockPassword === password) {
        success = true;
        return { ...s, isAppLocked: false };
      }
      return s;
    });
    return success;
  }, []);

  const disableAppLock = useCallback(() => {
    setState(s => ({ ...s, appLockPassword: null, isAppLocked: false }));
    addNotification({
      title: 'App Lock Disabled',
      message: 'Application lock has been removed.',
      type: 'warning'
    });
  }, [addNotification]);

  const value = {
    state,
    login,
    logout,
    connectWallet,
    disconnectWallet,
    updateBalance,
    addTransaction,
    addGig,
    applyToGig,
    completeTask,
    verifyTask,
    addNotification,
    markNotificationRead,
    toggleReminder,
    transferBetweenPockets,
    addPost,
    editPost,
    deletePost,
    awardPost,
    likePost,
    toggleDarkMode,
    toggleBalanceVisibility,
    updateAvatar,
    checkDailyLogin,
    addReferral,
    useReferralCode,
    addSavingGoal,
    updatePocketAllocations,
    redeemItem,
    fundSavingGoal,
    setup2FA,
    disable2FA,
    setAppLock,
    unlockApp,
    disableAppLock
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
