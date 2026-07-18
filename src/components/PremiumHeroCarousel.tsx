import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Activity,
  Search,
  Radio,
  FileText,
  MessageSquare,
  ShieldAlert,
  Cpu,
  Network,
  Zap,
  BookOpen,
  GraduationCap,
  Layers,
  Globe,
  Users
} from 'lucide-react';

interface PremiumHeroCarouselProps {
  session: {
    username: string;
    email: string;
    avatar: string;
    role?: string;
  };
  getGreeting: () => string;
  setCurrentView: (view: string) => void;
  setShowSearchModal: (show: boolean) => void;
  countOpenIncidents: number;
  countPendingComplaints: number;
  videoUrl?: string;
  videoUrls?: string[];
  backgroundImageUrl?: string;
  backgroundImageUrls?: string[];
}

export default function PremiumHeroCarousel({
  session,
  getGreeting,
  setCurrentView,
  setShowSearchModal,
  countOpenIncidents,
  countPendingComplaints,
  videoUrl,
  videoUrls,
  backgroundImageUrl,
  backgroundImageUrls
}: PremiumHeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto-play interval: rotate slide every 12 seconds unless hovered
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 9);
    }, 12000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 9);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 9) % 9);
  };

  // Canvas Particle Animation Effect for Slide 4 (Aether Flow)
  useEffect(() => {
    if (currentSlide !== 3) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;
    let particles: Particle[] = [];
    const mouse: { x: number | null; y: number | null; radius: number } = { x: null, y: null, radius: 150 };

    class Particle {
      x: number;
      y: number;
      directionX: number;
      directionY: number;
      size: number;
      color: string;

      constructor(x: number, y: number, directionX: number, directionY: number, size: number, color: string) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      update() {
        if (!canvas) return;
        if (this.x > canvas.width || this.x < 0) {
          this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0) {
          this.directionY = -this.directionY;
        }

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius + this.size) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= forceDirectionX * force * 5;
            this.y -= forceDirectionY * force * 5;
          }
        }

        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
      }
    }

    function init() {
      if (!canvas) return;
      particles = [];
      const numberOfParticles = Math.min(45, (canvas.height * canvas.width) / 14000);
      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 2 + 1;
        const x = Math.random() * (canvas.width - size * 4) + size * 2;
        const y = Math.random() * (canvas.height - size * 4) + size * 2;
        const directionX = Math.random() * 0.4 - 0.2;
        const directionY = Math.random() * 0.4 - 0.2;
        const color = 'rgba(191, 128, 255, 0.8)';
        particles.push(new Particle(x, y, directionX, directionY, size, color));
      }
    }

    const resizeCanvas = () => {
      if (!canvas) return;
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth || 800;
        canvas.height = canvas.parentElement.clientHeight || 500;
      } else {
        canvas.width = canvas.clientWidth || 800;
        canvas.height = canvas.clientHeight || 500;
      }
      init();
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const connect = () => {
      if (!canvas || !ctx) return;
      let opacityValue = 1;
      const maxDistanceSq = 100 * 100; // Constant max distance squared for ultra smooth performance
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) { // Only check forward indices to prevent duplicates and double execution
          const distance =
            (particles[a].x - particles[b].x) * (particles[a].x - particles[b].x) +
            (particles[a].y - particles[b].y) * (particles[a].y - particles[b].y);

          if (distance < maxDistanceSq) {
            opacityValue = 1 - distance / maxDistanceSq;

            const dx_mouse_a = mouse.x !== null ? particles[a].x - mouse.x : 9999;
            const dy_mouse_a = mouse.y !== null ? particles[a].y - mouse.y : 9999;
            const distance_mouse_a = Math.sqrt(dx_mouse_a * dx_mouse_a + dy_mouse_a * dy_mouse_a);

            if (mouse.x !== null && distance_mouse_a < mouse.radius) {
              ctx.strokeStyle = `rgba(255, 255, 255, ${opacityValue * 0.35})`;
            } else {
              ctx.strokeStyle = `rgba(168, 85, 247, ${opacityValue * 0.15})`;
            }

            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      animationFrameId = requestAnimationFrame(animate);
      ctx.fillStyle = 'rgb(11, 10, 18)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      connect();
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };

    const handleMouseOut = () => {
      mouse.x = null;
      mouse.y = null;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseout', handleMouseOut);

    init();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseout', handleMouseOut);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentSlide]);

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2 + 0.5,
        duration: 0.8,
        ease: 'easeInOut',
      },
    }),
  };

  return (
    <div
      className="relative w-full min-h-[480px] md:h-[500px] rounded-3xl overflow-hidden group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id="hero-carousel-container"
    >
      <AnimatePresence mode="wait">
        {currentSlide === 0 && (
          /* SLIDE 1: OPERATIONAL CONSOLE BANNER */
          <motion.div
            key="slide-operational"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
                        className="w-full h-full min-h-[480px] md:h-[500px] bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-6 lg:p-10 border border-slate-800/80 rounded-3xl relative flex flex-col justify-between"
            id="hero-slide-operational"
          >
            {/* Dynamic Background Image */}
            {backgroundImageUrls?.[0] && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 rounded-3xl">
                <img
                  src={backgroundImageUrls[0]}
                  alt="Operational Console Background"
                  className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-overlay"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Background ambient lighting blobs */}
            <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/15 via-violet-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-1/3 bottom-0 w-72 h-72 bg-gradient-to-tr from-sky-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Abstract circuit SVG decoration */}
            <div className="absolute right-10 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none hidden lg:block">
              <svg className="w-full h-full text-indigo-400" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 50H80L110 80H190" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M30 110H90L110 130H170" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="80" cy="50" r="3" fill="currentColor" />
                <circle cx="110" cy="80" r="3" fill="currentColor" />
                <circle cx="90" cy="110" r="3" fill="currentColor" />
                <circle cx="110" cy="130" r="3" fill="currentColor" />
                <circle cx="190" cy="80" r="4" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="170" cy="130" r="4" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Top Row: Operator Status Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2.5 py-1 rounded-full border border-slate-700/50 uppercase tracking-widest">
                  USER Console Active
                </span>
              </div>
            </div>

            {/* Middle Row: Content and Health Telemetry Box */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto items-center">
              <div className="lg:col-span-7 space-y-4">
                <h2 className="text-2xl md:text-3.5xl font-black tracking-tight leading-tight">
                  {getGreeting()}, <span className="bg-gradient-to-r from-indigo-300 via-violet-200 to-white bg-clip-text text-transparent">{session.username}</span>!
                </h2>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-xl">
                  Welcome to the National Broadband Operational Terminal. You have administrative supervision over <strong className="text-white font-bold">all 7 operational modules</strong>. All data logs are locally stored and synced automatically in real-time.
                </p>

                {/* Quick-Search Integration */}
                <div className="pt-2 max-w-md">
                  <div
                    onClick={() => setShowSearchModal(true)}
                    className="flex items-center gap-3 bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700 p-2.5 px-4 rounded-xl cursor-pointer transition-all duration-150 shadow-inner group"
                  >
                    <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors font-medium select-none">
                      Quick search records across all modules...
                    </span>
                    <span className="ml-auto text-[9px] font-mono font-bold bg-slate-800/60 text-slate-500 px-1.5 py-0.5 rounded-md border border-slate-700/40 uppercase">
                      Search
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Operational Health Indicator */}
              <div className="lg:col-span-5 w-full flex flex-col gap-4 lg:items-end">
                <div className="bg-slate-900/45 backdrop-blur-xs border border-slate-800/60 p-4 rounded-2xl w-full max-w-xs lg:ml-auto">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Operational Health</span>
                    <span className="text-[9px] bg-emerald-950 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-900/50">
                      ONLINE
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Open Incidents:</span>
                      <span className={`font-mono font-bold ${countOpenIncidents > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                        {countOpenIncidents}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Pending Complaints:</span>
                      <span className={`font-mono font-bold ${countPendingComplaints > 0 ? 'text-violet-400' : 'text-slate-300'}`}>
                        {countPendingComplaints}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Database State:</span>
                      <span className="font-mono font-bold text-emerald-400">Synced Local</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Shortcut Actions */}
            <div className="relative z-10 flex flex-wrap gap-2.5 justify-start border-t border-slate-800/60 pt-4 mt-2">
              <button
                onClick={() => setCurrentView('NetworkIncident')}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all duration-150 shadow-sm"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Log Outage</span>
              </button>
              <button
                onClick={() => setCurrentView('ComplaintManagement')}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all duration-150 shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>File Complaint</span>
              </button>
              <button
                onClick={() => setCurrentView('TechInformationUpdate')}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 text-[10px] font-bold rounded-lg cursor-pointer transition-all border border-slate-700"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Broadcast Update</span>
              </button>
            </div>
          </motion.div>
        )}

        {currentSlide === 1 && (
          /* SLIDE 3: CYBER DEFENSE & SHIELD */
          <motion.div
            key="slide-security"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
                        className="w-full h-full min-h-[480px] md:h-[500px] bg-gradient-to-br from-emerald-950/80 via-slate-950 to-stone-900 text-white p-6 lg:p-10 border border-emerald-900/40 rounded-3xl relative flex flex-col justify-between"
            id="hero-slide-security"
          >
            {/* Dynamic Background Image */}
            {backgroundImageUrls?.[2] && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 rounded-3xl">
                <img
                  src={backgroundImageUrls[2]}
                  alt="Cyber Defense Background"
                  className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-overlay"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Background ambient lighting blobs */}
            <div className="absolute right-0 bottom-0 w-96 h-96 bg-gradient-to-tr from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-1/4 top-1/4 w-80 h-80 bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Matrix style glowing vertical code streams */}
            <div className="absolute right-12 top-0 bottom-0 w-1/4 opacity-10 pointer-events-none font-mono text-[9px] text-emerald-400 leading-none overflow-hidden hidden lg:block select-none">
              <div className="animate-pulse space-y-1">
                <div>01001101 01000001 01010100</div>
                <div>01010010 01001001 01011000</div>
                <div>SYS_SEC_STATUS // SECURE_GREEN</div>
                <div>FIREWALL_PORTS // ACTIVE_SHIELD</div>
                <div>PACKET_DROP_RATE // 0.0003%</div>
                <div>SCANNING_EXCHANGE // HUB_9_OK</div>
                <div>IPS_SIGNATURES // VERIFIED</div>
                <div>DEEP_INSPECTION_TUNNEL // STABLE</div>
              </div>
            </div>

            {/* Top Row */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-[10px] bg-emerald-950/80 text-emerald-300 font-bold px-2.5 py-1 rounded-full border border-emerald-800/40 uppercase tracking-widest">
                  Threat Shield Active
                </span>
              </div>
            </div>

            {/* Middle Row */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto items-center">
              <div className="lg:col-span-8 space-y-4">
                <h2 className="text-2xl md:text-3.5xl font-black tracking-tight leading-tight">
                  Heuristic Traffic & <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-white bg-clip-text text-transparent">Anomaly Scanning</span>
                </h2>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-xl">
                  Broadband backplanes are audited against active DDoS vectors, port infiltration signatures, and fraudulent request logs. Advanced Deep Packet Inspection (DPI) isolates threat patterns instantly without reducing transit throughput.
                </p>

                {/* Cyber Reports Redirect Info */}
                <div className="pt-2 max-w-md">
                  <div
                    onClick={() => setCurrentView('CyberCrimeReport')}
                    className="flex items-center gap-3 bg-slate-950/60 hover:bg-slate-950 border border-emerald-900/30 hover:border-emerald-700/50 p-2.5 px-4 rounded-xl cursor-pointer transition-all duration-150 shadow-inner group"
                  >
                    <ShieldAlert className="w-4 h-4 text-emerald-400 animate-bounce" />
                    <span className="text-xs text-slate-400 group-hover:text-emerald-300 transition-colors font-medium">
                      Analyze active cyber fraud & crime reports...
                    </span>
                    <ArrowRight className="ml-auto w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>

              {/* Right Side Stat */}
              <div className="lg:col-span-4 w-full flex flex-col gap-4 lg:items-end">
                <div className="bg-emerald-950/20 border border-emerald-800/30 p-4 rounded-2xl w-full max-w-xs lg:ml-auto">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-2">Shield Logs</span>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Scan Status:</span>
                      <span className="text-emerald-400 font-bold">ALL CLEAR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">DDoS block:</span>
                      <span className="text-slate-200">0 active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mitigation:</span>
                      <span className="text-slate-200">99.98% auto</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row shortcuts */}
            <div className="relative z-10 flex flex-wrap gap-2.5 justify-start border-t border-emerald-900/40 pt-4 mt-2">
              <button
                onClick={() => setCurrentView('CyberCrimeReport')}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all duration-150"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Cyber Incident Room</span>
              </button>
              <button
                onClick={() => setCurrentView('ComplaintManagement')}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 text-[10px] font-bold rounded-lg cursor-pointer transition-all border border-slate-700"
              >
                <span>Report Cyber Threat</span>
              </button>
            </div>
          </motion.div>
        )}

        {currentSlide === 2 && (
          /* SLIDE 4: INTELLIGENT ROUTE OPTIMIZATION */
          <motion.div
            key="slide-routing"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
                        className="w-full h-full min-h-[480px] md:h-[500px] bg-gradient-to-br from-indigo-950/80 via-slate-950 to-slate-900 text-white p-6 lg:p-10 border border-indigo-900/40 rounded-3xl relative flex flex-col justify-between"
            id="hero-slide-routing"
          >
            {/* Dynamic Background Image */}
            {backgroundImageUrls?.[3] && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 rounded-3xl">
                <img
                  src={backgroundImageUrls[3]}
                  alt="Intelligent Routing Background"
                  className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-overlay"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Background ambient lighting blobs */}
            <div className="absolute left-0 bottom-0 w-96 h-96 bg-gradient-to-tr from-indigo-600/10 via-violet-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute right-1/4 top-1/4 w-80 h-80 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Glowing topological map grid */}
            <div className="absolute right-16 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none hidden lg:block">
              <svg className="w-full h-full text-indigo-400" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 40 L60 90 L120 70 L180 120" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M60 90 L110 150 L150 110" stroke="currentColor" strokeWidth="1" />
                <circle cx="20" cy="40" r="5" fill="currentColor" className="animate-ping" />
                <circle cx="20" cy="40" r="3" fill="currentColor" />
                <circle cx="60" cy="90" r="3" fill="currentColor" />
                <circle cx="120" cy="70" r="3" fill="currentColor" />
                <circle cx="180" cy="120" r="3" fill="currentColor" />
                <circle cx="110" cy="150" r="3" fill="currentColor" />
                <circle cx="150" cy="110" r="3" fill="currentColor" />
              </svg>
            </div>

            {/* Top Row */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] bg-indigo-950/80 text-indigo-300 font-bold px-2.5 py-1 rounded-full border border-indigo-800/40 uppercase tracking-widest">
                  AI Routing Core Online
                </span>
              </div>
            </div>

            {/* Middle Row */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto items-center">
              <div className="lg:col-span-8 space-y-4">
                <h2 className="text-2xl md:text-3.5xl font-black tracking-tight leading-tight">
                  Autonomic Gateway & <span className="bg-gradient-to-r from-indigo-400 via-pink-300 to-white bg-clip-text text-transparent">Congestion Deflection</span>
                </h2>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-xl">
                  Intelligent machine-learning pipelines automatically reroute subscriber streams away from saturated exchanges and link failures. Proactive scheduling ensures lag-free high-priority queueing during regional peak load spikes.
                </p>

                {/* Routing / Router details list */}
                <div className="pt-2 max-w-md">
                  <div
                    onClick={() => setCurrentView('UnlinkRouter')}
                    className="flex items-center gap-3 bg-slate-950/60 hover:bg-slate-950 border border-indigo-900/30 hover:border-indigo-700/50 p-2.5 px-4 rounded-xl cursor-pointer transition-all duration-150 shadow-inner group"
                  >
                    <Network className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs text-slate-400 group-hover:text-indigo-300 transition-colors font-medium">
                      Inspect Unlink Router exchanges & logs...
                    </span>
                    <ArrowRight className="ml-auto w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>

              {/* Right Side Stats */}
              <div className="lg:col-span-4 w-full flex flex-col gap-4 lg:items-end">
                <div className="bg-indigo-950/20 border border-indigo-800/30 p-4 rounded-2xl w-full max-w-xs lg:ml-auto">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block mb-2">Topology Status</span>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Routers:</span>
                      <span className="text-slate-200 font-bold">128 active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Reroute Delay:</span>
                      <span className="text-emerald-400">12ms avg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Optimal paths:</span>
                      <span className="text-slate-200">99.94%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row shortcuts */}
            <div className="relative z-10 flex flex-wrap gap-2.5 justify-start border-t border-indigo-900/40 pt-4 mt-2">
              <button
                onClick={() => setCurrentView('UnlinkRouter')}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-700 hover:bg-indigo-600 active:bg-indigo-800 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all duration-150"
              >
                <Network className="w-3.5 h-3.5" />
                <span>Router Topology Matrix</span>
              </button>
              <button
                onClick={() => setCurrentView('NetworkIncident')}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 text-[10px] font-bold rounded-lg cursor-pointer transition-all border border-slate-700"
              >
                <span>Gateway Configuration</span>
              </button>
            </div>
          </motion.div>
        )}

        {currentSlide === 3 && (
          /* SLIDE 5: DYNAMIC RENDERING ENGINE (AETHER FLOW) */
          <motion.div
            key="slide-aether"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full min-h-[480px] md:h-[500px] bg-slate-950 text-white p-6 lg:p-10 border border-purple-900/40 rounded-3xl relative flex flex-col justify-between overflow-hidden"
            id="hero-slide-aether"
          >
            {/* Ambient Background Canvas particle field */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-auto z-0" />

            {/* Top Row: Info Status Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400 animate-pulse" />
                <span className="text-[10px] bg-purple-950/80 text-purple-300 font-bold px-2.5 py-1 rounded-full border border-purple-800/40 uppercase tracking-widest">
                  Aether Flow Engaged
                </span>
              </div>
            </div>

            {/* Middle Row: Title & Description & Stats */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto items-center">
              <div className="lg:col-span-8 space-y-4 text-left">
                <motion.div
                  custom={0}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-2 backdrop-blur-xs"
                >
                  <Zap className="h-3 w-3 text-purple-400" />
                  <span className="text-[10px] font-medium text-gray-200 uppercase tracking-wider">
                    Dynamic Rendering Engine
                  </span>
                </motion.div>

                <motion.h2
                  custom={1}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-2xl md:text-4.5xl font-extrabold tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400"
                >
                  Aether Flow
                </motion.h2>

                <motion.p
                  custom={2}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-xs md:text-sm text-gray-300 leading-relaxed max-w-xl"
                >
                  An intelligent, adaptive framework for creating fluid digital experiences that feel alive and respond to user interaction in real-time. Move your mouse across the panel to interact with the particle grid.
                </motion.p>
              </div>

              {/* Right Side Stats */}
              <div className="lg:col-span-4 w-full flex flex-col gap-4 lg:items-end">
                <div className="bg-purple-950/20 border border-purple-800/30 p-4 rounded-2xl w-full max-w-xs lg:ml-auto text-left backdrop-blur-xs">
                  <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block mb-2">Engine Metrics</span>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Node Speed:</span>
                      <span className="text-purple-400 font-bold">60 FPS constant</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Interactive:</span>
                      <span className="text-slate-200">Mouse responsive</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Vector paths:</span>
                      <span className="text-emerald-400 font-bold">Autonomic</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row shortcut */}
            <div className="relative z-10 flex flex-wrap gap-2.5 justify-start border-t border-purple-900/40 pt-4 mt-2">
              <button
                onClick={() => setCurrentView('TechInformationUpdate')}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-700 hover:bg-purple-600 active:bg-purple-800 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all duration-150 shadow-lg hover:shadow-purple-500/20"
              >
                <span>Explore the Engine</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setCurrentView('NetworkIncident')}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 text-[10px] font-bold rounded-lg cursor-pointer transition-all border border-slate-700"
              >
                <span>Network Topology</span>
              </button>
            </div>
          </motion.div>
        )}

        {currentSlide === 4 && (
          /* SLIDE 5: KNOWLEDGE SPHERES (CONNECTED LEARNING NETWORK) */
          <motion.div
            key="slide-learning"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full min-h-[480px] md:h-[500px] bg-gradient-to-br from-teal-950 via-slate-950 to-orange-950/40 text-white p-6 lg:p-10 border border-teal-900/40 rounded-3xl relative flex flex-col justify-between overflow-hidden"
            id="hero-slide-learning"
          >
            {/* Dynamic Background Image */}
            {backgroundImageUrls?.[4] && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 rounded-3xl">
                <img
                  src={backgroundImageUrls[4]}
                  alt="Knowledge Spheres Background"
                  className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Background ambient lighting blobs */}
            <div className="absolute right-10 bottom-10 w-96 h-96 bg-gradient-to-tr from-teal-500/10 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-10 top-10 w-80 h-80 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Floating spheres decorative SVGs (echoing the user's design) */}
            <div className="absolute right-12 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden lg:block z-0">
              <svg className="w-full h-full text-teal-400" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Orbiting concentric circles */}
                <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 6" />
                <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="1" />
                <circle cx="100" cy="100" r="25" stroke="currentColor" strokeWidth="1.5" />
                {/* Small node spheres */}
                <circle cx="100" cy="20" r="5" fill="#F97316" className="animate-pulse" />
                <circle cx="100" cy="180" r="4" fill="#14B8A6" />
                <circle cx="50" cy="100" r="3" fill="currentColor" />
                <circle cx="150" cy="100" r="5" fill="#38BDF8" className="animate-ping" />
                <circle cx="150" cy="100" r="3" fill="#38BDF8" />
                {/* Connector pathways */}
                <path d="M100 20 L100 180" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
                <path d="M50 100 L150 100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
              </svg>
            </div>

            {/* Top Row: Info Status Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-teal-400 animate-pulse" />
                <span className="text-[10px] bg-teal-950/80 text-teal-300 font-bold px-2.5 py-1 rounded-full border border-teal-800/40 uppercase tracking-widest">
                  Learning Core Connected
                </span>
              </div>
            </div>

            {/* Middle Row: Content and Metrics */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto items-center">
              <div className="lg:col-span-8 space-y-4 text-left">
                <motion.div
                  custom={0}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 mb-2 backdrop-blur-xs"
                >
                  <BookOpen className="h-3 w-3 text-teal-400" />
                  <span className="text-[10px] font-medium text-gray-200 uppercase tracking-wider">
                    Dynamic Knowledge Ecosystem
                  </span>
                </motion.div>

                <motion.h2
                  custom={1}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-2xl md:text-4.5xl font-extrabold tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-teal-100 to-teal-400"
                >
                  Knowledge Spheres
                </motion.h2>

                <motion.p
                  custom={2}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-xs md:text-sm text-gray-300 leading-relaxed max-w-xl"
                >
                  An immersive, collaborative ecosystem bridging knowledge pathways and digital systems. Seamlessly synchronize virtual research modules, explore global peer networks, and analyze intellectual capital flow in real-time.
                </motion.p>
              </div>

              {/* Right Side Stats */}
              <div className="lg:col-span-4 w-full flex flex-col gap-4 lg:items-end">
                <div className="bg-teal-950/20 border border-teal-800/30 p-4 rounded-2xl w-full max-w-xs lg:ml-auto text-left backdrop-blur-xs">
                  <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block mb-2">Ecosystem Metrics</span>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Active Spheres:</span>
                      <span className="text-teal-400 font-bold">14 Online</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Global Peer Nodes:</span>
                      <span className="text-orange-400 font-bold">450+ Verified</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cognitive Sync:</span>
                      <span className="text-emerald-400 font-bold">99.8% Stability</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row shortcut */}
            <div className="relative z-10 flex flex-wrap gap-2.5 justify-start border-t border-teal-900/40 pt-4 mt-2">
              <button
                onClick={() => setCurrentView('TechInformationUpdate')}
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-600 active:bg-teal-800 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all duration-150 shadow-lg hover:shadow-teal-500/20"
              >
                <span>Explore Spheres</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setCurrentView('NetworkIncident')}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 text-[10px] font-bold rounded-lg cursor-pointer transition-all border border-slate-700"
              >
                <span>Global Networks</span>
              </button>
            </div>
          </motion.div>
        )}

        {currentSlide === 5 && (
          /* SLIDE 6: GLOBAL SYNERGY HUB (COLLABORATIVE COMMUNICATION NETWORK) */
          <motion.div
            key="slide-synergy"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full min-h-[480px] md:h-[500px] bg-gradient-to-br from-blue-950 via-slate-950 to-indigo-950 text-white p-6 lg:p-10 border border-blue-900/40 rounded-3xl relative flex flex-col justify-between overflow-hidden"
            id="hero-slide-synergy"
          >
            {/* Dynamic Background Image */}
            {backgroundImageUrls?.[5] && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 rounded-3xl">
                <img
                  src={backgroundImageUrls[5]}
                  alt="Global Synergy Background"
                  className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Background ambient lighting blobs */}
            <div className="absolute right-1/4 top-10 w-96 h-96 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-1/4 bottom-10 w-80 h-80 bg-gradient-to-tr from-cyan-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Concentric and connection node graphics (echoing the uploaded photo) */}
            <div className="absolute right-6 top-10 bottom-10 w-1/3 opacity-30 pointer-events-none hidden lg:block z-0">
              <svg className="w-full h-full text-blue-400" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Global Grid Dotted Earth Concept */}
                <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 4" />
                <path d="M100 30 C70 60 70 140 100 170" stroke="currentColor" strokeWidth="0.75" />
                <path d="M100 30 C130 60 130 140 100 170" stroke="currentColor" strokeWidth="0.75" />
                <path d="M30 100 C60 70 140 70 170 100" stroke="currentColor" strokeWidth="0.75" />
                <path d="M30 100 C60 130 140 130 170 100" stroke="currentColor" strokeWidth="0.75" />
                {/* Concentric Signal Waves */}
                <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8" />
                {/* Floating active chat / message nodes */}
                <rect x="135" y="45" width="45" height="18" rx="4" fill="#1E293B" stroke="currentColor" strokeWidth="1" />
                <circle cx="143" cy="54" r="3" fill="#10B981" />
                <path d="M150 54 H170" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
                {/* Connections and small points */}
                <circle cx="100" cy="100" r="4" fill="#3B82F6" className="animate-ping" />
                <circle cx="100" cy="100" r="2.5" fill="#3B82F6" />
                <circle cx="60" cy="70" r="3.5" fill="#10B981" />
                <circle cx="140" cy="130" r="3" fill="#F59E0B" />
                {/* Communication lines */}
                <line x1="60" y1="70" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="140" y1="130" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
              </svg>
            </div>

            {/* Top Row: Info Status Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400 animate-spin-slow" />
                <span className="text-[10px] bg-blue-950/80 text-blue-300 font-bold px-2.5 py-1 rounded-full border border-blue-800/40 uppercase tracking-widest">
                  Global Network Sync: Live
                </span>
              </div>
            </div>

            {/* Middle Row: Content and Metrics */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto items-center">
              <div className="lg:col-span-8 space-y-4 text-left">
                <motion.div
                  custom={0}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-2 backdrop-blur-xs"
                >
                  <Users className="h-3 w-3 text-blue-400" />
                  <span className="text-[10px] font-medium text-gray-200 uppercase tracking-wider">
                    Unified Communication Space
                  </span>
                </motion.div>

                <motion.h2
                  custom={1}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-2xl md:text-4.5xl font-extrabold tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-blue-100 to-cyan-400"
                >
                  Global Synergy Hub
                </motion.h2>

                <motion.p
                  custom={2}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-xs md:text-sm text-gray-300 leading-relaxed max-w-xl"
                >
                  An interactive global collaboration and knowledge-sharing workspace. Seamlessly connect decentralized team nodes, analyze dynamic message workflows, and collaborate with verified peers in real-time on our integrated global topology.
                </motion.p>
              </div>

              {/* Right Side Stats */}
              <div className="lg:col-span-4 w-full flex flex-col gap-4 lg:items-end">
                <div className="bg-blue-950/20 border border-blue-800/30 p-4 rounded-2xl w-full max-w-xs lg:ml-auto text-left backdrop-blur-xs">
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block mb-2">Network Insights</span>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Connected Peers:</span>
                      <span className="text-emerald-400 font-bold">1,240 Online</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Regional Hubs:</span>
                      <span className="text-blue-400 font-bold">6 Global</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Data Throughput:</span>
                      <span className="text-cyan-400 font-bold">45.2 TB/sec</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row shortcut */}
            <div className="relative z-10 flex flex-wrap gap-2.5 justify-start border-t border-blue-900/40 pt-4 mt-2">
              <button
                onClick={() => setCurrentView('TechInformationUpdate')}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-600 active:bg-blue-800 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all duration-150 shadow-lg hover:shadow-blue-500/20"
              >
                <span>Collaborate Now</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setCurrentView('NetworkIncident')}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 text-[10px] font-bold rounded-lg cursor-pointer transition-all border border-slate-700"
              >
                <span>View Network Topology</span>
              </button>
            </div>
          </motion.div>
        )}

        {currentSlide === 6 && (
          /* SLIDE 7: QUANTUM BACKHAUL CORE */
          <motion.div
            key="slide-quantum"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full min-h-[480px] md:h-[500px] bg-gradient-to-br from-indigo-950 via-slate-950 to-pink-950/40 text-white p-6 lg:p-10 border border-indigo-900/40 rounded-3xl relative flex flex-col justify-between overflow-hidden"
            id="hero-slide-quantum"
          >
            {/* Dynamic Background Image */}
            {backgroundImageUrls?.[6] && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 rounded-3xl">
                <img
                  src={backgroundImageUrls[6]}
                  alt="Quantum Backhaul Core Background"
                  className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Background ambient lighting blobs */}
            <div className="absolute right-10 top-10 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-10 bottom-10 w-80 h-80 bg-gradient-to-tr from-purple-500/10 via-rose-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Glowing topological map grid */}
            <div className="absolute right-16 bottom-0 top-0 w-1/3 opacity-20 pointer-events-none hidden lg:block">
              <svg className="w-full h-full text-indigo-400" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 100 Q100 10 190 100 T10 100" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" />
                <path d="M10 100 Q100 190 190 100" stroke="currentColor" strokeWidth="0.75" />
                <circle cx="10" cy="100" r="4" fill="#E11D48" className="animate-pulse" />
                <circle cx="190" cy="100" r="4" fill="#3B82F6" />
                <circle cx="100" cy="55" r="3" fill="currentColor" />
                <circle cx="100" cy="145" r="3" fill="currentColor" />
              </svg>
            </div>

            {/* Top Row: Info Status Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-pink-400 animate-pulse" />
                <span className="text-[10px] bg-indigo-950/80 text-pink-300 font-bold px-2.5 py-1 rounded-full border border-indigo-800/40 uppercase tracking-widest">
                  Quantum Core Engaged
                </span>
              </div>
            </div>

            {/* Middle Row: Content and Metrics */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto items-center">
              <div className="lg:col-span-8 space-y-4 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-2 backdrop-blur-xs">
                  <Layers className="h-3 w-3 text-indigo-400" />
                  <span className="text-[10px] font-medium text-gray-200 uppercase tracking-wider">
                    Photonic Multiplexing
                  </span>
                </div>

                <h2 className="text-2xl md:text-4.5xl font-extrabold tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-indigo-100 to-pink-400">
                  Quantum Backhaul
                </h2>

                <p className="text-xs md:text-sm text-gray-300 leading-relaxed max-w-xl">
                  Harnessing sub-nanosecond optical multiplexing to carry hyper-dense subscriber pipelines. Photonic routing bridges backhaul interchanges with near-zero polarization dispersion and maximum spectral efficiency.
                </p>
              </div>

              {/* Right Side Stats */}
              <div className="lg:col-span-4 w-full flex flex-col gap-4 lg:items-end">
                <div className="bg-indigo-950/20 border border-indigo-800/30 p-4 rounded-2xl w-full max-w-xs lg:ml-auto text-left backdrop-blur-xs">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block mb-2">Backhaul Metrics</span>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Frequency:</span>
                      <span className="text-pink-400 font-bold">193.1 THz</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Spectral State:</span>
                      <span className="text-slate-200">Optically Isolated</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Transit Jitter:</span>
                      <span className="text-emerald-400 font-bold">&lt; 0.05 ps</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row shortcut */}
            <div className="relative z-10 flex flex-wrap gap-2.5 justify-start border-t border-indigo-900/40 pt-4 mt-2">
              <button
                onClick={() => setCurrentView('TechInformationUpdate')}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-700 hover:bg-indigo-600 active:bg-indigo-800 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all duration-150 shadow-lg hover:shadow-indigo-500/20"
              >
                <span>Examine Backhaul</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setCurrentView('NetworkIncident')}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 text-[10px] font-bold rounded-lg cursor-pointer transition-all border border-slate-700"
              >
                <span>Carrier Topology</span>
              </button>
            </div>
          </motion.div>
        )}

        {currentSlide === 7 && (
          /* SLIDE 8: PREDICTIVE SENTINEL AI */
          <motion.div
            key="slide-sentinel"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full min-h-[480px] md:h-[500px] bg-gradient-to-br from-rose-950 via-slate-950 to-amber-950/40 text-white p-6 lg:p-10 border border-rose-900/40 rounded-3xl relative flex flex-col justify-between overflow-hidden"
            id="hero-slide-sentinel"
          >
            {/* Dynamic Background Image */}
            {backgroundImageUrls?.[7] && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 rounded-3xl">
                <img
                  src={backgroundImageUrls[7]}
                  alt="Predictive Sentinel AI Background"
                  className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Background ambient lighting blobs */}
            <div className="absolute right-10 bottom-10 w-96 h-96 bg-gradient-to-tr from-rose-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-10 top-10 w-80 h-80 bg-gradient-to-br from-red-500/10 via-yellow-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Sentinel radar scan SVG */}
            <div className="absolute right-12 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden lg:block z-0">
              <svg className="w-full h-full text-rose-400" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="75" stroke="currentColor" strokeWidth="0.75" />
                <circle cx="100" cy="100" r="45" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 6" />
                <line x1="100" y1="25" x2="100" y2="175" stroke="currentColor" strokeWidth="0.5" />
                <line x1="25" y1="100" x2="175" y2="100" stroke="currentColor" strokeWidth="0.5" />
                <path d="M100 100 L153 55" stroke="#F59E0B" strokeWidth="1.5" className="animate-pulse" />
              </svg>
            </div>

            {/* Top Row: Info Status Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-400 animate-pulse" />
                <span className="text-[10px] bg-rose-950/80 text-rose-300 font-bold px-2.5 py-1 rounded-full border border-rose-800/40 uppercase tracking-widest">
                  Predictive Analysis Online
                </span>
              </div>
            </div>

            {/* Middle Row: Content and Metrics */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto items-center">
              <div className="lg:col-span-8 space-y-4 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 mb-2 backdrop-blur-xs">
                  <Cpu className="h-3 w-3 text-rose-400" />
                  <span className="text-[10px] font-medium text-gray-200 uppercase tracking-wider">
                    Autonomous Infrastructure Safeguard
                  </span>
                </div>

                <h2 className="text-2xl md:text-4.5xl font-extrabold tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-rose-100 to-amber-400">
                  Sentinel AI Core
                </h2>

                <p className="text-xs md:text-sm text-gray-300 leading-relaxed max-w-xl">
                  Proactive predictive modeling runs in continuous telemetry loops, forecasting line degradation, power grid anomalies, and local POP node temperature warning signs hours before a service interruption.
                </p>
              </div>

              {/* Right Side Stats */}
              <div className="lg:col-span-4 w-full flex flex-col gap-4 lg:items-end">
                <div className="bg-rose-950/20 border border-rose-800/30 p-4 rounded-2xl w-full max-w-xs lg:ml-auto text-left backdrop-blur-xs">
                  <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block mb-2">Sentinel Insights</span>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Failure Model:</span>
                      <span className="text-emerald-400 font-bold">99.97% Accuracy</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lead Notice:</span>
                      <span className="text-rose-400 font-bold">2.4 hr Lead Time</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Self-Heal State:</span>
                      <span className="text-slate-200 font-bold">Automatic</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row shortcut */}
            <div className="relative z-10 flex flex-wrap gap-2.5 justify-start border-t border-rose-900/40 pt-4 mt-2">
              <button
                onClick={() => setCurrentView('NetworkIncident')}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-600 active:bg-rose-800 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all duration-150 shadow-lg hover:shadow-rose-500/20"
              >
                <span>Diagnostics Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setCurrentView('ComplaintManagement')}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 text-[10px] font-bold rounded-lg cursor-pointer transition-all border border-slate-700"
              >
                <span>Issue Sentinel Alert</span>
              </button>
            </div>
          </motion.div>
        )}

        {currentSlide === 8 && (
          /* SLIDE 9: EDGE GRID SYNC */
          <motion.div
            key="slide-edge"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full min-h-[480px] md:h-[500px] bg-gradient-to-br from-cyan-950 via-slate-950 to-teal-950 text-white p-6 lg:p-10 border border-cyan-900/40 rounded-3xl relative flex flex-col justify-between overflow-hidden"
            id="hero-slide-edge"
          >
            {/* Dynamic Background Image */}
            {backgroundImageUrls?.[8] && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 rounded-3xl">
                <img
                  src={backgroundImageUrls[8]}
                  alt="Edge Grid Sync Background"
                  className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Background ambient lighting blobs */}
            <div className="absolute right-10 bottom-10 w-96 h-96 bg-gradient-to-tr from-cyan-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-10 top-10 w-80 h-80 bg-gradient-to-br from-sky-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Concentric node graphics */}
            <div className="absolute right-6 top-10 bottom-10 w-1/3 opacity-25 pointer-events-none hidden lg:block z-0">
              <svg className="w-full h-full text-cyan-400" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="25" y="25" width="150" height="150" rx="10" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 6" />
                <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="1" />
                <circle cx="50" cy="50" r="4" fill="#06B6D4" />
                <circle cx="150" cy="50" r="4" fill="#06B6D4" />
                <circle cx="50" cy="150" r="4" fill="#06B6D4" />
                <circle cx="150" cy="150" r="4" fill="#06B6D4" />
                <circle cx="100" cy="100" r="6" fill="#14B8A6" className="animate-ping" />
                <circle cx="100" cy="100" r="3.5" fill="#14B8A6" />
              </svg>
            </div>

            {/* Top Row: Info Status Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                <span className="text-[10px] bg-cyan-950/80 text-cyan-300 font-bold px-2.5 py-1 rounded-full border border-cyan-800/40 uppercase tracking-widest">
                  Edge Sync Active: 100%
                </span>
              </div>
            </div>

            {/* Middle Row: Content and Metrics */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto items-center">
              <div className="lg:col-span-8 space-y-4 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-2 backdrop-blur-xs">
                  <Network className="h-3 w-3 text-cyan-400" />
                  <span className="text-[10px] font-medium text-gray-200 uppercase tracking-wider">
                    Distributed Content Hubs
                  </span>
                </div>

                <h2 className="text-2xl md:text-4.5xl font-extrabold tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-cyan-100 to-teal-400">
                  Decentralized Edge Grid
                </h2>

                <p className="text-xs md:text-sm text-gray-300 leading-relaxed max-w-xl">
                  Synchronizing ultra-low latency edge caches to optimize regional content delivery. Edge Grid clusters localize traffic spikes instantly, keeping core bandwidth clean and backplanes perfectly balanced.
                </p>
              </div>

              {/* Right Side Stats */}
              <div className="lg:col-span-4 w-full flex flex-col gap-4 lg:items-end">
                <div className="bg-cyan-950/20 border border-cyan-800/30 p-4 rounded-2xl w-full max-w-xs lg:ml-auto text-left backdrop-blur-xs">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block mb-2">Edge Grid Statistics</span>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Edge Hit Rate:</span>
                      <span className="text-emerald-400 font-bold">94.8% Efficiency</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Transit Latency:</span>
                      <span className="text-cyan-400 font-bold">&lt; 1.8ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Active Sync Nodes:</span>
                      <span className="text-slate-200 font-bold">48 Nodes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row shortcut */}
            <div className="relative z-10 flex flex-wrap gap-2.5 justify-start border-t border-cyan-900/40 pt-4 mt-2">
              <button
                onClick={() => setCurrentView('UnlinkRouter')}
                className="flex items-center gap-1.5 px-4 py-2 bg-cyan-700 hover:bg-cyan-600 active:bg-cyan-800 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all duration-150 shadow-lg hover:shadow-cyan-500/20"
              >
                <span>Edge Node Matrix</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setCurrentView('TechInformationUpdate')}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 text-[10px] font-bold rounded-lg cursor-pointer transition-all border border-slate-700"
              >
                <span>Cache Distribution</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Navigation Controls (Chevron Buttons, visible on container hover) */}
      <button
        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/70 text-slate-300 hover:text-white border border-slate-800 hover:bg-slate-800/80 transition-all cursor-pointer opacity-0 group-hover:opacity-100 z-20 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        title="Previous Slide"
        id="hero-carousel-prev-btn"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/70 text-slate-300 hover:text-white border border-slate-800 hover:bg-slate-800/80 transition-all cursor-pointer opacity-0 group-hover:opacity-100 z-20 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        title="Next Slide"
        id="hero-carousel-next-btn"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Navigation Indicators (Dots at the bottom) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20" id="hero-carousel-dots">
        <button
          onClick={(e) => { e.stopPropagation(); setCurrentSlide(0); }}
          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
            currentSlide === 0 ? 'w-6 bg-indigo-500' : 'w-2 bg-slate-600 hover:bg-slate-400'
          }`}
          title="Operational Terminal Overview"
          id="hero-carousel-dot-0"
        />
        <button
          onClick={(e) => { e.stopPropagation(); setCurrentSlide(1); }}
          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
            currentSlide === 1 ? 'w-6 bg-emerald-500' : 'w-2 bg-slate-600 hover:bg-slate-400'
          }`}
          title="Cyber Security Defense Banner"
          id="hero-carousel-dot-1"
        />
        <button
          onClick={(e) => { e.stopPropagation(); setCurrentSlide(2); }}
          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
            currentSlide === 2 ? 'w-6 bg-violet-500' : 'w-2 bg-slate-600 hover:bg-slate-400'
          }`}
          title="Intelligent Route Optimization"
          id="hero-carousel-dot-2"
        />
        <button
          onClick={(e) => { e.stopPropagation(); setCurrentSlide(3); }}
          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
            currentSlide === 3 ? 'w-6 bg-purple-500' : 'w-2 bg-slate-600 hover:bg-slate-400'
          }`}
          title="Dynamic Rendering Engine"
          id="hero-carousel-dot-3"
        />
        <button
          onClick={(e) => { e.stopPropagation(); setCurrentSlide(4); }}
          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
            currentSlide === 4 ? 'w-6 bg-teal-500' : 'w-2 bg-slate-600 hover:bg-slate-400'
          }`}
          title="Knowledge Spheres: Connected Learning Network"
          id="hero-carousel-dot-4"
        />
        <button
          onClick={(e) => { e.stopPropagation(); setCurrentSlide(5); }}
          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
            currentSlide === 5 ? 'w-6 bg-blue-500' : 'w-2 bg-slate-600 hover:bg-slate-400'
          }`}
          title="Global Synergy Hub: Connected Collaboration Space"
          id="hero-carousel-dot-5"
        />
        <button
          onClick={(e) => { e.stopPropagation(); setCurrentSlide(6); }}
          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
            currentSlide === 6 ? 'w-6 bg-pink-500' : 'w-2 bg-slate-600 hover:bg-slate-400'
          }`}
          title="Quantum Backhaul Core & Photonic Multiplexing"
          id="hero-carousel-dot-6"
        />
        <button
          onClick={(e) => { e.stopPropagation(); setCurrentSlide(7); }}
          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
            currentSlide === 7 ? 'w-6 bg-rose-500' : 'w-2 bg-slate-600 hover:bg-slate-400'
          }`}
          title="Predictive Maintenance & Proactive Sentinel AI"
          id="hero-carousel-dot-7"
        />
        <button
          onClick={(e) => { e.stopPropagation(); setCurrentSlide(8); }}
          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
            currentSlide === 8 ? 'w-6 bg-cyan-500' : 'w-2 bg-slate-600 hover:bg-slate-400'
          }`}
          title="Decentralized Edge Grid & Ultra-Low Latency Hubs"
          id="hero-carousel-dot-8"
        />
      </div>
    </div>
  );
}
