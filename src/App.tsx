/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, Plus, Home, HeartPulse, Pill, Shield, Bell, Info, TrendingUp, Activity, Baby, Droplets, Calendar, ChevronRight, Clock, CheckCircle2, AlertCircle, CalendarDays, Upload, Scan, Lock, FileText, Folder, MoreVertical, ArrowUpRight, AlertTriangle, Stethoscope, Microscope, X, Share2, Moon, Sun, LogOut, Settings, User } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion, LayoutGroup } from 'motion/react';
import { useState, useEffect } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

// Global Animation Constants
const EASE_OUT_QUAD = [0.25, 0.46, 0.45, 0.94];
const POND_EASE = [0.22, 1, 0.36, 1];
const DEFAULT_SPRING = { stiffness: 280, damping: 24, mass: 0.8 };
const NAV_SPRING = { stiffness: 400, damping: 18 };
const NOTIF_SPRING = { stiffness: 320, damping: 26 };

export default function App() {
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showVaultAuth, setShowVaultAuth] = useState(false);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [vaultPin, setVaultPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showPreVisitSummary, setShowPreVisitSummary] = useState(false);
  const [selectedDate, setSelectedDate] = useState('20');
  const [selectedVitalsCondition, setSelectedVitalsCondition] = useState('Diabetes');
  const [homeViewMode, setHomeViewMode] = useState('today');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);

  // Staggered Entrance Variants
  const listContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.08,
        staggerChildren: 0.05
      }
    }
  };

  const listItemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: EASE_OUT_QUAD }
    }
  };

  const [medicines, setMedicines] = useState([
    { 
      id: 1, 
      name: 'Metformin', 
      dosage: '500mg', 
      frequency: '1–0–1 after meals', 
      time: '09:00 am', 
      condition: 'Diabetes', 
      taken: false, 
      stock: 12,
      totalStock: 30,
      daysLeft: 6
    },
    { 
      id: 2, 
      name: 'Thyronorm', 
      dosage: '50mcg', 
      frequency: '1–0–0 empty stomach', 
      time: '07:00 am', 
      condition: 'Thyroid', 
      taken: true, 
      stock: 4,
      totalStock: 30,
      daysLeft: 2
    },
    { 
      id: 3, 
      name: 'Telmisartan', 
      dosage: '40mg', 
      frequency: '0–0–1 before bed', 
      time: '10:00 pm', 
      condition: 'BP', 
      taken: false, 
      stock: 15,
      totalStock: 30,
      daysLeft: 15
    },
    { 
      id: 4, 
      name: 'Vitamin D3', 
      dosage: '60k IU', 
      frequency: 'Once a week', 
      time: '11:00 am', 
      condition: 'General', 
      taken: false, 
      stock: 2,
      totalStock: 4,
      daysLeft: 14
    }
  ]);

  const toggleMedicineTaken = (id: number) => {
    setMedicines(prev => prev.map(med => {
      if (med.id === id) {
        const newTaken = !med.taken;
        return {
          ...med,
          taken: newTaken,
          stock: newTaken ? Math.max(0, med.stock - 1) : med.stock + 1
        };
      }
      return med;
    }));
  };

  const takenCount = medicines.filter(m => m.taken).length;
  const totalCount = medicines.length;
  const progress = (takenCount / totalCount) * 100;

  const handlePinInput = (digit: string) => {
    if (vaultPin.length < 4) {
      const newPin = vaultPin + digit;
      setVaultPin(newPin);
      if (newPin.length === 4) {
        if (newPin === '1234') {
          setIsVaultUnlocked(true);
          setShowVaultAuth(false);
          setVaultPin('');
        } else {
          setPinError(true);
          setTimeout(() => {
            setVaultPin('');
            setPinError(false);
          }, 1000);
        }
      }
    }
  };

  const conditions = [
    { id: 'All', label: 'All', color: '#1A1C1E' },
    { id: 'Diabetes', label: 'Diabetes', color: '#FFB300' },
    { id: 'Thyroid', label: 'Thyroid', color: '#9C27B0' },
    { id: 'Kidney', label: 'Kidney', color: '#2196F3' },
    { id: 'Heart', label: 'Heart', color: '#F44336' },
  ];

  const dailyLogsData = [
    { day: 'Mon', value: 95 },
    { day: 'Tue', value: 102 },
    { day: 'Wed', value: 98 },
    { day: 'Thu', value: 105 },
    { day: 'Fri', value: 97 },
    { day: 'Sat', value: 98 },
    { day: 'Sun', value: 96 },
  ];

  const vaultCategories = [
    { id: 'tests', label: 'Tests', icon: Microscope, count: 12, lastDate: 'Oct 12', color: '#E3F2FD', iconColor: '#1976D2' },
    { id: 'medicines', label: 'Medicines', icon: Pill, count: 8, lastDate: 'Oct 10', color: '#F3E5F5', iconColor: '#7B1FA2' },
    { id: 'scans', label: 'Scans', icon: Folder, count: 3, lastDate: 'Sep 15', color: '#FFF3E0', iconColor: '#E65100' },
    { id: 'visits', label: 'Doctor Visits', icon: Stethoscope, count: 5, lastDate: 'Oct 01', color: '#E8F5E9', iconColor: '#2E7D32' },
  ];

  const recentRecords = [
    { id: 1, name: 'HbA1c Report', date: 'Oct 12, 2025', condition: 'Diabetes', flag: 'High', trend: 'up', type: 'PDF' },
    { id: 2, name: 'TSH Level', date: 'Oct 05, 2025', condition: 'Thyroid', flag: 'Normal', trend: 'down', type: 'PDF' },
    { id: 3, name: 'Lipid Profile', date: 'Sep 28, 2025', condition: 'Heart', flag: 'High', trend: 'stable', type: 'JPG' },
  ];

  const filteredRecords = recentRecords.filter(r => selectedCondition === 'All' || r.condition === selectedCondition);

  return (
    <div className={`relative min-h-screen w-full overflow-hidden flex items-center justify-center p-0 sm:p-4 transition-colors duration-500 ${isDarkMode ? 'bg-dark-maroon dark' : 'bg-white'}`}>
      {/* Ambient Background Glows */}
      <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full pointer-events-none transition-opacity duration-500 ${isDarkMode ? 'bg-maroon/10 opacity-100' : 'bg-maroon/5 opacity-100'}`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full pointer-events-none transition-opacity duration-500 ${isDarkMode ? 'bg-maroon/10 opacity-100' : 'bg-maroon/5 opacity-100'}`} />

      {/* Mobile Frame Container */}
      <div className={`relative z-10 w-full max-w-[430px] h-full sm:h-[850px] overflow-hidden flex flex-col transition-all duration-500 sm:rounded-[3.5rem] ${isDarkMode ? 'bg-white/[0.02] backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] border-white/[0.05]' : 'bg-white shadow-[0_0_100px_rgba(0,0,0,0.05)] border-black/[0.03]'}`}>
        
        {/* Header */}
        <header className="px-6 pt-10 pb-4 flex items-center justify-between z-40 bg-transparent sticky top-0">
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className={`w-10 h-10 rounded-full overflow-hidden border shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all ${isDarkMode ? 'border-white/[0.1]' : 'border-black/[0.05]'}`}
            >
              <img 
                src="https://picsum.photos/seed/eva/100/100" 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className={`text-lg font-light transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-black'}`}>Hi, Eva</span>
                <span className="text-lg">✨</span>
              </div>
            </div>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {isProfileMenuOpen && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="fixed inset-0 z-40"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className={`absolute left-6 top-24 w-64 rounded-[2rem] shadow-2xl border overflow-hidden z-50 origin-top-left ${isDarkMode ? 'bg-[#1A1C1E] border-white/[0.2]' : 'bg-white border-black/[0.05]'}`}
                  >
                    <div className={`p-5 border-b ${isDarkMode ? 'border-white/[0.05]' : 'border-black/[0.05]'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-maroon/20">
                          <img src="https://picsum.photos/seed/eva/100/100" alt="Eva" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>Eva Sharma</p>
                          <p className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>Premium Member</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${isDarkMode ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-black/60 hover:bg-black/5 hover:text-black'}`}>
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">My Profile</span>
                      </button>
                      <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${isDarkMode ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-black/60 hover:bg-black/5 hover:text-black'}`}>
                        <Settings className="w-4 h-4" />
                        <span className="text-sm font-medium">Settings</span>
                      </button>
                      
                      {/* Dark Mode Toggle */}
                      <div className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
                        <div className="flex items-center gap-3">
                          {isDarkMode ? <Moon className="w-4 h-4 text-maroon" /> : <Sun className="w-4 h-4 text-maroon" />}
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>Dark Mode</span>
                        </div>
                        <button 
                          onClick={() => setIsDarkMode(!isDarkMode)}
                          className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${isDarkMode ? 'bg-maroon' : 'bg-black/10'}`}
                        >
                          <motion.div 
                            animate={{ x: isDarkMode ? 20 : 2 }}
                            className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                          />
                        </button>
                      </div>
                    </div>

                    <div className={`p-2 mt-1 border-t ${isDarkMode ? 'border-white/[0.05]' : 'border-black/[0.05]'}`}>
                      <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-maroon hover:bg-maroon/5 transition-colors">
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
                <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95 border ${isDarkMode ? 'bg-white/[0.05] border-white/[0.05] hover:bg-white/[0.1]' : 'bg-black/[0.03] border-black/[0.03] hover:bg-black/[0.06]'}`}
            >
              <Search className={`w-5 h-5 ${isDarkMode ? 'text-white/60' : 'text-black/60'}`} />
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`w-10 h-10 flex items-center justify-center rounded-full relative transition-all active:scale-95 border ${isDarkMode ? 'bg-white/[0.05] border-white/[0.05] hover:bg-white/[0.1]' : 'bg-black/[0.03] border-black/[0.03] hover:bg-black/[0.06]'}`}
              >
                <Bell className={`w-5 h-5 ${isDarkMode ? 'text-white/60' : 'text-black/60'}`} />
                <div className={`absolute top-3 right-3 w-2 h-2 bg-maroon rounded-full border-2 shadow-[0_0_10px_rgba(192,32,62,0.3)] ${isDarkMode ? 'border-dark-maroon' : 'border-white'}`} />
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 0, scale: 0.98, filter: "blur(5px)" }}
                    transition={shouldReduceMotion ? { duration: 0.15 } : { 
                      type: "spring", 
                      ...NOTIF_SPRING,
                      exit: { duration: 0.18, ease: "easeIn" }
                    }}
                    className={`absolute right-0 mt-4 w-82 rounded-[2rem] shadow-2xl border overflow-hidden z-50 origin-top-right ${isDarkMode ? 'bg-[#1A1C1E] border-white/[0.2]' : 'bg-white border-black/[0.05]'}`}
                  >
                    <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-white/[0.05]' : 'border-black/[0.05]'}`}>
                      <span className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>Reminders</span>
                      <button className="text-[10px] font-bold text-maroon uppercase tracking-widest hover:bg-maroon/10 px-3 py-1.5 rounded-full transition-colors">Mark all read</button>
                    </div>
                    <motion.div 
                      initial="hidden"
                      animate="visible"
                      className="max-h-[400px] overflow-y-auto no-scrollbar"
                    >
                      {[
                        { title: 'Medicine Refill', desc: 'Thyronorm is running low (4 pills left)', time: '2m ago', icon: Pill, color: 'text-maroon', bg: 'bg-maroon/10' },
                        { title: 'Upcoming Visit', desc: 'Appointment with Dr. Aris tomorrow', time: '1h ago', icon: Calendar, color: isDarkMode ? 'text-white/60' : 'text-black/60', bg: isDarkMode ? 'bg-white/5' : 'bg-black/5' },
                        { title: 'Daily Log', desc: 'You haven\'t logged your BP today', time: '3h ago', icon: Activity, color: 'text-maroon/60', bg: 'bg-maroon/5' },
                      ].map((note, i) => (
                        <motion.div 
                          key={i} 
                          variants={{
                            hidden: { opacity: 0, x: -6 },
                            visible: { opacity: 1, x: 0 }
                          }}
                          className={`p-5 flex gap-4 transition-all cursor-pointer border-b last:border-0 group ${isDarkMode ? 'hover:bg-white/[0.03] border-white/[0.03]' : 'hover:bg-black/[0.02] border-black/[0.03]'}`}
                        >
                          <div className={`w-12 h-12 rounded-2xl ${note.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform border ${isDarkMode ? 'border-white/[0.05]' : 'border-black/[0.05]'}`}>
                            <note.icon className={`w-6 h-6 ${note.color}`} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>{note.title}</span>
                              <span className={`text-[10px] font-bold ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>{note.time}</span>
                            </div>
                            <p className={`text-xs leading-relaxed font-light ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>{note.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                    <div className={`p-5 text-center ${isDarkMode ? 'bg-white/[0.01]' : 'bg-black/[0.01]'}`}>
                      <button className={`text-[11px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 w-full ${isDarkMode ? 'text-white/30 hover:text-white' : 'text-black/30 hover:text-black'}`}>
                        View all <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Pond Puddle Search Overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-[100] flex items-start justify-center pt-10 px-6"
            >
              {/* Backdrop Ripple (Pond Puddle Effect) Removed */}
              <div className={`absolute inset-0 pointer-events-none ${isDarkMode ? 'bg-dark-maroon' : 'bg-white'}`} />
              
              <motion.div
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                transition={shouldReduceMotion ? { duration: 0.15 } : { 
                  type: "spring", 
                  ...DEFAULT_SPRING,
                  exit: { duration: 0.2, ease: "easeIn" }
                }}
                className="w-full max-w-md relative"
              >
                <div className="relative group">
                  <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <Search className={`w-5 h-5 group-focus-within:text-maroon transition-colors ${isDarkMode ? 'text-white/30' : 'text-black/30'}`} />
                  </div>
                  <input 
                    autoFocus
                    type="text"
                    placeholder="Search records, medicines, vitals..."
                    className={`w-full border rounded-[2.5rem] py-5 pl-14 pr-16 text-lg font-light focus:outline-none focus:ring-4 focus:ring-maroon/10 transition-all ${isDarkMode ? 'bg-[#1A1C1E] border-white/[0.15] text-white placeholder:text-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'bg-white border-black/[0.05] text-black placeholder:text-black/30 shadow-[0_20px_50px_rgba(0,0,0,0.05)]'}`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button 
                    onClick={() => setIsSearchOpen(false)}
                    className={`absolute inset-y-0 right-4 flex items-center px-4 transition-colors ${isDarkMode ? 'text-white/30 hover:text-white' : 'text-black/30 hover:text-black'}`}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Search Results Preview */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } }
                  }}
                  className={`mt-4 rounded-[2.5rem] border overflow-hidden ${isDarkMode ? 'bg-[#1A1C1E] border-white/[0.15] shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'bg-white border-black/[0.05] shadow-[0_20px_50px_rgba(0,0,0,0.05)]'}`}
                >
                  <div className="p-6">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>Recent Searches</span>
                    <div className="mt-4 flex flex-col gap-4">
                      {['Blood Sugar Report', 'Metformin Dosage', 'Dr. Aris Appointment'].map((item, i) => (
                        <motion.div 
                          key={i} 
                          variants={{
                            hidden: { opacity: 0, y: 12 },
                            visible: { opacity: 1, y: 0 }
                          }}
                          className={`flex items-center gap-3 cursor-pointer transition-colors group ${isDarkMode ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}
                        >
                          <Clock className={`w-4 h-4 transition-colors group-hover:text-maroon ${isDarkMode ? 'text-white/20' : 'text-black/20'}`} />
                          <span className="text-sm font-light">{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 px-8 overflow-y-auto no-scrollbar pb-32">
          <AnimatePresence mode="wait">
            {activeTab === 'home' ? (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                <div className="mt-8 maroon-glow">
                  <span className="text-caption">Daily report</span>
                  <h1 className="text-4xl leading-tight text-display mt-2">
                    Rise and shine,<br />
                    Eva! How do<br />
                    you feel today?
                  </h1>
                </div>

                {/* Condition Section */}
                <div className="mt-8 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>Your condition</span>
                    <Info className={`w-4 h-4 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`} />
                  </div>
                  <div className={`p-1 rounded-2xl flex gap-1 border transition-colors ${isDarkMode ? 'bg-white/[0.05] border-white/[0.05]' : 'bg-black/[0.03] border-black/[0.03]'}`}>
                    <button 
                      onClick={() => setHomeViewMode('today')}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${homeViewMode === 'today' ? (isDarkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-white text-black shadow-sm') : (isDarkMode ? 'text-white/30 hover:text-white' : 'text-black/30 hover:text-black')}`}
                    >
                      Today
                    </button>
                    <button 
                      onClick={() => setHomeViewMode('months')}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${homeViewMode === 'months' ? (isDarkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-white text-black shadow-sm') : (isDarkMode ? 'text-white/30 hover:text-white' : 'text-black/30 hover:text-black')}`}
                    >
                      Months
                    </button>
                  </div>
                </div>

                {/* Main Stats Card */}
                <motion.div 
                  key={homeViewMode}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={shouldReduceMotion ? {} : { y: -2, boxShadow: isDarkMode ? "0 20px 40px rgba(0,0,0,0.4)" : "0 20px 40px rgba(0,0,0,0.05)" }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.985 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={`mt-6 p-8 rounded-[3rem] flex flex-col gap-6 border backdrop-blur-3xl transition-all duration-500 cursor-pointer glass-card ${
                    homeViewMode === 'today' ? (isDarkMode ? 'border-maroon/20 hover:border-maroon/40' : 'border-maroon/10 hover:border-maroon/20') : (isDarkMode ? 'border-white/10 hover:border-white/20' : 'border-black/5 hover:border-black/10')
                  }`}
                >
                  {homeViewMode === 'today' ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-baseline gap-3">
                        <span className={`text-7xl font-light tracking-tighter leading-none transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>98</span>
                        <span className={`text-sm font-bold uppercase tracking-widest transition-colors ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>mg/dL</span>
                      </div>
                      <div className={`h-px w-full transition-colors ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`} />
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-lg font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Diabetes Control</span>
                          <div className="w-10 h-10 bg-maroon/10 rounded-2xl flex items-center justify-center border border-maroon/20">
                            <Activity className="w-5 h-5 text-maroon" />
                          </div>
                        </div>
                        <p className={`text-sm leading-relaxed font-light transition-colors ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
                          Your fasting sugar is within the target range. Keep up the consistent diet and morning walks!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="h-32 w-full mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={dailyLogsData}>
                            <defs>
                              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#C0203E" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#C0203E" stopOpacity={1} />
                              </linearGradient>
                            </defs>
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="url(#lineGradient)" 
                              strokeWidth={4} 
                              dot={false}
                              animationDuration={1500}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className={`h-px w-full transition-colors ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`} />
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-lg font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Monthly Progress</span>
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                            <TrendingUp className="w-5 h-5 text-maroon" />
                          </div>
                        </div>
                        <p className={`text-sm leading-relaxed font-light transition-colors ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
                          Your average HbA1c has improved by 0.4% over the last 3 months. You're on the right track.
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Action Cards Grid */}
                <motion.div 
                  variants={listContainerVariants}
                  initial="hidden"
                  animate="visible"
                  className="mt-4 grid grid-cols-2 gap-4"
                >
                  <motion.div 
                    variants={listItemVariants}
                    whileHover={shouldReduceMotion ? {} : { y: -2, boxShadow: isDarkMode ? "0 20px 40px rgba(0,0,0,0.4)" : "0 20px 40px rgba(0,0,0,0.05)" }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.985 }}
                    className={`glass-card p-6 aspect-square flex flex-col justify-between shadow-sm group cursor-pointer hover:border-maroon/20 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}
                  >
                    <span className={`text-lg font-medium leading-tight transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Add your<br />symptoms</span>
                    <div className="flex justify-end">
                      <div className="w-12 h-12 bg-maroon/10 text-maroon rounded-2xl flex items-center justify-center border border-maroon/20 group-hover:scale-110 active:scale-90 transition-all">
                        <Plus className="w-6 h-6" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    variants={listItemVariants}
                    whileHover={shouldReduceMotion ? {} : { y: -2, boxShadow: isDarkMode ? "0 20px 40px rgba(0,0,0,0.4)" : "0 20px 40px rgba(0,0,0,0.05)" }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.985 }}
                    className={`glass-card p-6 aspect-square flex flex-col justify-between shadow-sm group cursor-pointer hover:border-maroon/20 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}
                  >
                    <span className={`text-lg font-medium leading-tight transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Make an<br />appointment</span>
                    <div className="flex justify-end">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border group-hover:scale-110 active:scale-90 transition-all ${isDarkMode ? 'bg-white/5 text-white/60 border-white/10' : 'bg-black/5 text-black/60 border-black/10'}`}>
                        <Plus className="w-6 h-6" />
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            ) : activeTab === 'health' ? (
              <motion.div
                key="health"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                <div className="mt-8 flex items-center justify-between">
                  <h1 className={`text-2xl font-medium tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Vitals</h1>
                </div>

                {/* Condition Chips (Horizontally Scrollable) */}
                <div className="mt-8">
                  <div className="flex items-center justify-between ml-1 mb-4">
                    <span className="text-caption">Active Conditions</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {conditions.filter(c => c.id !== 'All').map((cond) => (
                      <motion.button
                        key={cond.id}
                        whileHover={shouldReduceMotion ? {} : { y: -2 }}
                        whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                        onClick={() => setSelectedVitalsCondition(cond.id)}
                        className={`px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap border relative overflow-hidden group ${
                          selectedVitalsCondition === cond.id 
                            ? 'text-white border-transparent shadow-lg' 
                            : (isDarkMode ? 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10' : 'bg-black/5 text-black/40 border-black/5 hover:bg-black/10')
                        }`}
                      >
                        {/* Background Fill Animation */}
                        <AnimatePresence>
                          {selectedVitalsCondition === cond.id && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ duration: 0.22, ease: "easeOut" }}
                              className="absolute inset-0 bg-maroon z-0"
                            />
                          )}
                        </AnimatePresence>
                        
                        <div className="flex items-center gap-2 relative z-10">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedVitalsCondition === cond.id ? '#fff' : cond.color }} />
                          <span className={`transition-colors duration-220 ${selectedVitalsCondition === cond.id ? 'text-white' : (isDarkMode ? 'text-white/40' : 'text-black/40')}`}>
                            {cond.label}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Daily Logs Section */}
                <div className="mt-10">
                  <div className="flex items-center justify-between mb-6 px-1">
                    <div className="flex items-center gap-2">
                      <TrendingUp className={`w-5 h-5 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`} />
                      <span className={`text-xl font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Daily Logs</span>
                    </div>
                    <button className="text-sm text-maroon hover:text-maroon/80 transition-colors flex items-center gap-1 font-bold">
                      View all <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <motion.div 
                    variants={listContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 gap-4"
                  >
                    {[
                      { id: 'sugar', label: 'Blood Sugar', value: '98', unit: 'mg/dL', delta: '↓ 3 mg/dL', time: 'Today, 7:30 AM', priority: selectedVitalsCondition === 'Diabetes' ? 1 : 2 },
                      { id: 'bp', label: 'Blood Pressure', value: '120/80', unit: 'mmHg', delta: '↑ 2 mmHg', time: 'Today, 8:00 AM', priority: selectedVitalsCondition === 'Kidney' || selectedVitalsCondition === 'Heart' ? 1 : 2 },
                      { id: 'weight', label: 'Weight', value: '62.5', unit: 'kg', delta: '↓ 0.5 kg', time: 'Yesterday', priority: 3 },
                      { id: 'hr', label: 'Heart Rate', value: '72', unit: 'bpm', delta: '↑ 1 bpm', time: 'Today, 9:00 AM', priority: 4 },
                    ].sort((a, b) => a.priority - b.priority).map((vital) => (
                      <motion.div 
                        key={vital.id} 
                        variants={listItemVariants}
                        whileHover={shouldReduceMotion ? {} : { y: -2, boxShadow: isDarkMode ? "0 20px 40px rgba(0,0,0,0.4)" : "0 20px 40px rgba(0,0,0,0.05)" }}
                        whileTap={shouldReduceMotion ? {} : { scale: 0.985 }}
                        className={`glass-card p-5 flex flex-col gap-1 cursor-pointer hover:border-maroon/20 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}
                      >
                        <span className={`text-caption ${isDarkMode ? '!text-white/20' : '!text-black/20'}`}>{vital.label}</span>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className={`text-2xl font-light transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>{vital.value}</span>
                          <span className={`text-xs font-bold transition-colors ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>{vital.unit}</span>
                        </div>
                        <div className="flex flex-col gap-1 mt-4">
                          <span className={`text-[10px] font-bold ${vital.delta.includes('↑') ? 'text-maroon' : 'text-green-500'}`}>
                            {vital.delta} since yesterday
                          </span>
                          <span className={`text-[10px] font-bold ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>{vital.time}</span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Add New Log Button */}
                  <motion.button 
                    whileHover={{ scale: 1.02, backgroundColor: isDarkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full mt-6 py-5 border-2 border-dashed rounded-[2rem] flex items-center justify-center gap-3 transition-all ${isDarkMode ? 'border-white/5 text-white/20 hover:text-white/40 hover:border-white/10' : 'border-black/5 text-black/20 hover:text-black/40 hover:border-black/10'}`}
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-lg font-medium">Add new log</span>
                  </motion.button>
                </div>

                {/* Report Trends */}
                <div className="mt-10">
                  <div className="flex items-center justify-between mb-6 px-1">
                    <div className="flex items-center gap-2">
                      <Activity className={`w-5 h-5 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`} />
                      <span className={`text-xl font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Report Trends</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <motion.div 
                      whileHover={{ x: 5, backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
                      whileTap={{ scale: 0.98 }}
                      className={`glass-card !rounded-3xl p-5 flex items-center justify-between group cursor-pointer ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}
                    >
                      <div className="flex flex-col gap-1">
                        <span className={`text-base font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>
                          {selectedVitalsCondition === 'Diabetes' ? 'HbA1c Trend — last 6 months' : 'Monthly Health Summary'}
                        </span>
                        <span className={`text-xs font-bold ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>March 2026</span>
                      </div>
                      <ChevronRight className={`w-5 h-5 group-hover:text-maroon transition-colors ${isDarkMode ? 'text-white/10' : 'text-black/10'}`} />
                    </motion.div>

                    <motion.div 
                      whileHover={{ x: 5, backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
                      whileTap={{ scale: 0.98 }}
                      className={`glass-card !rounded-3xl p-5 flex items-center justify-between group cursor-pointer ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}
                    >
                      <div className="flex flex-col gap-1">
                        <span className={`text-base font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>
                          {selectedVitalsCondition === 'Diabetes' ? 'Fasting Sugar — last 12 readings' : 'Blood Report Analysis'}
                        </span>
                        <span className={`text-xs font-bold ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>Feb 28, 2026</span>
                      </div>
                      <ChevronRight className={`w-5 h-5 group-hover:text-maroon transition-colors ${isDarkMode ? 'text-white/10' : 'text-black/10'}`} />
                    </motion.div>
                  </div>
                </div>

                {/* Upcoming Doctor Visit */}
                <div className="mt-10 pb-24">
                  <div className="flex items-center gap-2 ml-1 mb-6">
                    <Calendar className="w-5 h-5 text-maroon" />
                    <span className={`text-xl font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Upcoming Doctor Visit</span>
                  </div>
                  <motion.div 
                    whileHover={{ scale: 1.01, boxShadow: "0 20px 40px rgba(192,32,62,0.2)" }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setShowPreVisitSummary(true)}
                    className="glass-card p-6 flex items-center gap-6 bg-gradient-to-br from-maroon to-maroon/80 border-transparent cursor-pointer shadow-xl shadow-maroon/10"
                  >
                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                      <span className="text-[10px] font-bold text-white/60 uppercase">Oct</span>
                      <span className="text-xl font-bold text-white">24</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-white">Dr. Aris (Dentist)</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-white/60" />
                        <span className="text-xs text-white/60 font-bold">10:00 AM</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Pre-visit Summary</span>
                      <ChevronRight className="w-5 h-5 text-white/40" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ) : activeTab === 'medicine' ? (
              <motion.div
                key="medicine"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="pb-32"
              >
                <div className="mt-8 flex items-center justify-between">
                  <h1 className={`text-2xl font-medium tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Medicines</h1>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
                    <CalendarDays className={`w-4 h-4 ${isDarkMode ? 'text-white/40' : 'text-black/40'}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>Today</span>
                  </div>
                </div>

                {/* Calendar Day Selector */}
                <div className="mt-8">
                  <div className="flex items-center justify-between ml-1 mb-4">
                    <span className="text-caption">October 2025</span>
                    <div className="flex gap-2">
                      <ChevronRight className={`w-4 h-4 rotate-180 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`} />
                      <ChevronRight className={`w-4 h-4 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`} />
                    </div>
                  </div>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    {[
                      { day: 'Sun', date: '17' },
                      { day: 'Mon', date: '18' },
                      { day: 'Tue', date: '19' },
                      { day: 'Wed', date: '20' },
                      { day: 'Thu', date: '21' },
                      { day: 'Fri', date: '22' },
                      { day: 'Sat', date: '23' },
                    ].map((d, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedDate(d.date)}
                        className={`flex flex-col items-center gap-2 min-w-[54px] py-4 rounded-3xl transition-all cursor-pointer border ${selectedDate === d.date ? 'bg-maroon text-white border-transparent shadow-lg shadow-maroon/20' : (isDarkMode ? 'bg-white/5 text-white/40 border-white/5' : 'bg-black/5 text-black/40 border-black/5')}`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider">{d.day}</span>
                        <span className="text-lg font-medium">{d.date}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Daily Progress Bar */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Today's Progress</span>
                    <span className="text-sm font-bold text-maroon">{takenCount}/{totalCount} Taken</span>
                  </div>
                  <div className={`h-4 rounded-full overflow-hidden border transition-colors ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-gradient-to-r from-maroon to-maroon/60 shadow-[0_0_15px_rgba(192,32,62,0.3)]"
                    />
                  </div>
                  <p className={`text-[11px] font-bold mt-2 uppercase tracking-wider transition-colors ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>
                    {progress === 100 ? 'All medicines taken! Great job.' : `${totalCount - takenCount} more to go today`}
                  </p>
                </div>

                {/* To Take Section */}
                <div className="mt-10">
                  <div className="flex items-center justify-between ml-1 mb-6">
                    <span className={`text-xl font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>To take</span>
                  </div>

                  <motion.div 
                    variants={listContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col gap-4"
                  >
                    {medicines.map((med) => (
                      <motion.div 
                        key={med.id}
                        variants={listItemVariants}
                        onClick={() => toggleMedicineTaken(med.id)}
                        whileHover={shouldReduceMotion ? {} : { x: 5, backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
                        whileTap={shouldReduceMotion ? {} : { scale: 0.985 }}
                        className={`glass-card p-5 flex items-center gap-5 cursor-pointer transition-all duration-300 ${
                          med.taken ? (isDarkMode ? 'bg-white/[0.01] border-transparent opacity-40' : 'bg-black/[0.01] border-transparent opacity-40') : (isDarkMode ? 'bg-white/[0.03]' : 'bg-black/[0.02]')
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center shadow-sm border ${
                          med.taken ? (isDarkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5') : 'bg-maroon/10 border-maroon/20'
                        }`}>
                          <Pill className={`w-7 h-7 ${med.taken ? (isDarkMode ? 'text-white/10' : 'text-black/10') : 'text-maroon'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h4 className={`text-base font-medium transition-colors ${med.taken ? (isDarkMode ? 'text-white/40 line-through' : 'text-black/40 line-through') : (isDarkMode ? 'text-white' : 'text-black')}`}>
                                {med.name}
                              </h4>
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                                med.condition === 'Diabetes' ? 'bg-maroon/20 text-maroon' :
                                med.condition === 'Thyroid' ? 'bg-purple-500/20 text-purple-400' :
                                med.condition === 'BP' ? 'bg-red-500/20 text-red-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                {med.condition}
                              </span>
                            </div>
                            <span className={`text-xs font-bold transition-colors ${med.taken ? (isDarkMode ? 'text-white/20' : 'text-black/20') : (isDarkMode ? 'text-white/40' : 'text-black/40')}`}>
                              {med.time}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className={`text-xs font-light transition-colors ${med.taken ? (isDarkMode ? 'text-white/20' : 'text-black/20') : (isDarkMode ? 'text-white/40' : 'text-black/40')}`}>
                              {med.dosage} • {med.frequency}
                            </p>
                            {med.taken && (
                              <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* Refill Reminders */}
                <div className="mt-10">
                  <div className="flex items-center gap-2 ml-1 mb-6">
                    <AlertCircle className="w-5 h-5 text-maroon" />
                    <span className={`text-xl font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Refill Reminders</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {medicines.filter(m => m.stock <= 5).map(med => (
                      <div key={med.id} className={`glass-card p-5 flex items-center gap-5 border transition-colors ${isDarkMode ? 'bg-maroon/5 border-maroon/20' : 'bg-maroon/5 border-maroon/10'}`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                          <Pill className="w-6 h-6 text-maroon" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-base font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>{med.name}</h4>
                          <p className="text-xs text-maroon font-bold">
                            {med.daysLeft} days left • {med.stock} pills remaining
                          </p>
                        </div>
                        <button className="px-5 py-2.5 bg-maroon text-white text-xs font-bold rounded-2xl shadow-lg shadow-maroon/20 active:scale-95 transition-all">
                          Refill
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Doctor Visit */}
                <div className="mt-10">
                  <div className="flex items-center gap-2 ml-1 mb-6">
                    <Calendar className="w-5 h-5 text-maroon" />
                    <span className={`text-xl font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Upcoming Doctor Visit</span>
                  </div>
                  <motion.div 
                    whileHover={{ scale: 1.01, boxShadow: "0 20px 40px rgba(192,32,62,0.2)" }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setShowPreVisitSummary(true)}
                    className="glass-card p-6 flex items-center gap-6 bg-gradient-to-br from-maroon to-maroon/80 border-transparent cursor-pointer shadow-xl shadow-maroon/10"
                  >
                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                      <span className="text-[10px] font-bold text-white/60 uppercase">Oct</span>
                      <span className="text-xl font-bold text-white">24</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-white">Dr. Aris (Dentist)</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-white/60" />
                        <span className="text-xs text-white/60 font-bold">10:00 AM</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Pre-visit Summary</span>
                      <ChevronRight className="w-5 h-5 text-white/40" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="vault"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="flex flex-col pb-32"
              >
                {/* MedVault Header */}
                <div className="mt-8 flex items-center justify-between px-1">
                  <h1 className={`text-2xl font-medium tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>MedVault</h1>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
                    <Lock className={`w-4 h-4 ${isDarkMode ? 'text-white/40' : 'text-black/40'}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>Secure</span>
                  </div>
                </div>

                {/* Full-width Upload Bar */}
                <div className="mt-8 flex gap-3">
                  <button className={`flex-1 h-16 rounded-[2rem] border flex items-center justify-center gap-3 transition-all active:scale-[0.98] group ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-black/5 border-black/5 hover:bg-black/10'}`}>
                    <div className="w-10 h-10 bg-maroon/10 rounded-full flex items-center justify-center border border-maroon/20 group-hover:scale-110 transition-transform">
                      <Scan className="w-5 h-5 text-maroon" />
                    </div>
                    <span className={`text-lg font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Scan</span>
                  </button>
                  <button className={`flex-1 h-16 rounded-[2rem] border flex items-center justify-center gap-3 transition-all active:scale-[0.98] group ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-black/5 border-black/5 hover:bg-black/10'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border group-hover:scale-110 transition-transform ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                      <Upload className={`w-5 h-5 ${isDarkMode ? 'text-white/60' : 'text-black/60'}`} />
                    </div>
                    <span className={`text-lg font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Upload</span>
                  </button>
                </div>

                {/* Category 2x2 Grid */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                  {vaultCategories.map((cat) => (
                    <motion.div 
                      key={cat.id}
                      whileHover={{ y: -4, border: "rgba(192,32,62,0.2)" }}
                      className={`glass-card p-5 flex flex-col justify-between h-40 cursor-pointer relative overflow-hidden group ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                          <cat.icon className="w-6 h-6 text-maroon" />
                        </div>
                        <div className={`backdrop-blur-sm px-2 py-1 rounded-full border transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                          <span className={`text-[10px] font-bold ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>{cat.count} Records</span>
                        </div>
                      </div>
                      <div className="relative z-10">
                        <h4 className={`text-lg font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>{cat.label}</h4>
                        <p className={`text-[11px] font-bold mt-0.5 uppercase tracking-wider transition-colors ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>Last: {cat.lastDate}</p>
                      </div>
                      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                        <cat.icon className="w-24 h-24 text-maroon" />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Hidden Vault Entry */}
                <div className="mt-8">
                  <motion.div 
                    whileHover={{ scale: 1.01, boxShadow: "0 20px 40px rgba(192,32,62,0.1)" }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => isVaultUnlocked ? setIsVaultUnlocked(true) : setShowVaultAuth(true)}
                    className={`p-6 flex items-center gap-5 rounded-[2.5rem] border cursor-pointer group shadow-2xl relative overflow-hidden transition-colors ${isDarkMode ? 'bg-white/[0.03] border-white/5' : 'bg-black/[0.03] border-black/5'}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-maroon/5 to-transparent pointer-events-none" />
                    <div className="w-14 h-14 bg-maroon/10 rounded-[1.5rem] flex items-center justify-center group-hover:bg-maroon/20 transition-colors border border-maroon/20 relative z-10">
                      <Lock className="w-7 h-7 text-maroon" />
                    </div>
                    <div className="flex-1 relative z-10">
                      <h4 className={`text-lg font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Hidden Vault</h4>
                      <p className={`text-xs font-light transition-colors ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>Secure sensitive records</p>
                    </div>
                    <div className="flex items-center gap-2 relative z-10">
                      <span className="text-[10px] font-bold text-maroon/40 uppercase tracking-widest">Locked</span>
                      <ChevronRight className="w-5 h-5 text-maroon/40" />
                    </div>
                  </motion.div>
                </div>

                {/* Condition Filter Strip */}
                <div className="mt-10">
                  <div className="flex items-center justify-between ml-1 mb-4">
                    <span className="text-caption">Filter by condition</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {conditions.map((cond) => (
                      <button
                        key={cond.id}
                        onClick={() => setSelectedCondition(cond.id)}
                        className={`px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
                          selectedCondition === cond.id 
                            ? 'bg-maroon text-white border-transparent shadow-lg shadow-maroon/20' 
                            : (isDarkMode ? 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10' : 'bg-black/5 text-black/40 border-black/5 hover:bg-black/10')
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {cond.id !== 'All' && (
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedCondition === cond.id ? '#fff' : cond.color }} />
                          )}
                          {cond.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Records */}
                <div className="mt-8">
                  <div className="flex items-center justify-between ml-1 mb-6">
                    <span className={`text-xl font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Recent Records</span>
                    <button className="text-sm text-maroon font-bold hover:text-maroon/80 transition-colors">View all</button>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map((record) => (
                        <motion.div 
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ x: 5, backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
                          className={`glass-card p-4 flex items-center gap-4 group cursor-pointer transition-colors ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}
                        >
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                            <FileText className={`w-6 h-6 ${isDarkMode ? 'text-white/40' : 'text-black/40'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className={`text-[16px] font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>{record.name}</h4>
                              <div className="flex items-center gap-2">
                                {record.flag === 'High' && (
                                  <div className="flex items-center gap-1 bg-maroon/20 px-2 py-0.5 rounded-full border border-maroon/30">
                                    <AlertTriangle className="w-3 h-3 text-maroon" />
                                    <span className="text-[10px] font-bold text-maroon uppercase">High</span>
                                  </div>
                                )}
                                <ArrowUpRight 
                                  className={`w-4 h-4 transition-transform ${
                                    record.trend === 'up' ? 'text-maroon rotate-0' : 
                                    record.trend === 'down' ? 'text-green-500 rotate-90' : 
                                    'text-blue-400 rotate-45'
                                  }`} 
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className={`text-xs font-bold transition-colors ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>{record.date}</span>
                              <div className={`w-1 h-1 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`} />
                              <div className="flex items-center gap-1.5">
                                <div 
                                  className="w-2 h-2 rounded-full" 
                                  style={{ backgroundColor: conditions.find(c => c.id === record.condition)?.color }} 
                                />
                                <span className="text-xs font-bold" style={{ color: conditions.find(c => c.id === record.condition)?.color }}>
                                  {record.condition}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className={`mt-4 p-10 glass-card border-dashed border-2 flex flex-col items-center text-center gap-4 bg-transparent shadow-none transition-colors ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                        <div className="w-20 h-20 bg-maroon/10 rounded-full flex items-center justify-center border border-maroon/20">
                          <Microscope className="w-10 h-10 text-maroon" />
                        </div>
                        <div>
                          <h4 className={`text-lg font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>
                            {selectedCondition === 'Diabetes' ? 'Upload your first HbA1c' : 
                             selectedCondition === 'Thyroid' ? 'Upload your TSH report' : 
                             'No records found'}
                          </h4>
                          <p className={`text-sm font-light mt-1 transition-colors ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                            {selectedCondition === 'Diabetes' ? 'Start tracking your sugar trend today.' : 
                             selectedCondition === 'Thyroid' ? 'Begin your thyroid history tracking.' : 
                             'Add your first record to see it here.'}
                          </p>
                        </div>
                        <button 
                          onClick={() => setShowUploadSuccess(true)}
                          className="mt-2 px-8 py-4 bg-maroon text-white rounded-full font-bold shadow-xl shadow-maroon/20 active:scale-95 transition-all"
                        >
                          Add Record
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Floating Bottom Navigation */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-50">
          <LayoutGroup>
            <nav className={`glass-panel pill-nav-glass px-6 py-3 flex items-center justify-between relative border transition-all shadow-2xl ${isDarkMode ? 'border-white/10 shadow-black/50' : 'border-black/5 shadow-black/10'}`}>
              {[
                { id: 'home', icon: Home, label: 'Home' },
                { id: 'health', icon: HeartPulse, label: 'Vitals' },
                { id: 'medicine', icon: Pill, label: 'Meds' },
                { id: 'vault', icon: Shield, label: 'Vault' },
              ].map((tab) => (
                <motion.button 
                  key={tab.id}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1 transition-all duration-300 relative z-10 ${activeTab === tab.id ? (isDarkMode ? 'text-white' : 'text-black') : (isDarkMode ? 'text-white/30 hover:text-white/50' : 'text-black/30 hover:text-black/50')}`}
                >
                  <motion.div
                    animate={activeTab === tab.id ? { scale: 1.1 } : { scale: 1 }}
                    transition={shouldReduceMotion ? { duration: 0.15 } : { 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 17
                    }}
                  >
                    <tab.icon className="w-5 h-5" />
                  </motion.div>
                  <span className="text-[9px] font-bold uppercase tracking-widest">{tab.label}</span>
                  
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 w-1 h-1 bg-maroon rounded-full shadow-[0_0_10px_rgba(192,32,62,0.8)]"
                      transition={shouldReduceMotion ? { duration: 0.15 } : { type: "spring", ...NAV_SPRING }}
                    />
                  )}
                </motion.button>
              ))}
            </nav>
          </LayoutGroup>
        </div>

        {/* Upload Confirmation Overlay */}
        <AnimatePresence>
          {showUploadSuccess && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 z-[200] flex items-center justify-center p-8 transition-colors ${isDarkMode ? 'bg-dark-maroon' : 'bg-white'}`}
            >
              <div className="relative w-full max-w-sm flex flex-col items-center">
                {/* Soft Circular Bloom */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: [0, 0.2, 0] }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute w-[240px] h-[240px] bg-maroon rounded-full blur-3xl"
                />
                
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className={`glass-panel p-8 w-full shadow-2xl flex flex-col items-center gap-6 border transition-colors ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}
                >
                  <div className="w-16 h-16 bg-maroon/10 rounded-full flex items-center justify-center border border-maroon/20">
                    <CheckCircle2 className="w-8 h-8 text-maroon" />
                  </div>
                  <div className="text-center">
                    <h3 className={`text-xl font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Report Uploaded</h3>
                    <p className={`text-sm font-bold mt-1 uppercase tracking-wider transition-colors ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>HbA1c Analysis Complete</p>
                  </div>
                  
                  <div className="w-full flex flex-col gap-3">
                    {[
                      { label: 'Reading', value: '6.4%' },
                      { label: 'Status', value: 'Pre-diabetic' },
                      { label: 'Trend', value: 'Improving' },
                    ].map((row, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + (i * 0.04) }}
                        className={`flex items-center justify-between py-2 border-b transition-colors last:border-0 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}
                      >
                        <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>{row.label}</span>
                        <span className={`text-sm font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>{row.value}</span>
                      </motion.div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => setShowUploadSuccess(false)}
                    className="mt-4 w-full py-4 bg-maroon text-white rounded-[2rem] font-bold shadow-xl shadow-maroon/20 active:scale-95 transition-all"
                  >
                    Done
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vault Authentication Overlay */}
        <AnimatePresence>
          {showVaultAuth && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 z-[100] flex flex-col items-center justify-center p-8 transition-colors ${isDarkMode ? 'bg-dark-maroon' : 'bg-white'}`}
            >
              <div className="flex flex-col items-center gap-6 w-full max-w-xs">
                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center border shadow-xl relative transition-colors ${isDarkMode ? 'bg-maroon/10 border-maroon/20' : 'bg-maroon/5 border-maroon/10'}`}>
                  <div className="absolute inset-0 bg-maroon/20 blur-2xl rounded-full" />
                  <Lock className="w-10 h-10 text-maroon relative z-10" />
                </div>
                <div className="text-center">
                  <h2 className={`text-2xl font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Hidden Vault</h2>
                  <p className={`text-sm font-bold mt-1 uppercase tracking-wider transition-colors ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>Enter your 4-digit PIN</p>
                </div>

                {/* PIN Display */}
                <div className="flex gap-4 mt-4">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div 
                      key={i}
                      animate={pinError ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
                      transition={pinError ? { duration: 0.4, ease: "easeInOut" } : {}}
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                        vaultPin.length > i 
                          ? 'bg-maroon border-maroon shadow-[0_0_10px_rgba(192,32,62,0.5)]' 
                          : (isDarkMode ? 'bg-transparent border-white/10' : 'bg-transparent border-black/10')
                      } ${pinError ? 'border-maroon bg-maroon' : ''}`}
                    />
                  ))}
                </div>

                {/* Number Pad */}
                <div className="grid grid-cols-3 gap-6 mt-8 w-full">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <motion.button
                      key={num}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handlePinInput(num.toString())}
                      className={`w-16 h-16 rounded-full border flex items-center justify-center text-xl font-medium transition-colors ${isDarkMode ? 'bg-white/5 border-white/5 text-white hover:bg-white/10' : 'bg-black/5 border-black/5 text-black hover:bg-black/10'}`}
                    >
                      {num}
                    </motion.button>
                  ))}
                  <div />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handlePinInput('0')}
                    className={`w-16 h-16 rounded-full border flex items-center justify-center text-xl font-medium transition-colors ${isDarkMode ? 'bg-white/5 border-white/5 text-white hover:bg-white/10' : 'bg-black/5 border-black/5 text-black hover:bg-black/10'}`}
                  >
                    0
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setVaultPin('');
                      setShowVaultAuth(false);
                    }}
                    className="w-16 h-16 rounded-full flex items-center justify-center text-sm font-bold text-maroon"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pre-visit Summary Overlay */}
        <AnimatePresence>
          {showPreVisitSummary && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`absolute inset-0 z-[120] flex flex-col transition-colors ${isDarkMode ? 'bg-dark-maroon' : 'bg-white'}`}
            >
              <div className="p-8 flex flex-col h-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-maroon rounded-2xl flex items-center justify-center shadow-lg shadow-maroon/20">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-2xl font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Pre-visit Summary</h2>
                      <p className={`text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>Ready to share</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowPreVisitSummary(false)}
                    className={`p-3 rounded-full transition-colors border ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-black/5 border-black/5 hover:bg-black/10'}`}
                  >
                    <X className={`w-5 h-5 ${isDarkMode ? 'text-white/40' : 'text-black/40'}`} />
                  </button>
                </div>

                <div className="mt-10 flex-1 overflow-y-auto no-scrollbar">
                  <div className={`glass-card !rounded-[2.5rem] p-6 border transition-colors ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                    <h3 className={`text-lg font-medium mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Current Medications</h3>
                    <div className="flex flex-col gap-4">
                      {medicines.map((med) => (
                        <div key={med.id} className={`flex items-center justify-between py-3 border-b transition-colors last:border-0 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                          <div>
                            <h4 className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>{med.name}</h4>
                            <p className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>{med.dosage} • {med.frequency}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-maroon bg-maroon/10 px-2 py-1 rounded-md uppercase tracking-wider border border-maroon/20">
                              {med.condition}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 bg-maroon/10 rounded-[2.5rem] p-6 border border-maroon/20">
                    <h3 className="text-sm font-bold text-maroon mb-2 uppercase tracking-widest">Doctor's Note</h3>
                    <p className={`text-xs leading-relaxed font-light transition-colors ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
                      This summary includes your full medicine list with doses and timings. Share this with your doctor to ensure they have the most accurate information about your current treatment.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button 
                    onClick={() => setShowPreVisitSummary(false)}
                    className={`flex-1 py-4 border rounded-[2rem] font-bold active:scale-[0.98] transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`}
                  >
                    Close
                  </button>
                  <button 
                    className="flex-[2] py-4 bg-maroon text-white rounded-[2rem] font-bold shadow-xl shadow-maroon/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    Share with Doctor
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unlocked Hidden Vault View */}
        <AnimatePresence>
          {isVaultUnlocked && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`absolute inset-0 z-[110] flex flex-col transition-colors ${isDarkMode ? 'bg-dark-maroon' : 'bg-white'}`}
            >
              <div className="p-8 flex flex-col h-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-maroon rounded-2xl flex items-center justify-center shadow-lg shadow-maroon/20">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-2xl font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>Hidden Vault</h2>
                      <p className={`text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>Private Records</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsVaultUnlocked(false)}
                    className={`p-3 rounded-full transition-colors border ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-black/5 border-black/5 hover:bg-black/10'}`}
                  >
                    <Lock className={`w-5 h-5 ${isDarkMode ? 'text-white/40' : 'text-black/40'}`} />
                  </button>
                </div>

                <div className="mt-10 flex-1 overflow-y-auto no-scrollbar">
                  <div className="flex flex-col gap-4">
                    {[
                      { name: 'Private Consultation', date: 'Oct 10, 2025', condition: 'Mental Health', type: 'PDF' },
                      { name: 'Genetic Screening', date: 'Sep 15, 2025', condition: 'Genetics', type: 'PDF' },
                    ].map((record, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`glass-card p-5 flex items-center gap-4 border transition-colors ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                          <Shield className={`w-6 h-6 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-base font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>{record.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs font-bold transition-colors ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>{record.date}</span>
                            <div className={`w-1 h-1 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`} />
                            <span className="text-xs font-bold text-maroon">{record.condition}</span>
                          </div>
                        </div>
                        <MoreVertical className={`w-5 h-5 ${isDarkMode ? 'text-white/10' : 'text-black/10'}`} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Empty State for Hidden Vault */}
                  <div className={`mt-12 p-8 glass-card border-dashed border-2 flex flex-col items-center text-center gap-4 bg-transparent shadow-none transition-colors ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                      <Plus className={`w-8 h-8 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`} />
                    </div>
                    <p className={`text-sm font-light leading-relaxed transition-colors ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>Add sensitive records here to keep them private from the main vault.</p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsVaultUnlocked(false)}
                  className="mt-6 w-full py-4 bg-maroon text-white rounded-[2rem] font-bold shadow-xl shadow-maroon/20 active:scale-[0.98] transition-all"
                >
                  Lock & Exit
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
