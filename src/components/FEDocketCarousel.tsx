import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Activity,
  Calendar,
  Users,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Zap,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { FEDocket } from '../types';

interface Props {
  dockets: FEDocket[];
}

export default function FEDocketCarousel({ dockets }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [liveTime, setLiveTime] = useState(new Date());

  // Update Live Clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-slide every 9 seconds unless hovered (manual navigation resets timer)
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 4);
    }, 9000);
    return () => clearInterval(interval);
  }, [isHovered, currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 4);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 4) % 4);
  };

  // Format local live clock elegantly
  const formatLiveClock = () => {
    return liveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatLiveDate = () => {
    return liveTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Simple statistics calculations
  const totalIncidents = dockets.length;
  const fieldEngineerDockets = dockets.filter((d) => d.request === 'Field Engineer');
  const salesDockets = dockets.filter((d) => d.request === 'Sales');
  const otherDockets = dockets.filter((d) => d.request === 'Others' || d.request === 'LBO');

  // Slide 1 Mock Data (Daily Dispatch Pattern)
  const dailyHours = [
    { hour: '08:00', load: 3, resolved: 3 },
    { hour: '11:00', load: 8, resolved: 6 },
    { hour: '14:00', load: 12, resolved: 10 },
    { hour: '17:00', load: 9, resolved: 8 },
    { hour: '20:00', load: 4, resolved: 4 },
    { hour: '23:00', load: 2, resolved: 2 }
  ];

  // Slide 2 Mock Data (Weekly Outages Resolved)
  const weeklyLoad = [
    { day: 'Mon', count: 4, index: '98%' },
    { day: 'Tue', count: 6, index: '95%' },
    { day: 'Wed', count: 3, index: '99%' },
    { day: 'Thu', count: 8, index: '94%' },
    { day: 'Fri', count: 11, index: '91%' },
    { day: 'Sat', count: 5, index: '97%' },
    { day: 'Sun', count: 2, index: '100%' }
  ];

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 md:p-8 shadow-2xl select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id="fe-docket-carousel-container"
    >
      {/* Topology Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="fe-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" className="text-violet-400 fill-current" />
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-violet-500" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#fe-grid)" />
        </svg>
      </div>

      {/* Persistent Outer Top Right: 24x7 Network Monitoring + LIVE CLOCK */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30 flex flex-col md:flex-row items-end md:items-center gap-2 select-none pointer-events-none">
        <div className="flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-400 animate-pulse">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span>24x7 Network Monitoring</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full text-[9px] font-mono font-bold text-slate-300 shadow-sm">
          <Clock className="w-3 h-3 text-violet-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>{formatLiveClock()}</span>
          <span className="text-slate-500 text-[8px] hidden md:inline">| {formatLiveDate()}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentSlide === 0 && (
          /* SLIDE 1: DAILY TREND */
          <motion.div
            key="fe-slide-daily"
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-stretch min-h-[240px]"
            id="fe-carousel-slide-daily"
          >
            {/* Left side info */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                {/* SLIDE TYPE BADGE */}
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-mono uppercase font-black tracking-wider mb-2">
                  <TrendingUp className="w-3 h-3" />
                  <span>Daily Dispatch Velocity</span>
                </div>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                  Field Engineer Allocation Density
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-lg">
                  Hourly breakdown showing peak dispatch volumes for on-site fiber splicing, ONT configuration, and gateway diagnostic callouts. Live clock coordinates dispatch cycles.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Daily Peak Hour</span>
                  <span className="text-sm font-bold text-indigo-400">14:00 (Noon)</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">FE Dispatches</span>
                  <span className="text-sm font-bold text-slate-200">{fieldEngineerDockets.length}</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Avg Dispatch Time</span>
                  <span className="text-sm font-bold text-emerald-400">18.5 mins</span>
                </div>
              </div>
            </div>

            {/* Right side interactive visual chart */}
            <div className="flex-1 min-h-[160px] bg-slate-950/85 border border-slate-800 p-4 rounded-xl flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Hourly Dispatch Load</span>
                <span className="text-[9px] font-mono text-indigo-400">Synced to field reports</span>
              </div>

              <div className="flex items-end justify-between h-28 pt-4 gap-2 border-b border-slate-800">
                {dailyHours.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center group cursor-pointer">
                    <div className="w-full relative flex items-end justify-center gap-0.5">
                      {/* Load Bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${item.load * 7}px` }}
                        transition={{ duration: 0.6, delay: idx * 0.05 }}
                        className="w-1/2 bg-gradient-to-t from-indigo-600 to-indigo-400 hover:to-indigo-300 rounded-t-sm"
                      />
                      {/* Resolved Bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${item.resolved * 7}px` }}
                        transition={{ duration: 0.6, delay: idx * 0.05 + 0.1 }}
                        className="w-1/2 bg-emerald-600 hover:bg-emerald-500 rounded-t-sm"
                      />
                      {/* Tooltip */}
                      <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-[8px] px-1.5 py-0.5 rounded-sm pointer-events-none whitespace-nowrap z-30 shadow-md">
                        {item.load} req / {item.resolved} res
                      </span>
                    </div>
                    <span className="text-[8px] font-mono text-slate-500 mt-2">
                      {item.hour}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-2 text-[9px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-1 bg-indigo-500 rounded-xs" />
                  <span>Dispatched</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-1 bg-emerald-500 rounded-xs" />
                  <span>Resolved</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentSlide === 1 && (
          /* SLIDE 2: WEEKLY TREND */
          <motion.div
            key="fe-slide-weekly"
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-stretch min-h-[240px]"
            id="fe-carousel-slide-weekly"
          >
            {/* Left side info */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                {/* SLIDE TYPE BADGE */}
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[9px] font-mono uppercase font-black tracking-wider mb-2">
                  <Calendar className="w-3 h-3" />
                  <span>Weekly Dispatch Quality</span>
                </div>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                  SLA Backhaul Support Auditing
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-lg">
                  Continuous performance scoring on ticket response speeds and first-visit success indices. Weekly tracking flags structural distribution bottlenecks.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Weekly Volume</span>
                  <span className="text-sm font-bold text-violet-400">44 calls</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">First-Visit OK</span>
                  <span className="text-sm font-bold text-emerald-400">92.8%</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Customer Rating</span>
                  <span className="text-sm font-bold text-slate-200">4.8 / 5</span>
                </div>
              </div>
            </div>

            {/* Right side weekly bar graph */}
            <div className="flex-1 min-h-[160px] bg-slate-950/85 border border-slate-800 p-4 rounded-xl flex flex-col justify-between relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Weekly Response Score</span>
                <span className="text-[9px] font-mono text-violet-400">SLA Met Index</span>
              </div>

              <div className="flex items-end justify-between h-28 pt-4 gap-2 border-b border-slate-800">
                {weeklyLoad.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center group cursor-pointer">
                    <div className="w-full relative flex items-end justify-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${item.count * 8}px` }}
                        transition={{ duration: 0.6, delay: idx * 0.04 }}
                        className={`w-full rounded-t-sm transition-all duration-200 ${
                          item.count > 7
                            ? 'bg-gradient-to-t from-rose-600 to-rose-400 shadow-md shadow-rose-500/10'
                            : 'bg-gradient-to-t from-violet-600 to-violet-400 shadow-xs'
                        }`}
                      />
                      {/* Tooltip */}
                      <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-[9px] px-2 py-0.5 rounded-sm pointer-events-none whitespace-nowrap z-30 shadow-md">
                        {item.count} dockets ({item.index} SLA)
                      </span>
                    </div>
                    <span className="text-[9px] font-semibold text-slate-500 mt-2">
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-2 text-[8px] text-slate-500 italic">
                <span>* Weekend dispatches restricted to core fiber failures</span>
                <span>Target: &gt;95% SLA</span>
              </div>
            </div>
          </motion.div>
        )}

        {currentSlide === 2 && (
          /* SLIDE 3: MONTHLY TREND */
          <motion.div
            key="fe-slide-monthly"
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-stretch min-h-[240px]"
            id="fe-carousel-slide-monthly"
          >
            {/* Left side info */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                {/* SLIDE TYPE BADGE */}
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-mono uppercase font-black tracking-wider mb-2">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Monthly Support Backlog</span>
                </div>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                  Long-term Diagnostic Retention
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-lg">
                  Consolidated tracking of historical dispatch performance. Structured mapping ensures that critical network nodes maintain a high mean time between hardware failures.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Monthly Volume</span>
                  <span className="text-sm font-bold text-slate-200">188 dockets</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">ONT Replacements</span>
                  <span className="text-sm font-bold text-amber-400">14 units</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Compliance Rating</span>
                  <span className="text-sm font-bold text-emerald-400">99.88%</span>
                </div>
              </div>
            </div>

            {/* Right side circular dial animation */}
            <div className="flex-1 min-h-[160px] bg-slate-950/85 border border-slate-800 p-4 rounded-xl flex flex-col justify-between items-center relative overflow-hidden">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase self-start w-full text-left">
                Dispatcher Accuracy Index
              </span>

              <div className="relative flex items-center justify-center my-auto">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="rgba(30, 41, 59, 0.5)"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="url(#accuracyGrad)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={251.2}
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 * (1 - 0.965) }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                  <defs>
                    <linearGradient id="accuracyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <span className="text-base font-black font-mono text-violet-400">96.5%</span>
                  <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">STABLE</span>
                </div>
              </div>

              <div className="w-full flex items-center justify-between text-[9px] text-slate-500 mt-2">
                <span>NOC support desk</span>
                <span>Real-time calibration</span>
              </div>
            </div>
          </motion.div>
        )}

        {currentSlide === 3 && (
          /* SLIDE 4: CURRENT INCIDENTS SUMMARY */
          <motion.div
            key="fe-slide-incidents"
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-stretch min-h-[240px]"
            id="fe-carousel-slide-incidents"
          >
            {/* Left side info */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                {/* SLIDE TYPE BADGE */}
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-mono uppercase font-black tracking-wider mb-2">
                  <AlertCircle className="w-3 h-3" />
                  <span>Active Callouts Summary</span>
                </div>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                  Active Dispatch Log & Incidents
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-lg">
                  Real-time backplane docket log showing active support tickets and field technician assignments. Field personnel update status over live channels.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Active Dockets</span>
                  <span className="text-sm font-bold text-rose-400 animate-pulse">{totalIncidents} Total</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Field Engineer</span>
                  <span className="text-sm font-bold text-indigo-400">{fieldEngineerDockets.length} Logs</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">NOC/Other Desk</span>
                  <span className="text-sm font-bold text-emerald-400">{salesDockets.length + otherDockets.length} Logs</span>
                </div>
              </div>
            </div>

            {/* Right side live dispatch list feed */}
            <div className="flex-1 min-h-[160px] bg-slate-950/85 border border-slate-800 p-4 rounded-xl flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Live Dispatch Feeds</span>
                <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Live
                </span>
              </div>

              <div className="space-y-2 my-auto max-h-[110px] overflow-y-auto pr-1">
                {dockets.length > 0 ? (
                  dockets.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-start gap-2 bg-slate-900/50 border border-slate-800 p-2 rounded-lg text-[10px]">
                      <div className="p-1.5 bg-violet-950/60 text-violet-400 rounded-md shrink-0">
                        <Cpu className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-200 truncate">{item.userId}</span>
                          <span className="text-[8px] font-mono text-slate-500">{item.docketNo}</span>
                        </div>
                        <p className="text-slate-400 truncate mt-0.5">
                          {item.reason}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-1" />
                    <span className="text-xs font-bold text-emerald-400">All Dispatch Desks Stable</span>
                    <span className="text-[9px] text-slate-500">No open field technician alerts.</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-2 text-[9px] text-slate-500 border-t border-slate-800/60 pt-1">
                <span>Recent 3 records loaded</span>
                <span>Standby personnel: Active</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Slide controls */}
      <button
        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/85 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-all cursor-pointer hover:scale-105 z-20"
        title="Previous Trend"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/85 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-all cursor-pointer hover:scale-105 z-20"
        title="Next Trend"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Bottom Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
        {[0, 1, 2, 3].map((idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              currentSlide === idx 
                ? 'w-5 bg-violet-500' 
                : 'w-1.5 bg-slate-700 hover:bg-slate-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
