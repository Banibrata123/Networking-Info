import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Activity,
  Terminal,
  Cpu,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Server,
  Network
} from 'lucide-react';
import { TechInformationUpdate } from '../types';

interface Props {
  updates: TechInformationUpdate[];
}

export default function TechInformationUpdateCarousel({ updates }: Props) {
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

  // Calculations for Today's Updates
  const todayStr = new Date().toISOString().split('T')[0];
  const todayUpdates = updates.filter((u) => u.date && u.date.includes(todayStr));

  // Hourly Diagnostic Distribution
  const hourlyDiagnostics = [
    { hour: '06:00', load: 15 },
    { hour: '09:00', load: 55 },
    { hour: '12:00', load: 85 },
    { hour: '15:00', load: 70 },
    { hour: '18:00', load: 45 },
    { hour: '21:00', load: 20 }
  ];

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 md:p-8 shadow-2xl select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id="tech-carousel-container"
    >
      {/* Network Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="tech-grid" width="36" height="36" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.1" className="text-emerald-400 fill-current" />
              <path d="M 36 0 L 0 0 0 36" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-emerald-500" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tech-grid)" />
        </svg>
      </div>

      {/* TOP RIGHT OVERLAY: Live Clock & Network Monitoring */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30 flex flex-col md:flex-row items-end md:items-center gap-2 select-none pointer-events-none">
        <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-400 animate-pulse">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span>24x7 Network Monitoring</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full text-[9px] font-mono font-bold text-slate-300 shadow-sm">
          <Clock className="w-3 h-3 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span className="text-emerald-400 font-extrabold uppercase tracking-wide">Live Clock:</span>
          <span>{formatLiveClock()}</span>
          <span className="text-slate-500 text-[8px] hidden md:inline">| {formatLiveDate()}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentSlide === 0 && (
          /* SLIDE 1: TODAY INFORMATION UPDATE */
          <motion.div
            key="tech-slide-today"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-stretch min-h-[240px]"
            id="tech-carousel-slide-today"
          >
            {/* Left Info Panel */}
            <div className="flex-1 flex flex-col justify-between space-y-4 font-sans">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono uppercase font-black tracking-wider mb-2">
                  <Terminal className="w-3 h-3" />
                  <span>Today Information Update</span>
                </div>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                  Real-time Core Infrastructure Broadcasts
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-lg">
                  Integrates real-time announcements submitted by the network operation center and support engineers. Ensures dispatchers stay synchronized on current backend gateway adjustments and SLA changes.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Updates Today</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">{todayUpdates.length} Bulletins</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Active Gateway</span>
                  <span className="text-sm font-bold text-slate-200">BGP Cluster</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Internal Sync</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">100% Active</span>
                </div>
              </div>
            </div>

            {/* Right Live Stream List Feed */}
            <div className="flex-1 min-h-[160px] bg-slate-950/85 border border-slate-800 p-4 rounded-xl flex flex-col justify-between relative overflow-hidden font-sans">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Active Broadcast Feed</span>
                <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> Today Live Clock
                </span>
              </div>

              <div className="space-y-2 my-auto max-h-[110px] overflow-y-auto pr-1">
                {todayUpdates.length > 0 ? (
                  todayUpdates.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-start gap-2 bg-slate-900/50 border border-slate-800 p-2 rounded-lg text-[10px]">
                      <div className="p-1.5 bg-emerald-950/60 text-emerald-400 rounded-md shrink-0">
                        <Cpu className="w-3.5 h-3.5 animate-pulse" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-200 truncate">{item.heading}</span>
                          <span className="text-[8px] font-mono text-emerald-400 uppercase font-black">{item.addedBy}</span>
                        </div>
                        <p className="text-slate-400 truncate mt-0.5">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mb-1" />
                    <span className="text-xs font-bold text-emerald-400">All Systems Synced</span>
                    <span className="text-[9px] text-slate-500">No high priority bulletins published today.</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-2 text-[9px] text-slate-500 border-t border-slate-800/60 pt-1">
                <span>Total overall updates: {updates.length}</span>
                <span className="flex items-center gap-1 font-semibold text-emerald-400">
                  <Clock className="w-3 h-3 text-emerald-400 animate-bounce" /> Live Clock
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {currentSlide === 1 && (
          /* SLIDE 2: DAILY ROUTING & BANDWIDTH TREND */
          <motion.div
            key="tech-slide-routing"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-stretch min-h-[240px]"
            id="tech-carousel-slide-routing"
          >
            {/* Left Info Panel */}
            <div className="flex-1 flex flex-col justify-between space-y-4 font-sans">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono uppercase font-black tracking-wider mb-2">
                  <Network className="w-3 h-3" />
                  <span>Bandwidth Diagnostics</span>
                </div>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                  Dynamic Core Bandwidth & ISP Metrics
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-lg">
                  Analyzes trunk-line utilization indices. Real-time routing updates are broadcasted to optimize active data streams and manage user bandwidth policies during high load segments.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Max Bandwidth</span>
                  <span className="text-sm font-bold text-emerald-400">40 Gbps</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Gateway Latency</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">1.2 ms</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">RADIUS Status</span>
                  <span className="text-sm font-bold text-slate-200">Stable</span>
                </div>
              </div>
            </div>

            {/* Right Visual Bar Chart */}
            <div className="flex-1 min-h-[160px] bg-slate-950/85 border border-slate-800 p-4 rounded-xl flex flex-col justify-between relative overflow-hidden font-sans">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Hourly Routing Load Index</span>
                <span className="text-[9px] font-mono text-emerald-400">Core Network Feed</span>
              </div>

              <div className="flex items-end justify-between h-28 pt-4 gap-2 border-b border-slate-800">
                {hourlyDiagnostics.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center group cursor-pointer">
                    <div className="w-full relative flex items-end justify-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${item.load * 0.9}px` }}
                        transition={{ duration: 0.6, delay: idx * 0.05 }}
                        className="w-8/12 rounded-t-sm transition-all duration-200 bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:to-teal-300 shadow-xs"
                      />
                      {/* Tooltip */}
                      <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded-sm pointer-events-none whitespace-nowrap z-30 shadow-md">
                        {item.load}% Core Load
                      </span>
                    </div>
                    <span className="text-[9px] font-semibold text-slate-500 mt-2 font-mono">
                      {item.hour}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-2 text-[8px] text-slate-500">
                <span>Minimum load</span>
                <span>Active Core logs</span>
                <span className="flex items-center gap-1 font-semibold text-emerald-400">
                  <Clock className="w-3 h-3 text-emerald-400 animate-spin" /> Live Clock
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {currentSlide === 2 && (
          /* SLIDE 3: HARDWARE BULLETINS & FIRMWARE TIMELINE */
          <motion.div
            key="tech-slide-firmware"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-stretch min-h-[240px]"
            id="tech-carousel-slide-firmware"
          >
            {/* Left Info Panel */}
            <div className="flex-1 flex flex-col justify-between space-y-4 font-sans">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono uppercase font-black tracking-wider mb-2">
                  <Server className="w-3 h-3" />
                  <span>CPE Hardware & Firmware</span>
                </div>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                  Firmware Verification & OLT Trunks
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-lg">
                  Monitors hardware vendor software builds (Digisol, OVT, CSY). Distributes mandatory configuration scripts to keep active fiber GPON splitters running at optimal transmission power.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Active Bulletins</span>
                  <span className="text-sm font-bold text-slate-200">12 Pending</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">SLA Standards</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">100% Met</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Mean Time Sync</span>
                  <span className="text-sm font-bold text-slate-200">3.8 mins</span>
                </div>
              </div>
            </div>

            {/* Right Visual Gauge */}
            <div className="flex-1 min-h-[160px] bg-slate-950/85 border border-slate-800 p-4 rounded-xl flex flex-col justify-between items-center relative overflow-hidden font-sans">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase self-start w-full text-left">
                OLT Trunk Verification Index
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
                    stroke="url(#techSlaGrad)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={251.2}
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 * (1 - 0.999) }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                  <defs>
                    <linearGradient id="techSlaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <span className="text-base font-black font-mono text-emerald-400">99.9%</span>
                  <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">VERIFIED</span>
                </div>
              </div>

              <div className="w-full flex items-center justify-between text-[9px] text-slate-500 mt-2">
                <span>0% SLA</span>
                <span>Active RADIUS core</span>
                <span className="flex items-center gap-1 font-semibold text-emerald-400">
                  <Clock className="w-3 h-3 text-emerald-400 animate-spin" /> Live Clock
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {currentSlide === 3 && (
          /* SLIDE 4: NETWORK INTEGRITY & INCIDENT ADVISORY */
          <motion.div
            key="tech-slide-integrity"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-stretch min-h-[240px]"
            id="tech-carousel-slide-integrity"
          >
            {/* Left Info Panel */}
            <div className="flex-1 flex flex-col justify-between space-y-4 font-sans">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono uppercase font-black tracking-wider mb-2">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Network Maintenance advisories</span>
                </div>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                  High-Priority Maintenance advisories
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-lg">
                  Integrates critical alerts, high latency reports, and fiber routing failovers. Ensure support desk representatives audit these bulletins to prevent customer dispatch fatigue.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Active Warnings</span>
                  <span className="text-sm font-bold text-rose-400 animate-pulse font-mono">0 Logged</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">SLA Compliance</span>
                  <span className="text-sm font-bold text-emerald-400">100% Safe</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">System Health</span>
                  <span className="text-sm font-bold text-slate-200">Excellent</span>
                </div>
              </div>
            </div>

            {/* Right Visual Terminal Logs */}
            <div className="flex-1 min-h-[160px] bg-slate-950/85 border border-slate-800 p-4 rounded-xl flex flex-col justify-between relative overflow-hidden font-mono text-[10px] text-emerald-400">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-sans">NOC Core Console</span>
                <span className="text-[9px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> Diagnostic Live
                </span>
              </div>

              <div className="space-y-1 my-auto leading-relaxed p-2 bg-black/60 rounded-lg border border-slate-800 font-mono">
                <div>[NOC-CORE] BGP Peers: Established (VLAN 502)</div>
                <div>[NOC-CORE] GPON Port 4 Tx: +1.8dBm (Stable)</div>
                <div>[NOC-CORE] RADIUS database state: OK</div>
                <div className="text-slate-500">[NOC-CORE] Listening on background webhook...</div>
              </div>

              <div className="flex items-center justify-between mt-2 text-[9px] text-slate-500 border-t border-slate-800/60 pt-1 font-sans">
                <span>NOC Supervisors: Verified</span>
                <span className="flex items-center gap-1 font-semibold text-emerald-400">
                  <Clock className="w-3 h-3 text-emerald-400 animate-pulse" /> Live Clock
                </span>
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
                ? 'w-5 bg-emerald-500' 
                : 'w-1.5 bg-slate-700 hover:bg-slate-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
