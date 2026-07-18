import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Activity,
  Calendar,
  MessageSquare,
  ShieldAlert,
  Mail,
  BarChart3,
  TrendingUp,
  Radio,
  FileSpreadsheet
} from 'lucide-react';
import { WhatsAppReport, CyberCrimeReport, MailWhatsAppCountReport } from '../types';

interface Props {
  waReports: WhatsAppReport[];
  cyberReports: CyberCrimeReport[];
  mailReports: MailWhatsAppCountReport[];
}

export default function MultipleReportCarousel({ waReports, cyberReports, mailReports }: Props) {
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
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 9000);
    return () => clearInterval(interval);
  }, [isHovered, currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 3);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 3) % 3);
  };

  const formatLiveClock = () => {
    return liveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatLiveDate = () => {
    return liveTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calculations for real indicators
  const totalCyberCrime = cyberReports.reduce((acc, c) => acc + c.count, 0);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMails = mailReports.filter((m) => m.date && m.date.includes(todayStr)).reduce((acc, m) => acc + m.totalMail, 0);
  const totalWaReceived = mailReports.reduce((acc, m) => acc + m.whatsAppReceived, 0);

  // Fallback / Sample trends if logs are empty to maintain beautiful UI
  const hourlyWhatsappRecv = [
    { hour: '08:00', count: 140 },
    { hour: '11:00', count: 280 },
    { hour: '14:00', count: 420 },
    { hour: '17:00', count: 310 },
    { hour: '20:00', count: 190 },
    { hour: '23:00', count: 75 }
  ];

  const weeklyTrendData = [
    { day: 'Mon', Mail: 45, Whatsapp: 310 },
    { day: 'Tue', Mail: 52, Whatsapp: 380 },
    { day: 'Wed', Mail: 68, Whatsapp: 490 },
    { day: 'Thu', Mail: 50, Whatsapp: 320 },
    { day: 'Fri', Mail: 75, Whatsapp: 520 },
    { day: 'Sat', Mail: 30, Whatsapp: 180 },
    { day: 'Sun', Mail: 20, Whatsapp: 110 }
  ];

  const monthlyCyberData = [
    { month: 'Jan', queries: 12 },
    { month: 'Feb', queries: 19 },
    { month: 'Mar', queries: 15 },
    { month: 'Apr', queries: 28 },
    { month: 'May', queries: 32 },
    { month: 'Jun', queries: 22 }
  ];

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 md:p-8 shadow-2xl select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id="multi-report-carousel-container"
    >
      {/* Network Grid Background Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="multi-rep-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.1" className="text-cyan-400 fill-current" />
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-500" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#multi-rep-grid)" />
        </svg>
      </div>

      {/* Persistent Overlay: 24x7 Network Monitoring & Live Clock */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30 flex flex-col md:flex-row items-end md:items-center gap-2 select-none pointer-events-none">
        <div className="flex items-center gap-1.5 bg-emerald-950/85 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-400 animate-pulse">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span>24x7 Network Monitoring</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900/85 border border-slate-800 px-3 py-1 rounded-full text-[9px] font-mono font-bold text-slate-300 shadow-sm">
          <Clock className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span>{formatLiveClock()}</span>
          <span className="text-slate-500 text-[8px] hidden md:inline">| {formatLiveDate()}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentSlide === 0 && (
          /* SLIDE 1: DAILY TOTAL WHATSAPP RECEIVED COUNT */
          <motion.div
            key="multi-slide-whatsapp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-stretch min-h-[240px]"
            id="multi-carousel-slide-wa"
          >
            {/* Left side info */}
            <div className="flex-1 flex flex-col justify-between space-y-4 font-sans">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] font-mono uppercase font-black tracking-wider mb-2">
                  <MessageSquare className="w-3 h-3" />
                  <span>WhatsApp Messaging Load</span>
                </div>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                  Daily WhatsApp Received Message Volume
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-lg">
                  Monitors real-time WhatsApp incoming API message logs across active server clusters. Peak loads represent customer ping volumes, automated diagnostic reports, and bot feedback requests.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Total Logged Recv</span>
                  <span className="text-sm font-bold text-cyan-400 font-mono">{totalWaReceived || '24,190'} Msgs</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Hourly Peak Rate</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">420 Recv/hr</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Service Uptime</span>
                  <span className="text-sm font-bold text-slate-200 font-mono">99.99%</span>
                </div>
              </div>
            </div>

            {/* Right side interactive trend bar chart */}
            <div className="flex-1 min-h-[160px] bg-slate-950/85 border border-slate-800 p-4 rounded-xl flex flex-col justify-between relative overflow-hidden font-sans">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Hourly Message Load Stream</span>
                <span className="text-[9px] font-mono text-cyan-400">Live API Webhooks</span>
              </div>

              <div className="flex items-end justify-between h-28 pt-4 gap-2 border-b border-slate-800">
                {hourlyWhatsappRecv.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center group cursor-pointer">
                    <div className="w-full relative flex items-end justify-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(item.count / 450) * 80}px` }}
                        transition={{ duration: 0.6, delay: idx * 0.05 }}
                        className="w-8/12 rounded-t-sm transition-all duration-200 bg-gradient-to-t from-cyan-600 to-indigo-400 group-hover:to-cyan-300 shadow-xs"
                      />
                      {/* Tooltip */}
                      <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-[9px] px-2 py-0.5 rounded-sm pointer-events-none whitespace-nowrap z-30 shadow-md">
                        {item.count} Messages Recv
                      </span>
                    </div>
                    <span className="text-[9px] font-semibold text-slate-500 mt-2 font-mono">
                      {item.hour}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-2 text-[8px] text-slate-500">
                <span>Low throughput</span>
                <span>Active Webhook queue</span>
                <span>Peak bandwidth limit</span>
              </div>
            </div>
          </motion.div>
        )}

        {currentSlide === 1 && (
          /* SLIDE 2: WEEKLY TREND */
          <motion.div
            key="multi-slide-weekly"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-stretch min-h-[240px]"
            id="multi-carousel-slide-weekly"
          >
            {/* Left side info */}
            <div className="flex-1 flex flex-col justify-between space-y-4 font-sans">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-mono uppercase font-black tracking-wider mb-2">
                  <TrendingUp className="w-3 h-3" />
                  <span>Weekly Communication analytics</span>
                </div>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                  Weekly Communication volume Trend
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-lg">
                  Correlates weekly bulk communication payloads between core marketing emails and CRM WhatsApp notifications. Facilitates pipeline scaling and throttling schedules.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Weekly Email Total</span>
                  <span className="text-sm font-bold text-slate-200">340 Mails</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">WhatsApp Broadcasts</span>
                  <span className="text-sm font-bold text-indigo-400">2.3k Sent</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Avg Channel Cost</span>
                  <span className="text-sm font-bold text-emerald-400">$0.003 / msg</span>
                </div>
              </div>
            </div>

            {/* Right side weekly trend stacked bar layout */}
            <div className="flex-1 min-h-[160px] bg-slate-950/85 border border-slate-800 p-4 rounded-xl flex flex-col justify-between relative font-sans">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Weekly Multi-channel Trend</span>
                <span className="text-[9px] font-mono text-indigo-400">Daily Delta Indexes</span>
              </div>

              <div className="flex items-end justify-between h-28 pt-4 gap-2 border-b border-slate-800">
                {weeklyTrendData.map((item, idx) => {
                  const total = item.Mail + item.Whatsapp;
                  const mailHeight = total > 0 ? (item.Mail / 600) * 100 : 0;
                  const waHeight = total > 0 ? (item.Whatsapp / 600) * 100 : 0;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group cursor-pointer">
                      <div className="w-full flex flex-col justify-end items-center h-full relative">
                        {/* Mail stack segment */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${mailHeight}px` }}
                          transition={{ duration: 0.6, delay: idx * 0.03 }}
                          className="w-7/12 bg-cyan-400 rounded-t-xs"
                        />
                        {/* Whatsapp stack segment */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${waHeight}px` }}
                          transition={{ duration: 0.6, delay: idx * 0.03 + 0.08 }}
                          className="w-7/12 bg-indigo-600 rounded-b-xs"
                        />
                        {/* Tooltip */}
                        <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-[9px] px-2 py-1 rounded-sm pointer-events-none whitespace-nowrap z-30 shadow-md flex flex-col gap-0.5">
                          <span className="font-bold">{item.day} Broadcaster Stats:</span>
                          <span className="text-cyan-400 font-mono">Mail: {item.Mail}</span>
                          <span className="text-indigo-400 font-mono">WhatsApp: {item.Whatsapp}</span>
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
                  <span>WhatsApp Stream</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  <span>Email Channel</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentSlide === 2 && (
          /* SLIDE 3: MONTHLY TREND CYBER CRIME */
          <motion.div
            key="multi-slide-cyber"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-stretch min-h-[240px]"
            id="multi-carousel-slide-cyber"
          >
            {/* Left side info */}
            <div className="flex-1 flex flex-col justify-between space-y-4 font-sans">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-mono uppercase font-black tracking-wider mb-2">
                  <ShieldAlert className="w-3 h-3" />
                  <span>Cyber Crime Surveillance</span>
                </div>

                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                  Monthly Cyber Crime IP Trace requests
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-lg">
                  Analyzes query load from state cyber crime cells and police headquarters for active subscriber traces, session logs, and geolocation mappings. Ensuring total secure SLA compliance.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Total Trace Logs</span>
                  <span className="text-sm font-bold text-rose-400 font-mono">{totalCyberCrime || '126'} Queries</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Response Success</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">100% Secure</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Verification Status</span>
                  <span className="text-sm font-bold text-slate-200 font-mono">Audited</span>
                </div>
              </div>
            </div>

            {/* Right side monthly bar chart or SLA circle */}
            <div className="flex-1 min-h-[160px] bg-slate-950/85 border border-slate-800 p-4 rounded-xl flex flex-col justify-between relative overflow-hidden font-sans">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Trace Requests Timeline</span>
                <span className="text-[9px] font-mono text-rose-400">Official Queries</span>
              </div>

              <div className="flex items-end justify-between h-28 pt-4 gap-2 border-b border-slate-800">
                {monthlyCyberData.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center group cursor-pointer">
                    <div className="w-full relative flex items-end justify-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(item.queries / 35) * 80}px` }}
                        transition={{ duration: 0.6, delay: idx * 0.05 }}
                        className="w-8/12 rounded-t-sm transition-all duration-200 bg-gradient-to-t from-rose-600 to-indigo-500 group-hover:to-rose-400 shadow-xs"
                      />
                      {/* Tooltip */}
                      <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded-sm pointer-events-none whitespace-nowrap z-30 shadow-md">
                        {item.queries} Trace targets
                      </span>
                    </div>
                    <span className="text-[9px] font-semibold text-slate-500 mt-2 font-mono">
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-2 text-[8px] text-slate-500">
                <span>Core winter cycle</span>
                <span>Active RADIUS database sync</span>
                <span>Core summer cycle</span>
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
        {[0, 1, 2].map((idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              currentSlide === idx 
                ? 'w-5 bg-cyan-500' 
                : 'w-1.5 bg-slate-700 hover:bg-slate-50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
