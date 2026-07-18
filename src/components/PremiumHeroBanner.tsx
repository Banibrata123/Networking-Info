import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, Zap, Cpu, Users, ExternalLink } from 'lucide-react';
import AnimatedNetworkBackground from './AnimatedNetworkBackground';

interface PremiumHeroBannerProps {
  setCurrentView?: (view: string) => void;
}

export default function PremiumHeroBanner({ setCurrentView }: PremiumHeroBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [isHovered, setIsHovered] = useState(false);

  const slides = [
    {
      id: 'swiss',
      badgeText: 'Interactive Banner Engine',
      badgeIcon: Sparkles,
      badgeBg: 'bg-neutral-100 text-neutral-800 border-neutral-300',
      title: 'Minimalism Over Decoration Rules',
      titleGradient: 'from-neutral-900 to-neutral-500',
      description: 'An aesthetic Swiss style layout celebrating functional typography, structured margins, and quiet elegance.',
      buttonText: 'Get Started',
      buttonColor: 'bg-neutral-950 hover:bg-neutral-800 text-white',
      containerClass: 'bg-white border-neutral-200 text-neutral-900',
      targetView: 'NetworkIncident',
      hasWaves: true,
    },
    {
      id: 'fiber',
      badgeText: 'Gigabit Backbone',
      badgeIcon: Zap,
      badgeBg: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/40',
      title: 'Next-Gen Fiber Infrastructure',
      titleGradient: 'from-indigo-400 via-sky-300 to-white',
      description: 'Ultra-low latency routing delivering symmetrical gigabit speeds. Real-time active line monitoring and self-healing backup meshes.',
      buttonText: 'Analyze Telemetry',
      buttonColor: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      containerClass: 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-slate-800 text-white',
      targetView: 'NetworkIncident',
      hasCircuit: true,
    },
    {
      id: 'ai-core',
      badgeText: 'Autonomic Intelligence',
      badgeIcon: Cpu,
      badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-800/40',
      title: 'Autonomous Intelligent Gateway',
      titleGradient: 'from-amber-400 via-rose-300 to-white',
      description: 'Predictive routing and congestion mitigation powered by machine learning. Instantly deflected peaks with zero user intervention.',
      buttonText: 'Open AI Console',
      buttonColor: 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold',
      containerClass: 'bg-gradient-to-br from-amber-950/75 via-stone-950 to-amber-950/70 border-amber-900/30 text-white',
      targetView: 'UnlinkRouter',
      hasOrbits: true,
    },
    {
      id: 'collab',
      badgeText: 'Synergy Hub',
      badgeIcon: Users,
      badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/40',
      title: 'Secure Collaborative Workspace',
      titleGradient: 'from-emerald-400 via-teal-300 to-white',
      description: 'Connect operators, field technicians, and support personnel in one unified platform. Synchronized session states and real-time alerts.',
      buttonText: 'Access Portal',
      buttonColor: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      containerClass: 'bg-gradient-to-br from-emerald-950/80 via-slate-950 to-emerald-950/40 border-emerald-900/40 text-white',
      targetView: 'ComplaintManagement',
      hasGrid: true,
    },
  ];

  // Auto-play interval: rotate slide every 8 seconds unless hovered.
  // Including currentSlide in dependencies ensures manual clicks reset the timer.
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isHovered, currentSlide, slides.length]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Directional slide transition variants - using highly tuned spring parameters
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 180, damping: 24 },
        opacity: { duration: 0.45, ease: 'easeOut' },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 180, damping: 24 },
        opacity: { duration: 0.4, ease: 'easeIn' },
      },
    }),
  };

  const currentItem = slides[currentSlide];
  const BadgeIcon = currentItem.badgeIcon;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-xl select-none group"
      id="premium-hero-carousel-root"
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentItem.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className={`absolute inset-0 w-full h-full flex flex-col justify-center items-center px-6 md:px-12 text-center border rounded-2xl ${currentItem.containerClass}`}
          id={`premium-hero-slide-${currentItem.id}`}
        >
          {/* HIGH-FIDELITY ANIMATED LIVE NETWORK BACKGROUND */}
          <AnimatedNetworkBackground type={currentItem.id as any} />

          {/* CONTENT PANEL */}
          <div className="relative z-10 max-w-2xl flex flex-col items-center">
            {/* Glowing Badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border tracking-wider uppercase mb-6 transition-all duration-300 ${currentItem.badgeBg}`}
            >
              <BadgeIcon className="w-3.5 h-3.5 animate-pulse" />
              <span>{currentItem.badgeText}</span>
            </div>

            {/* Staggered Heading Title */}
            <h1
              className="text-3xl sm:text-4.5xl md:text-5xl lg:text-5.5xl tracking-tight leading-tight mb-4 font-display font-black"
            >
              <span className={`bg-gradient-to-r ${currentItem.titleGradient} bg-clip-text text-transparent`}>
                {currentItem.title}
              </span>
            </h1>

            {/* Descriptive Subtitle */}
            <p
              className="text-xs sm:text-sm md:text-base max-w-xl opacity-85 mb-8 leading-relaxed font-sans"
            >
              {currentItem.description}
            </p>

            {/* Micro-interactive CTA Button */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={() => {
                  if (setCurrentView) {
                    setCurrentView(currentItem.targetView);
                  }
                }}
                className={`relative px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 group overflow-hidden shadow-md cursor-pointer transition-all duration-200 ${currentItem.buttonColor}`}
              >
                <span>{currentItem.buttonText}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>

          {/* Base decorative line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-400" />
        </motion.div>
      </AnimatePresence>

      {/* LEFT & RIGHT NAVIGATION CHEVRONS */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-black/10 hover:bg-black/30 text-white backdrop-blur-xs border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer z-20"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-black/10 hover:bg-black/30 text-white backdrop-blur-xs border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer z-20"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* BOTTOM SLIDE DOTS INDICATORS */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > currentSlide ? 1 : -1);
              setCurrentSlide(idx);
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              idx === currentSlide
                ? 'bg-neutral-800 w-6 shadow-sm'
                : 'bg-neutral-400/55 hover:bg-neutral-500'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
