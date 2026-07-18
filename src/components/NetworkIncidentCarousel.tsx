import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Activity,
  Calendar,
  AlertTriangle,
  Clock,
  Shield,
  Radio,
  Wifi,
  Server
} from 'lucide-react';
import { NetworkIncident } from '../types';

interface Props {
  incidents: NetworkIncident[];
  setCurrentView?: (view: string) => void;
}

export default function NetworkIncidentCarousel({ incidents }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play interval: rotate slide every 8.5 seconds unless hovered (manual navigation resets timer)
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

  // Aggregated data calculations for trends
  const openIncidents = incidents.filter((i) => i.status === 'Open');
  const majorOutages = incidents.filter((i) => i.status === 'Open' && i.type === 'Major Issue');
  const activeZoneOutages = incidents.filter((i) => i.status === 'Open' && i.type === 'Zone');

  // Daily pattern (mock layout based on current incidents)
  const hourlyIncidents = [
    { hour: '00:00 - 04:00', count: 1, active: false },
    { hour: '04:00 - 08:00', count: 2, active: false },
    { hour: '08:00 - 12:00', count: 5, active: true },
    { hour: '12:00 - 16:00', count: 3, active: true },
    { hour: '16:00 - 20:00', count: 6, active: true },
    { hour: '20:00 - 00:00', count: 2, active: false }
  ];

  // Weekly counts (Mock trend representation)
  const weeklyIncidents = [
    { day: 'Mon', count: 2, label: 'Stable' },
    { day: 'Tue', count: 3, label: 'Optimized' },
    { day: 'Wed', count: 1, label: 'Clear' },
    { day: 'Thu', count: 7, label: 'Fiber Cut (Zone)' },
    { day: 'Fri', count: 4, label: 'Switch Flap' },
    { day: 'Sat', count: 2, label: 'Minimal' },
    { day: 'Sun', count: 1, label: 'Quiet' }
  ];

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 md:p-8 shadow-2xl select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id="network-incident-carousel"
    >
      {/* Dynamic Animated Background Mesh */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-indigo-500" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <AnimatePresence mode="wait">
        {currentSlide === 0 && (
          /* SLIDE 1: DAILY TREND */
          <motion.div
            key="slide-daily"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-stretch h-full"
            id="carousel-slide-daily"
          >
            {/* Left side info */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                {/* LIVE MONITORING BADGE */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full tracking-widest uppercase font-mono">
                    LIVE MONITORING
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                    DAILY PATTERN
                  </span>
                </div>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Daily Incident & Latency Trend
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-lg">
                  Real-time backplane log tracking across all regional distribution terminals. Active surveillance registers hourly surge anomalies and optical attenuation spikes.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Active Load</span>
                  <span className="text-sm font-bold text-slate-200">92.4%</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Hourly Incidents</span>
                  <span className="text-sm font-bold text-indigo-400">0.4 / hr</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">MTTR (24h)</span>
                  <span className="text-sm font-bold text-emerald-400">38 mins</span>
                </div>
              </div>
            </div>

            {/* Right side interactive visual chart */}
            <div className="flex-1 min-h-[160px] bg-slate-950/85 border border-slate-800 p-4 rounded-xl flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Surge Load Matrix (24 Hours)</span>
                <span className="text-[9px] font-mono text-indigo-400">Auto-updating</span>
              </div>

              <div className="flex items-end justify-between h-28 pt-4 gap-2 border-b border-slate-800">
                {hourlyIncidents.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center group cursor-pointer">
                    <div className="w-full relative flex items-end justify-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${item.count * 12}px` }}
                        transition={{ duration: 0.6, delay: idx * 0.05 }}
                        className={`w-full rounded-t-sm transition-all duration-200 ${
                          item.active 
                            ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 hover:to-indigo-300 shadow-md shadow-indigo-500/10' 
                            : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                      />
                      {/* Tooltip */}
                      <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded-sm pointer-events-none whitespace-nowrap z-30 shadow-md">
                        {item.count} alerts
                      </span>
                    </div>
                    <span className="text-[8px] font-mono text-slate-500 mt-2 rotate-12 sm:rotate-0 whitespace-nowrap">
                      {item.hour.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-2 text-[9px] text-slate-500">
                <span>00:00 (Start)</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  <span>Interactive Telemetry</span>
                </div>
                <span>24:00 (End)</span>
              </div>
            </div>
          </motion.div>
        )}

        {currentSlide === 1 && (
          /* SLIDE 2: WEEKLY TREND */
          <motion.div
            key="slide-weekly"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-stretch h-full"
            id="carousel-slide-weekly"
          >
            {/* Left side info */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                {/* LIVE MONITORING BADGE */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full tracking-widest uppercase font-mono">
                    LIVE MONITORING
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                    WEEKLY PATTERN
                  </span>
                </div>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-violet-400" />
                  Weekly Backplane Reliability
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-lg">
                  Cumulative statistics reflecting weekly mean-time-between-failures (MTBF) and overall power stability indicators. Heavy load peaks occur on mid-week.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Weekly Events</span>
                  <span className="text-sm font-bold text-violet-400">19 Total</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">SLA Index</span>
                  <span className="text-sm font-bold text-emerald-400">99.82%</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Worst Day</span>
                  <span className="text-sm font-bold text-rose-400">Thursday</span>
                </div>
              </div>
            </div>

            {/* Right side weekly bar graph */}
            <div className="flex-1 min-h-[160px] bg-slate-950/85 border border-slate-800 p-4 rounded-xl flex flex-col justify-between relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Weekly Incident Density</span>
                <span className="text-[9px] font-mono text-violet-400">Resolved Index</span>
              </div>

              <div className="flex items-end justify-between h-28 pt-4 gap-2 border-b border-slate-800">
                {weeklyIncidents.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center group cursor-pointer">
                    <div className="w-full relative flex items-end justify-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${item.count * 11}px` }}
                        transition={{ duration: 0.6, delay: idx * 0.04 }}
                        className={`w-full rounded-t-sm transition-all duration-200 ${
                          item.count > 4 
                            ? 'bg-gradient-to-t from-rose-600 to-rose-400 hover:to-rose-300 shadow-md' 
                            : 'bg-gradient-to-t from-violet-600 to-violet-400 hover:to-violet-300 shadow-xs'
                        }`}
                      />
                      {/* Tooltip */}
                      <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-[9px] px-2 py-0.5 rounded-sm pointer-events-none whitespace-nowrap z-30 shadow-md">
                        {item.count} outages ({item.label})
                      </span>
                    </div>
                    <span className="text-[9px] font-semibold text-slate-500 mt-2">
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-2 text-[9px] text-slate-500">
                <span>Mo</span>
                <span className="italic">Click columns to inspect regional outages</span>
                <span>Su</span>
              </div>
            </div>
          </motion.div>
        )}

        {currentSlide === 2 && (
          /* SLIDE 3: MONTHLY TREND */
          <motion.div
            key="slide-monthly"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-stretch h-full"
            id="carousel-slide-monthly"
          >
            {/* Left side info */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                {/* LIVE MONITORING BADGE */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full tracking-widest uppercase font-mono">
                    LIVE MONITORING
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                    MONTHLY PERFORMANCE
                  </span>
                </div>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-400" />
                  Monthly SLA Backhaul Attainment
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-lg">
                  Long-term tracking ensures ISP backhaul contracts meet specified thresholds. Repeat fiber cuts are documented for structural transit adjustments.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Monthly Outages</span>
                  <span className="text-sm font-bold text-slate-200">54 Registered</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">SLA SLA Target</span>
                  <span className="text-sm font-bold text-emerald-400">&gt; 99.90%</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">SLA Achieved</span>
                  <span className="text-sm font-bold text-emerald-400">99.93%</span>
                </div>
              </div>
            </div>

            {/* Right side circular dial animation */}
            <div className="flex-1 min-h-[160px] bg-slate-950/85 border border-slate-800 p-4 rounded-xl flex flex-col justify-between items-center relative overflow-hidden">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase self-start w-full text-left">
                SLA Integrity Dial
              </span>

              <div className="relative flex items-center justify-center my-auto">
                {/* SVG Progress Circle */}
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
                    stroke="url(#slaGrad)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={251.2}
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 * (1 - 0.9993) }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                  <defs>
                    <linearGradient id="slaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <span className="text-base font-black font-mono text-emerald-400">99.93%</span>
                  <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">STABLE</span>
                </div>
              </div>

              <div className="w-full flex items-center justify-between text-[9px] text-slate-500 mt-2">
                <span>0% Down</span>
                <span>Active Core backplane</span>
                <span>100% Up</span>
              </div>
            </div>
          </motion.div>
        )}

        {currentSlide === 3 && (
          /* SLIDE 4: CURRENT OUTAGES SUMMARY */
          <motion.div
            key="slide-hazards"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-stretch h-full"
            id="carousel-slide-hazards"
          >
            {/* Left side info */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                {/* LIVE MONITORING BADGE */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full tracking-widest uppercase font-mono">
                    LIVE MONITORING
                  </span>
                  <span className="text-[9px] font-mono text-rose-500 bg-rose-950/50 border border-rose-900/50 px-2 py-0.5 rounded-full">
                    ACTIVE HAZARDS
                  </span>
                </div>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  Active Backhaul Outages
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-lg">
                  Real-time backhaul logs indicating major unresolved network incidents. Standard operating procedure mandates rapid field-dispatch on open tickets.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Open Incidents</span>
                  <span className={`text-sm font-bold ${openIncidents.length > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`}>
                    {openIncidents.length} Active
                  </span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Major Outages</span>
                  <span className="text-sm font-bold text-violet-400">{majorOutages.length} Open</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Zone Failures</span>
                  <span className="text-sm font-bold text-amber-400">{activeZoneOutages.length} Open</span>
                </div>
              </div>
            </div>

            {/* Right side live hazards summary */}
            <div className="flex-1 min-h-[160px] bg-slate-950/85 border border-slate-800 p-4 rounded-xl flex flex-col justify-between relative overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Live Hazards Feed</span>
                <span className="text-[9px] font-mono text-rose-400 animate-pulse">● Live Stream</span>
              </div>

              <div className="space-y-2 my-auto max-h-[110px] overflow-y-auto pr-1">
                {openIncidents.length > 0 ? (
                  openIncidents.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-start gap-2 bg-rose-950/20 border border-rose-900/40 p-2 rounded-lg text-[10px]">
                      <div className="p-1 bg-rose-900/40 text-rose-400 rounded-md shrink-0">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-200 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] bg-rose-900/60 text-rose-300 px-1 rounded-sm uppercase tracking-wider">{item.type}</span>
                          <span className="font-mono text-slate-400 text-[8px]">{item.date.split('T')[1]}</span>
                        </div>
                        <p className="text-slate-300 truncate mt-0.5" title={item.problem}>
                          {item.problem}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <div className="p-2 bg-emerald-950/30 text-emerald-400 border border-emerald-900/35 rounded-full mb-1">
                      <Shield className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-emerald-400">All Backplanes Clear</span>
                    <span className="text-[9px] text-slate-500">No major outages currently flagged.</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[9px] text-slate-500 mt-2 pt-1 border-t border-slate-800/60">
                <span>Total unresolved: {openIncidents.length}</span>
                <span>Active backup power status: OK</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer hover:scale-105 z-20"
        title="Previous Trend"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer hover:scale-105 z-20"
        title="Next Trend"
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
                ? 'w-5 bg-indigo-500' 
                : 'w-1.5 bg-slate-700 hover:bg-slate-500'
            }`}
            title={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
