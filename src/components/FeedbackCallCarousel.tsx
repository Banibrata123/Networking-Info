import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Activity,
  Calendar,
  Smile,
  ShieldAlert,
  BarChart3,
  CheckCircle,
  HelpCircle,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { FeedbackCall } from '../types';

interface Props {
  feedbacks: FeedbackCall[];
}

export default function FeedbackCallCarousel({ feedbacks }: Props) {
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

  // Auto-slide every 8.5 seconds unless hovered (manual navigation resets timer)
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 4);
    }, 8500);
    return () => clearInterval(interval);
  }, [isHovered, currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 4);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 4) % 4);
  };

  const formatLiveClock = () => {
    return liveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatLiveDate = () => {
    return liveTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calculations
  const pendingCalls = feedbacks.filter((f) => f.status === 'Pending');
  const solvedCalls = feedbacks.filter((f) => f.status === 'Solved');

  // Slide 1 Mock Data (Daily Call Volume Distribution)
  const dailyDistribution = [
    { hour: '09:00', calls: 4, pending: 1 },
    { hour: '12:00', calls: 9, pending: 3 },
    { hour: '15:00', calls: 14, pending: 4 },
    { hour: '18:00', calls: 7, pending: 2 },
    { hour: '21:00', calls: 3, pending: 0 },
    { hour: '00:00', calls: 1, pending: 0 }
  ];

  // Slide 2 Mock Data (Weekly Customer Satisfaction Score)
  const weeklyTrend = [
    { day: 'Mon', score: 4.5, count: 8 },
    { day: 'Tue', score: 4.7, count: 12 },
    { day: 'Wed', score: 4.2, count: 15 },
    { day: 'Thu', score: 4.9, count: 9 },
    { day: 'Fri', score: 4.6, count: 18 },
    { day: 'Sat', score: 4.8, count: 6 },
    { day: 'Sun', score: 4.9, count: 4 }
  ];

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 md:p-8 shadow-2xl select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id="feedback-carousel-container"
    >
      {/* Circuit Grid Decorative Overlay */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="fb-grid" width="35" height="35" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" className="text-emerald-400 fill-current" />
              <path d="M 35 0 L 0 0 0 35" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-emerald-500" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#fb-grid)" />
        </svg>
      </div>

      {/* TOP RIGHT PERSISTENT OVERLAY: 24x7 Network Monitoring & Live Clock */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30 flex flex-col md:flex-row items-end md:items-center gap-2 select-none pointer-events-none">
        <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-400 animate-pulse">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span>24x7 Network Monitoring</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full text-[9px] font-mono font-bold text-slate-300 shadow-sm">
          <Clock className="w-3 h-3 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span>{formatLiveClock()}</span>
          <span className="text-slate-500 text-[8px] hidden md:inline">| {formatLiveDate()}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentSlide === 0 && (
          /* SLIDE 1: DAILY TREND */
          <motion.div
            key="fb-slide-daily"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-stretch min-h-[240px]"
            id="fb-carousel-slide-daily"
          >
            {/* Left side info */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                {/* SLIDE TYPE BADGE */}
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono uppercase font-black tracking-wider mb-2">
                  <BarChart3 className="w-3 h-3" />
                  <span>Daily Escalation Distribution</span>
                </div>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                  Daily Response Intensity Index
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-lg font-sans">
                  Monitors hourly feedback ticket generation speeds and live network complaints. Surge hours map peak fiber bandwidth contentions and client callback queries.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Hourly Rate</span>
                  <span className="text-sm font-bold text-emerald-400">1.8 calls/hr</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Busy Period</span>
                  <span className="text-sm font-bold text-slate-200">15:00 - 18:00</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Resolution MTTR</span>
                  <span className="text-sm font-bold text-indigo-400">22 mins</span>
                </div>
              </div>
            </div>

            {/* Right side interactive visual chart */}
            <div className="flex-1 min-h-[160px] bg-slate-950/85 border border-slate-800 p-4 rounded-xl flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Hourly Calls vs Backlog</span>
                <span className="text-[9px] font-mono text-emerald-400">Live NOC Link</span>
              </div>

              <div className="flex items-end justify-between h-28 pt-4 gap-2 border-b border-slate-800">
                {dailyDistribution.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center group cursor-pointer">
                    <div className="w-full relative flex items-end justify-center gap-0.5">
                      {/* Total Calls */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${item.calls * 6}px` }}
                        transition={{ duration: 0.6, delay: idx * 0.05 }}
                        className="w-1/2 bg-gradient-to-t from-emerald-600 to-emerald-400 hover:to-emerald-300 rounded-t-sm"
                      />
                      {/* Unresolved Calls */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${item.pending * 6}px` }}
                        transition={{ duration: 0.6, delay: idx * 0.05 + 0.1 }}
                        className="w-1/2 bg-rose-600 hover:bg-rose-500 rounded-t-sm"
                      />
                      {/* Tooltip */}
                      <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-[8px] px-1.5 py-0.5 rounded-sm pointer-events-none whitespace-nowrap z-30 shadow-md">
                        {item.calls} total / {item.pending} pending
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
                  <span className="w-2 h-1 bg-emerald-500 rounded-xs" />
                  <span>Inbound Logs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-1 bg-rose-500 rounded-xs" />
                  <span>Pending Callback</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentSlide === 1 && (
          /* SLIDE 2: WEEKLY TREND */
          <motion.div
            key="fb-slide-weekly"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-stretch min-h-[240px]"
            id="fb-carousel-slide-weekly"
          >
            {/* Left side info */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                {/* SLIDE TYPE BADGE */}
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-mono uppercase font-black tracking-wider mb-2">
                  <Calendar className="w-3 h-3" />
                  <span>Weekly Quality Metrics</span>
                </div>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                  SLA Satisfaction & Rating Trends
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-lg font-sans">
                  Tracks customer feedback ratings (CSAT) and incident closing efficiency index throughout the weekdays. Mid-week outages trigger structural dispatch evaluations.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Weekly CSAT</span>
                  <span className="text-sm font-bold text-indigo-400">4.74 / 5.0</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">SLA Target met</span>
                  <span className="text-sm font-bold text-emerald-400">98.2%</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Closed Tickets</span>
                  <span className="text-sm font-bold text-slate-200">{solvedCalls.length} Logs</span>
                </div>
              </div>
            </div>

            {/* Right side weekly bar graph */}
            <div className="flex-1 min-h-[160px] bg-slate-950/85 border border-slate-800 p-4 rounded-xl flex flex-col justify-between relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Weekly CSAT Performance</span>
                <span className="text-[9px] font-mono text-indigo-400">Rating out of 5.0</span>
              </div>

              <div className="flex items-end justify-between h-28 pt-4 gap-2 border-b border-slate-800">
                {weeklyTrend.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center group cursor-pointer">
                    <div className="w-full relative flex items-end justify-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(item.score - 3.5) * 55}px` }}
                        transition={{ duration: 0.6, delay: idx * 0.04 }}
                        className="w-full rounded-t-sm transition-all duration-200 bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-sm"
                      />
                      {/* Tooltip */}
                      <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-[9px] px-2 py-0.5 rounded-sm pointer-events-none whitespace-nowrap z-30 shadow-md">
                        {item.score} Rating ({item.count} calls)
                      </span>
                    </div>
                    <span className="text-[9px] font-semibold text-slate-500 mt-2">
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-2 text-[8px] text-slate-500">
                <span>Lower: 3.5 Rating</span>
                <span>Active quality checks</span>
                <span>Upper: 5.0 Rating</span>
              </div>
            </div>
          </motion.div>
        )}

        {currentSlide === 2 && (
          /* SLIDE 3: MONTHLY TREND */
          <motion.div
            key="fb-slide-monthly"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-stretch min-h-[240px]"
            id="fb-carousel-slide-monthly"
          >
            {/* Left side info */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                {/* SLIDE TYPE BADGE */}
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[9px] font-mono uppercase font-black tracking-wider mb-2">
                  <Smile className="w-3 h-3" />
                  <span>Monthly Compliance & Audit</span>
                </div>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                  SLA Customer Retention & Quality
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-lg font-sans">
                  Monthly statistics monitoring of NOC customer satisfaction. Consistent quality audits guarantee compliance with high-tier broadband availability requirements.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Monthly Volume</span>
                  <span className="text-sm font-bold text-slate-200">214 calls</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Compliance Target</span>
                  <span className="text-sm font-bold text-emerald-400">&gt; 96.0%</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Actual Attained</span>
                  <span className="text-sm font-bold text-emerald-400">97.8%</span>
                </div>
              </div>
            </div>

            {/* Right side circular dial animation */}
            <div className="flex-1 min-h-[160px] bg-slate-950/85 border border-slate-800 p-4 rounded-xl flex flex-col justify-between items-center relative overflow-hidden">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase self-start w-full text-left">
                Monthly SLA Attainment
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
                    stroke="url(#fbSlaGrad)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={251.2}
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 * (1 - 0.978) }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                  <defs>
                    <linearGradient id="fbSlaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <span className="text-base font-black font-mono text-emerald-400">97.8%</span>
                  <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">STABLE</span>
                </div>
              </div>

              <div className="w-full flex items-center justify-between text-[9px] text-slate-500 mt-2">
                <span>0% SLA</span>
                <span>Active Core logs</span>
                <span>100% SLA</span>
              </div>
            </div>
          </motion.div>
        )}

        {currentSlide === 3 && (
          /* SLIDE 4: CURRENT INCIDENTS SUMMARY */
          <motion.div
            key="fb-slide-incidents"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-stretch min-h-[240px]"
            id="fb-carousel-slide-incidents"
          >
            {/* Left side info */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                {/* SLIDE TYPE BADGE */}
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-mono uppercase font-black tracking-wider mb-2">
                  <ShieldAlert className="w-3 h-3" />
                  <span>Unresolved Callback Registry</span>
                </div>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                  Pending Customer Verification Logs
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-lg font-sans">
                  Real-time backplane ticket queue indicating pending callback queries. Frontdesk and NOC operators must verify each customer disruption status before closure.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Pending Verification</span>
                  <span className="text-sm font-bold text-rose-400 animate-pulse">{pendingCalls.length} Active</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Solved Today</span>
                  <span className="text-sm font-bold text-emerald-400">{solvedCalls.length} Logs</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Total logged</span>
                  <span className="text-sm font-bold text-slate-200">{feedbacks.length} Logs</span>
                </div>
              </div>
            </div>

            {/* Right side live feedback list feed */}
            <div className="flex-1 min-h-[160px] bg-slate-950/85 border border-slate-800 p-4 rounded-xl flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Live Escalation Stream</span>
                <span className="text-[9px] font-mono text-rose-400 flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" /> Live Feed
                </span>
              </div>

              <div className="space-y-2 my-auto max-h-[110px] overflow-y-auto pr-1">
                {feedbacks.length > 0 ? (
                  feedbacks.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-start gap-2 bg-slate-900/50 border border-slate-800 p-2 rounded-lg text-[10px]">
                      <div className="p-1.5 bg-emerald-950/60 text-emerald-400 rounded-md shrink-0">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-200 truncate font-mono">{item.userId}</span>
                          <span className="text-[8px] font-mono text-slate-500">{item.phoneNo}</span>
                        </div>
                        <p className="text-slate-400 truncate mt-0.5">
                          {item.reason}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mb-1" />
                    <span className="text-xs font-bold text-emerald-400">All Callback Queues Stable</span>
                    <span className="text-[9px] text-slate-500">No active unresolved customer tickets.</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-2 text-[9px] text-slate-500 border-t border-slate-800/60 pt-1">
                <span>Recent 3 registers shown</span>
                <span>Audit officers: On standby</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Slide controls */}
      <button
        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/85 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-all cursor-pointer hover:scale-105 z-20"
        title="Previous Slide"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/85 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-all cursor-pointer hover:scale-105 z-20"
        title="Next Slide"
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
                ? 'w-5 bg-emerald-500' 
                : 'w-1.5 bg-slate-700 hover:bg-slate-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
