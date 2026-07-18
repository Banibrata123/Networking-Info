import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Activity,
  Calendar,
  Share2,
  Cpu,
  BarChart3,
  WifiOff,
  Database,
  Layers,
  CheckCircle,
  HelpCircle,
  Hash
} from 'lucide-react';
import { UnlinkRouter } from '../types';

interface Props {
  routers: UnlinkRouter[];
}

export default function UnlinkRouterCarousel({ routers }: Props) {
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
  const digisolCount = routers.filter((r) => r.routerType === 'Digisol').length;
  const ovtCount = routers.filter((r) => r.routerType === 'OVT').length;
  const csyCount = routers.filter((r) => r.routerType === 'CSY').length;
  const othersCount = routers.filter((r) => r.routerType === 'Others').length;

  // Slide 1 Data: Daily Unlink Distribution Hours
  const hourlyDistribution = [
    { hour: '08:00', count: 3 },
    { hour: '11:00', count: 8 },
    { hour: '14:00', count: 12 },
    { hour: '17:00', count: 7 },
    { hour: '20:00', count: 4 },
    { hour: '23:00', count: 1 }
  ];

  // Slide 2 Data: Weekly Trend by Brand type
  const weeklyDistribution = [
    { day: 'Mon', Digisol: 4, OVT: 2, CSY: 1 },
    { day: 'Tue', Digisol: 6, OVT: 3, CSY: 2 },
    { day: 'Wed', Digisol: 8, OVT: 5, CSY: 3 },
    { day: 'Thu', Digisol: 5, OVT: 2, CSY: 1 },
    { day: 'Fri', Digisol: 9, OVT: 6, CSY: 4 },
    { day: 'Sat', Digisol: 3, OVT: 2, CSY: 1 },
    { day: 'Sun', Digisol: 2, OVT: 1, CSY: 0 }
  ];

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 md:p-8 shadow-2xl select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id="unlink-carousel-container"
    >
      {/* Decorative Network Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="router-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" className="text-indigo-400 fill-current" />
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-indigo-500" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#router-grid)" />
        </svg>
      </div>

      {/* TOP RIGHT OVERLAY: 24x7 Network Monitoring & Live Clock */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30 flex flex-col md:flex-row items-end md:items-center gap-2 select-none pointer-events-none">
        <div className="flex items-center gap-1.5 bg-indigo-950/80 border border-indigo-500/20 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-indigo-400 animate-pulse">
          <Activity className="w-3 h-3 text-indigo-400" />
          <span>24x7 Network Monitoring</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full text-[9px] font-mono font-bold text-slate-300 shadow-sm">
          <Clock className="w-3 h-3 text-indigo-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span>{formatLiveClock()}</span>
          <span className="text-slate-500 text-[8px] hidden md:inline">| {formatLiveDate()}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentSlide === 0 && (
          /* SLIDE 1: DAILY TREND */
          <motion.div
            key="ul-slide-daily"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-stretch min-h-[240px]"
            id="ul-carousel-slide-daily"
          >
            {/* Left Info Panel */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-mono uppercase font-black tracking-wider mb-2">
                  <BarChart3 className="w-3 h-3" />
                  <span>Daily Unlink Distribution</span>
                </div>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                  Daily MAC Reset & Hardware Unlink Cycle
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-lg font-sans">
                  Monitors active MAC unbinding request patterns from local branch operators (LBOs) and site engineers. Peak hours correspond to hardware upgrade deployments and field provisioning slots.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Daily Peak Hour</span>
                  <span className="text-sm font-bold text-indigo-400">14:00 - 16:00</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Reset Success Rate</span>
                  <span className="text-sm font-bold text-emerald-400">100% Secure</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Mean Process Time</span>
                  <span className="text-sm font-bold text-slate-200">4.5 mins</span>
                </div>
              </div>
            </div>

            {/* Right Visual Chart */}
            <div className="flex-1 min-h-[160px] bg-slate-950/85 border border-slate-800 p-4 rounded-xl flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Hourly Reset Activity Index</span>
                <span className="text-[9px] font-mono text-indigo-400">Active AAA Server</span>
              </div>

              <div className="flex items-end justify-between h-28 pt-4 gap-2 border-b border-slate-800">
                {hourlyDistribution.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center group cursor-pointer">
                    <div className="w-full relative flex items-end justify-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${item.count * 7}px` }}
                        transition={{ duration: 0.6, delay: idx * 0.05 }}
                        className="w-8/12 rounded-t-sm transition-all duration-200 bg-gradient-to-t from-indigo-600 to-cyan-400 group-hover:to-cyan-300 shadow-xs"
                      />
                      {/* Tooltip */}
                      <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded-sm pointer-events-none whitespace-nowrap z-30 shadow-md">
                        {item.count} Unlinks Filed
                      </span>
                    </div>
                    <span className="text-[9px] font-semibold text-slate-500 mt-2">
                      {item.hour}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-2 text-[8px] text-slate-500">
                <span>Minimum load segment</span>
                <span>Active RADIUS database sync</span>
                <span>Maximum load segment</span>
              </div>
            </div>
          </motion.div>
        )}

        {currentSlide === 1 && (
          /* SLIDE 2: WEEKLY TREND */
          <motion.div
            key="ul-slide-weekly"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-stretch min-h-[240px]"
            id="ul-carousel-slide-weekly"
          >
            {/* Left Info Panel */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[9px] font-mono uppercase font-black tracking-wider mb-2">
                  <Calendar className="w-3 h-3" />
                  <span>Weekly Brand Analytics</span>
                </div>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                  CPE Hardware Manufacturer Breakdowns
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-lg font-sans">
                  Distribution analysis of MAC releases grouped by manufacturer client terminals (Digisol, OVT, CSY). Identifies which ONU hardware vendor requires the most field-level config adjustments.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Digisol Resets</span>
                  <span className="text-sm font-bold text-slate-200">{digisolCount} Logs</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">OVT Resets</span>
                  <span className="text-sm font-bold text-cyan-400">{ovtCount} Logs</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">CSY Resets</span>
                  <span className="text-sm font-bold text-violet-400">{csyCount} Logs</span>
                </div>
              </div>
            </div>

            {/* Right Visual Stacked Chart */}
            <div className="flex-1 min-h-[160px] bg-slate-950/85 border border-slate-800 p-4 rounded-xl flex flex-col justify-between relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Weekly Brand Resets Timeline</span>
                <span className="text-[9px] font-mono text-violet-400">Total Unlink Streams</span>
              </div>

              <div className="flex items-end justify-between h-28 pt-4 gap-2 border-b border-slate-800">
                {weeklyDistribution.map((item, idx) => {
                  const total = item.Digisol + item.OVT + item.CSY;
                  const dHeight = total > 0 ? (item.Digisol / 20) * 100 : 0;
                  const oHeight = total > 0 ? (item.OVT / 20) * 100 : 0;
                  const cHeight = total > 0 ? (item.CSY / 20) * 100 : 0;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group cursor-pointer">
                      <div className="w-full flex flex-col justify-end items-center h-full relative">
                        {/* CSY stack segment */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${cHeight}px` }}
                          transition={{ duration: 0.6, delay: idx * 0.03 }}
                          className="w-7/12 bg-violet-500 rounded-t-xs"
                        />
                        {/* OVT stack segment */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${oHeight}px` }}
                          transition={{ duration: 0.6, delay: idx * 0.03 + 0.05 }}
                          className="w-7/12 bg-cyan-400"
                        />
                        {/* Digisol stack segment */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${dHeight}px` }}
                          transition={{ duration: 0.6, delay: idx * 0.03 + 0.1 }}
                          className="w-7/12 bg-indigo-600 rounded-b-xs"
                        />
                        {/* Tooltip */}
                        <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-[9px] px-2 py-1 rounded-sm pointer-events-none whitespace-nowrap z-30 shadow-md flex flex-col gap-0.5">
                          <span>{item.day} Log Counts:</span>
                          <span className="text-indigo-400 font-mono">Digisol: {item.Digisol}</span>
                          <span className="text-cyan-400 font-mono">OVT: {item.OVT}</span>
                          <span className="text-violet-400 font-mono">CSY: {item.CSY}</span>
                        </span>
                      </div>
                      <span className="text-[9px] font-semibold text-slate-500 mt-2">
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-2 text-[8px] text-slate-500">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                  <span>Digisol</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  <span>OVT</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
                  <span>CSY</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentSlide === 2 && (
          /* SLIDE 3: MONTHLY TREND */
          <motion.div
            key="ul-slide-monthly"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-stretch min-h-[240px]"
            id="ul-carousel-slide-monthly"
          >
            {/* Left Info Panel */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] font-mono uppercase font-black tracking-wider mb-2">
                  <Layers className="w-3 h-3" />
                  <span>Monthly Compliance Log</span>
                </div>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                  SLA Dispatch Verification Compliance
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-lg font-sans">
                  Evaluates MAC unlinking precision against service level targets. Verifying the physical macAddresses and zoneCodes limits unauthorized hardware changes on active fiber GPON splitter trunks.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Monthly Reset Vol</span>
                  <span className="text-sm font-bold text-slate-200">182 unlinks</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">IPoE Supplemental Rate</span>
                  <span className="text-sm font-bold text-cyan-400">99.1% logs</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">SLA Precision</span>
                  <span className="text-sm font-bold text-emerald-400">99.8% Perfect</span>
                </div>
              </div>
            </div>

            {/* Right Visual Circular SLA Dial */}
            <div className="flex-1 min-h-[160px] bg-slate-950/85 border border-slate-800 p-4 rounded-xl flex flex-col justify-between items-center relative overflow-hidden">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase self-start w-full text-left">
                Mac Validation Compliance
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
                    stroke="url(#routerSlaGrad)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={251.2}
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 * (1 - 0.998) }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                  <defs>
                    <linearGradient id="routerSlaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <span className="text-base font-black font-mono text-cyan-400">99.8%</span>
                  <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">VALIDATED</span>
                </div>
              </div>

              <div className="w-full flex items-center justify-between text-[9px] text-slate-500 mt-2">
                <span>0% SLA</span>
                <span>Active RADIUS core logs</span>
                <span>100% SLA</span>
              </div>
            </div>
          </motion.div>
        )}

        {currentSlide === 3 && (
          /* SLIDE 4: CURRENT INCIDENTS SUMMARY */
          <motion.div
            key="ul-slide-incidents"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-stretch min-h-[240px]"
            id="ul-carousel-slide-incidents"
          >
            {/* Left Info Panel */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-mono uppercase font-black tracking-wider mb-2">
                  <WifiOff className="w-3 h-3" />
                  <span>Unbind Action Stream</span>
                </div>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                  Recent Router MAC Unlink Requests
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-lg font-sans">
                  Real-time backplane ticket queue representing client CPE router releases. Ensure authentication states are monitored at the OLT gateway router during physical disconnections.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Digisol Total</span>
                  <span className="text-sm font-bold text-indigo-400">{digisolCount} Logs</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">OVT Total</span>
                  <span className="text-sm font-bold text-cyan-400">{ovtCount} Logs</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Grand Total Logs</span>
                  <span className="text-sm font-bold text-slate-200">{routers.length} Logs</span>
                </div>
              </div>
            </div>

            {/* Right Live Stream List Feed */}
            <div className="flex-1 min-h-[160px] bg-slate-950/85 border border-slate-800 p-4 rounded-xl flex flex-col justify-between relative overflow-hidden font-sans">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Live Unlink Stream</span>
                <span className="text-[9px] font-mono text-cyan-400 flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" /> Stream Live
                </span>
              </div>

              <div className="space-y-2 my-auto max-h-[110px] overflow-y-auto pr-1">
                {routers.length > 0 ? (
                  routers.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-start gap-2 bg-slate-900/50 border border-slate-800 p-2 rounded-lg text-[10px]">
                      <div className="p-1.5 bg-indigo-950/60 text-indigo-400 rounded-md shrink-0">
                        <Cpu className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-200 truncate font-mono">{item.userId}</span>
                          <span className="text-[8px] font-mono text-indigo-400 uppercase font-black">{item.routerType}</span>
                        </div>
                        <p className="text-slate-400 truncate mt-0.5 font-mono">
                          {item.macAddress} ({item.connectionType})
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mb-1" />
                    <span className="text-xs font-bold text-emerald-400">All Nodes Connected</span>
                    <span className="text-[9px] text-slate-500">No active unbind requests in pool.</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-2 text-[9px] text-slate-500 border-t border-slate-800/60 pt-1">
                <span>Recent 3 registers shown</span>
                <span>Audit officers: Active</span>
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
                ? 'w-5 bg-indigo-500' 
                : 'w-1.5 bg-slate-700 hover:bg-slate-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
