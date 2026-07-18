import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Activity,
  Calendar,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  HelpCircle,
  MessageSquare,
  ShieldAlert,
  Inbox,
  Radio,
  FileSpreadsheet
} from 'lucide-react';
import { ComplaintManagement } from '../types';

interface Props {
  complaints: ComplaintManagement[];
}

export default function ComplaintManagementCarousel({ complaints }: Props) {
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

  const formatLiveClock = () => {
    return liveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatLiveDate = () => {
    return liveTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calculations for real indicators
  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;
  const solvedCount = complaints.filter((c) => c.status === 'Solved').length;

  // Slide 1 Data: Daily Complaint Rate Hours
  const hourlyDistribution = [
    { hour: '07:00', complaints: 2 },
    { hour: '10:00', complaints: 7 },
    { hour: '13:00', complaints: 11 },
    { hour: '16:00', complaints: 9 },
    { hour: '19:00', complaints: 5 },
    { hour: '22:00', complaints: 2 }
  ];

  // Slide 2 Data: Weekly Trend by Source
  const weeklyDistribution = [
    { day: 'Mon', Docket: 5, Mail: 2, Phone: 3 },
    { day: 'Tue', Docket: 8, Mail: 3, Phone: 6 },
    { day: 'Wed', Docket: 12, Mail: 4, Phone: 5 },
    { day: 'Thu', Docket: 6, Mail: 2, Phone: 4 },
    { day: 'Fri', Docket: 10, Mail: 5, Phone: 7 },
    { day: 'Sat', Docket: 4, Mail: 1, Phone: 2 },
    { day: 'Sun', Docket: 2, Mail: 0, Phone: 1 }
  ];

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 md:p-8 shadow-2xl select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id="complaint-carousel-container"
    >
      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="complaint-grid" width="38" height="38" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.1" className="text-violet-400 fill-current" />
              <path d="M 38 0 L 0 0 0 38" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-violet-500" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#complaint-grid)" />
        </svg>
      </div>

      {/* TOP RIGHT PERSISTENT OVERLAY: 24x7 Network Monitoring & Live Clock */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30 flex flex-col md:flex-row items-end md:items-center gap-2 select-none pointer-events-none">
        <div className="flex items-center gap-1.5 bg-violet-950/80 border border-violet-500/20 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-violet-400 animate-pulse">
          <Activity className="w-3 h-3 text-violet-400" />
          <span>24x7 Network Monitoring</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full text-[9px] font-mono font-bold text-slate-300 shadow-sm">
          <Clock className="w-3 h-3 text-violet-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span>{formatLiveClock()}</span>
          <span className="text-slate-500 text-[8px] hidden md:inline">| {formatLiveDate()}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentSlide === 0 && (
          /* SLIDE 1: DAILY TREND */
          <motion.div
            key="co-slide-daily"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-stretch min-h-[240px]"
            id="co-carousel-slide-daily"
          >
            {/* Left side info */}
            <div className="flex-1 flex flex-col justify-between space-y-4 font-sans">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[9px] font-mono uppercase font-black tracking-wider mb-2">
                  <BarChart3 className="w-3 h-3" />
                  <span>Daily Complaint Index</span>
                </div>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                  Daily Customer Complaint Rate & Load Cycle
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-lg">
                  Monitors hourly ticket filings through official mail channels, whatsapp pipelines, and standard helpdesk dockets. Peak surges represent regional fiber cuts and routing gateway latency periods.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Daily Peak Hour</span>
                  <span className="text-sm font-bold text-violet-400 font-mono">13:00 - 16:00</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Average Ticket MTTR</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">18.5 mins</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Hourly Generation</span>
                  <span className="text-sm font-bold text-slate-200 font-mono">1.4 Tickets</span>
                </div>
              </div>
            </div>

            {/* Right side interactive bar chart */}
            <div className="flex-1 min-h-[160px] bg-slate-950/85 border border-slate-800 p-4 rounded-xl flex flex-col justify-between relative overflow-hidden font-sans">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Hourly Complaint Load Stream</span>
                <span className="text-[9px] font-mono text-violet-400">Core ISP Logs</span>
              </div>

              <div className="flex items-end justify-between h-28 pt-4 gap-2 border-b border-slate-800">
                {hourlyDistribution.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center group cursor-pointer">
                    <div className="w-full relative flex items-end justify-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${item.complaints * 7}px` }}
                        transition={{ duration: 0.6, delay: idx * 0.05 }}
                        className="w-8/12 rounded-t-sm transition-all duration-200 bg-gradient-to-t from-violet-600 to-indigo-400 group-hover:to-indigo-300 shadow-xs"
                      />
                      {/* Tooltip */}
                      <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-[9px] px-2 py-0.5 rounded-sm pointer-events-none whitespace-nowrap z-30 shadow-md">
                        {item.complaints} Tickets Filed
                      </span>
                    </div>
                    <span className="text-[9px] font-semibold text-slate-500 mt-2 font-mono">
                      {item.hour}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-2 text-[8px] text-slate-500">
                <span>Low load interval</span>
                <span>Active RADIUS core logs</span>
                <span>Peak stress threshold</span>
              </div>
            </div>
          </motion.div>
        )}

        {currentSlide === 1 && (
          /* SLIDE 2: WEEKLY TREND */
          <motion.div
            key="co-slide-weekly"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-stretch min-h-[240px]"
            id="co-carousel-slide-weekly"
          >
            {/* Left side info */}
            <div className="flex-1 flex flex-col justify-between space-y-4 font-sans">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-mono uppercase font-black tracking-wider mb-2">
                  <Calendar className="w-3 h-3" />
                  <span>Weekly Channel breakdown</span>
                </div>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                  Customer Channels Filing Distribution
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-lg">
                  Analysis of incoming customer complaints segmented by official communication pipelines: Mail, dockets, and telephone systems. Identifies customer preferences and helps plan support staff allocations.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Weekly Docket Total</span>
                  <span className="text-sm font-bold text-slate-200">49 Tickets</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Official Mail Stream</span>
                  <span className="text-sm font-bold text-indigo-400">17 Tickets</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Helpline Phone Call</span>
                  <span className="text-sm font-bold text-violet-400">28 Tickets</span>
                </div>
              </div>
            </div>

            {/* Right side weekly stacked layout */}
            <div className="flex-1 min-h-[160px] bg-slate-950/85 border border-slate-800 p-4 rounded-xl flex flex-col justify-between relative font-sans">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Weekly Multi-channel Stream</span>
                <span className="text-[9px] font-mono text-indigo-400">Core CRM CRM-Data</span>
              </div>

              <div className="flex items-end justify-between h-28 pt-4 gap-2 border-b border-slate-800">
                {weeklyDistribution.map((item, idx) => {
                  const total = item.Docket + item.Mail + item.Phone;
                  const docHeight = total > 0 ? (item.Docket / 24) * 100 : 0;
                  const mailHeight = total > 0 ? (item.Mail / 24) * 100 : 0;
                  const phHeight = total > 0 ? (item.Phone / 24) * 100 : 0;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group cursor-pointer">
                      <div className="w-full flex flex-col justify-end items-center h-full relative">
                        {/* Phone segments */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${phHeight}px` }}
                          transition={{ duration: 0.6, delay: idx * 0.03 }}
                          className="w-7/12 bg-violet-500 rounded-t-xs"
                        />
                        {/* Mail segments */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${mailHeight}px` }}
                          transition={{ duration: 0.6, delay: idx * 0.03 + 0.05 }}
                          className="w-7/12 bg-indigo-400"
                        />
                        {/* Docket segments */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${docHeight}px` }}
                          transition={{ duration: 0.6, delay: idx * 0.03 + 0.1 }}
                          className="w-7/12 bg-indigo-600 rounded-b-xs"
                        />
                        {/* Tooltip */}
                        <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-[9px] px-2 py-1 rounded-sm pointer-events-none whitespace-nowrap z-30 shadow-md flex flex-col gap-0.5">
                          <span className="font-bold">{item.day} Log counts:</span>
                          <span className="text-indigo-400 font-mono">Dockets: {item.Docket}</span>
                          <span className="text-violet-400 font-mono">Mail: {item.Mail}</span>
                          <span className="text-emerald-400 font-mono">Phone: {item.Phone}</span>
                        </span>
                      </div>
                      <span className="text-[9px] font-semibold text-slate-500 mt-2 font-mono">
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-2 text-[8px] text-slate-500">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                  <span>Docket</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                  <span>Mail</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
                  <span>Phone Call</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentSlide === 2 && (
          /* SLIDE 3: MONTHLY TREND */
          <motion.div
            key="co-slide-monthly"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-stretch min-h-[240px]"
            id="co-carousel-slide-monthly"
          >
            {/* Left side info */}
            <div className="flex-1 flex flex-col justify-between space-y-4 font-sans">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] font-mono uppercase font-black tracking-wider mb-2">
                  <ShieldAlert className="w-3 h-3" />
                  <span>Monthly Compliance Log</span>
                </div>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                  Monthly SLA Remediation Success
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-lg">
                  Integrates customer escalation metrics to guarantee compliance with high-tier corporate internet services. Monitors resolution rates, stakeholder mediation, and critical backlog reduction.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Monthly Volume</span>
                  <span className="text-sm font-bold text-slate-200">144 Tickets</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Mediation Target</span>
                  <span className="text-sm font-bold text-cyan-400">&gt; 95.0%</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Actual Attained</span>
                  <span className="text-sm font-bold text-emerald-400">97.2%</span>
                </div>
              </div>
            </div>

            {/* Right side circular compliance gauge */}
            <div className="flex-1 min-h-[160px] bg-slate-950/85 border border-slate-800 p-4 rounded-xl flex flex-col justify-between items-center relative overflow-hidden font-sans">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase self-start w-full text-left">
                SLA Compliance Verification
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
                    stroke="url(#complaintSlaGrad)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={251.2}
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 * (1 - 0.972) }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                  <defs>
                    <linearGradient id="complaintSlaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <span className="text-base font-black font-mono text-cyan-400">97.2%</span>
                  <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">SUCCESS</span>
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
            key="co-slide-incidents"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-stretch min-h-[240px]"
            id="co-carousel-slide-incidents"
          >
            {/* Left side info */}
            <div className="flex-1 flex flex-col justify-between space-y-4 font-sans">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-mono uppercase font-black tracking-wider mb-2">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Unresolved Complaints Feed</span>
                </div>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                  Pending Redressal & Support Backlog
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-lg">
                  Real-time backplane incident log representing pending customer complaints. Escalation handlers, NOC desk supervisors, and regional managers must audit these records before closure.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl font-sans">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Pending Solves</span>
                  <span className="text-sm font-bold text-rose-400 animate-pulse font-mono">{pendingCount} Active</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl font-sans">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Closed Today</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">{solvedCount} Logs</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl font-sans">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Total Logged</span>
                  <span className="text-sm font-bold text-slate-200 font-mono">{complaints.length} Logs</span>
                </div>
              </div>
            </div>

            {/* Right side list feed */}
            <div className="flex-1 min-h-[160px] bg-slate-950/85 border border-slate-800 p-4 rounded-xl flex flex-col justify-between relative overflow-hidden font-sans">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Live Complaint Queue</span>
                <span className="text-[9px] font-mono text-rose-400 flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" /> Live Feed
                </span>
              </div>

              <div className="space-y-2 my-auto max-h-[110px] overflow-y-auto pr-1">
                {complaints.length > 0 ? (
                  complaints.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-start gap-2 bg-slate-900/50 border border-slate-800 p-2 rounded-lg text-[10px]">
                      <div className="p-1.5 bg-violet-950/60 text-violet-400 rounded-md shrink-0">
                        <Inbox className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-200 truncate font-mono">{item.userId}</span>
                          <span className="text-[8px] font-mono text-indigo-400 uppercase font-black">{item.reference}</span>
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
                    <span className="text-xs font-bold text-emerald-400">All Complaint Queues Stable</span>
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

      {/* Slide Navigation Buttons */}
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

      {/* Bottom Dot Indicators */}
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
