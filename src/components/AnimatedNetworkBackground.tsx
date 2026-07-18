import { motion } from 'motion/react';

interface AnimatedNetworkBackgroundProps {
  type: 'swiss' | 'fiber' | 'ai-core' | 'collab';
}

export default function AnimatedNetworkBackground({ type }: AnimatedNetworkBackgroundProps) {
  // Common node structure for network graph
  const fiberNodes = [
    { id: 1, cx: '15%', cy: '25%', r: 5, color: '#6366f1' },
    { id: 2, cx: '35%', cy: '15%', r: 4, color: '#3b82f6' },
    { id: 3, cx: '25%', cy: '50%', r: 6, color: '#06b6d4' },
    { id: 4, cx: '10%', cy: '75%', r: 4, color: '#6366f1' },
    { id: 5, cx: '45%', cy: '70%', r: 5, color: '#3b82f6' },
    { id: 6, cx: '55%', cy: '40%', r: 7, color: '#06b6d4' },
    { id: 7, cx: '70%', cy: '20%', r: 5, color: '#6366f1' },
    { id: 8, cx: '85%', cy: '35%', r: 4, color: '#3b82f6' },
    { id: 9, cx: '65%', cy: '80%', r: 6, color: '#06b6d4' },
    { id: 10, cx: '80%', cy: '65%', r: 5, color: '#6366f1' },
    { id: 11, cx: '92%', cy: '75%', r: 4, color: '#3b82f6' },
  ];

  const fiberConnections = [
    { from: 0, to: 1, path: 'M 15% 25% L 35% 15%' },
    { from: 0, to: 2, path: 'M 15% 25% L 25% 50%' },
    { from: 2, to: 3, path: 'M 25% 50% L 10% 75%' },
    { from: 2, to: 4, path: 'M 25% 50% L 45% 70%' },
    { from: 1, to: 5, path: 'M 35% 15% L 55% 40%' },
    { from: 2, to: 5, path: 'M 25% 50% L 55% 40%' },
    { from: 5, to: 6, path: 'M 55% 40% L 70% 20%' },
    { from: 6, to: 7, path: 'M 70% 20% L 85% 35%' },
    { from: 5, to: 8, path: 'M 55% 40% L 65% 80%' },
    { from: 8, to: 9, path: 'M 65% 80% L 80% 65%' },
    { from: 7, to: 9, path: 'M 85% 35% L 80% 65%' },
    { from: 9, to: 10, path: 'M 80% 65% L 92% 75%' },
  ];

  if (type === 'swiss') {
    // Elegant, minimalist high-contrast grid with drifting nodes for Swiss aesthetic
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-white" id="network-bg-swiss">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.06]" 
          style={{
            backgroundImage: `
              linear-gradient(to right, #000 1px, transparent 1px),
              linear-gradient(to bottom, #000 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        
        {/* Slow moving soft background gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-neutral-50/50 via-white to-neutral-100/30" />

        {/* Minimalist connecting network layout */}
        <svg className="absolute w-full h-full opacity-30 text-neutral-300" viewBox="0 0 1000 500" preserveAspectRatio="none">
          {/* Static lines */}
          <path d="M 100 100 L 300 80 L 450 200 L 250 350 Z" stroke="currentColor" strokeWidth="1" fill="none" />
          <path d="M 300 80 L 600 120 L 750 80 L 900 250 L 700 380 L 450 200" stroke="currentColor" strokeWidth="1" fill="none" />
          <path d="M 250 350 L 500 420 L 700 380" stroke="currentColor" strokeWidth="1" fill="none" />
          
          {/* Minimalist flowing data packets */}
          <motion.circle
            cx="100" cy="100" r="3"
            fill="#737373"
            animate={{
              cx: [100, 300, 450, 250, 100],
              cy: [100, 80, 200, 350, 100],
            }}
            transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
          />
          <motion.circle
            cx="600" cy="120" r="3.5"
            fill="#171717"
            animate={{
              cx: [600, 750, 900, 700, 450, 600],
              cy: [120, 80, 250, 380, 200, 120],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />

          {/* Minimal nodes */}
          <circle cx="100" cy="100" r="5" fill="#a3a3a3" stroke="#e5e5e5" strokeWidth="2" />
          <circle cx="300" cy="80" r="4" fill="#a3a3a3" stroke="#e5e5e5" strokeWidth="2" />
          <circle cx="450" cy="200" r="6" fill="#737373" stroke="#e5e5e5" strokeWidth="2" />
          <circle cx="250" cy="350" r="5" fill="#a3a3a3" stroke="#e5e5e5" strokeWidth="2" />
          <circle cx="600" cy="120" r="5" fill="#737373" stroke="#e5e5e5" strokeWidth="2" />
          <circle cx="750" cy="80" r="4" fill="#a3a3a3" stroke="#e5e5e5" strokeWidth="2" />
          <circle cx="900" cy="250" r="6" fill="#171717" stroke="#e5e5e5" strokeWidth="2" />
          <circle cx="700" cy="380" r="5" fill="#a3a3a3" stroke="#e5e5e5" strokeWidth="2" />
          <circle cx="500" cy="420" r="4" fill="#a3a3a3" stroke="#e5e5e5" strokeWidth="2" />
        </svg>

        {/* Quiet floating abstract shapes */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-neutral-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-[400px] h-[400px] bg-neutral-200/30 rounded-full blur-3xl" />
      </div>
    );
  }

  if (type === 'fiber') {
    // Rich, glowing, dark-themed animated enterprise fiber route map background
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-slate-950" id="network-bg-fiber">
        {/* Deep, glowing ambient background radial mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.6)_0%,rgba(2,6,23,1)_100%)]" />
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-sky-500/10 rounded-full blur-[140px]" />
        
        {/* Animated matrix cyber-grid */}
        <div 
          className="absolute inset-0 opacity-[0.12] mix-blend-screen" 
          style={{
            backgroundImage: `
              linear-gradient(to right, #3b82f6 1px, transparent 1px),
              linear-gradient(to bottom, #3b82f6 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Drifting packet particles */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 60 - 30, 0],
                opacity: [0, 0.8, 0],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 6 + Math.random() * 8,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Comprehensive network layout topology */}
        <svg className="absolute w-full h-full" viewBox="0 0 1000 500" preserveAspectRatio="none">
          <defs>
            <linearGradient id="fiberGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#312e81" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#4f46e5" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0.3" />
            </linearGradient>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Glowing fiber optic connection lines */}
          {fiberConnections.map((conn, idx) => (
            <g key={idx}>
              {/* Backlight line */}
              <path
                d={conn.path}
                stroke="#1e1b4b"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Core active line */}
              <path
                d={conn.path}
                stroke="url(#fiberGlow)"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                className="opacity-70"
              />
            </g>
          ))}

          {/* Active moving packets (high speed neon pulses along fiber lines) */}
          {fiberConnections.map((conn, idx) => (
            <motion.circle
              key={`pulse-${idx}`}
              r="2.5"
              fill="#22d3ee"
              filter="url(#neonGlow)"
              className="shadow-[0_0_10px_#22d3ee]"
              animate={{
                offsetDistance: ['0%', '100%'],
              }}
              transition={{
                duration: 4 + (idx % 3) * 1.5,
                repeat: Infinity,
                ease: 'linear',
                delay: idx * 0.75,
              }}
              style={{
                motionPath: `path('${conn.path.replace(/%/g, 'px')}')`, // browser fallback simulation via direct rendering
                offsetPath: `path('${conn.path}')`,
              }}
            />
          ))}

          {/* Network Nodes (Switches, Routers with double rings) */}
          {fiberNodes.map((node) => (
            <g key={node.id}>
              {/* Outer pulsing ring */}
              <motion.circle
                cx={node.cx}
                cy={node.cy}
                r={node.r * 2.2}
                fill="none"
                stroke={node.color}
                strokeWidth="1"
                className="opacity-20"
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.1, 0.4, 0.1],
                }}
                transition={{
                  duration: 2.5 + (node.id % 4),
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              {/* Core active node */}
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.r}
                fill={node.color}
                className="shadow-lg"
              />
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.r * 0.5}
                fill="#ffffff"
              />
            </g>
          ))}
        </svg>
      </div>
    );
  }

  if (type === 'ai-core') {
    // Elegant amber neural network & orbital paths representation
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-stone-950" id="network-bg-ai-core">
        {/* Soft warmth gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(251,146,60,0.08)_0%,rgba(12,10,9,1)_100%)]" />
        <div className="absolute top-1/4 right-[10%] w-96 h-96 bg-amber-500/5 rounded-full blur-[100px]" />
        
        {/* Cybernet concentric orbits */}
        <div className="absolute right-10 bottom-0 top-0 w-1/2 opacity-25 hidden lg:block">
          <svg className="w-full h-full text-amber-500" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="200" cy="200" r="160" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 6" />
            <circle cx="200" cy="200" r="110" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" className="opacity-60" />
            <circle cx="200" cy="200" r="60" stroke="currentColor" strokeWidth="1.25" />
            
            {/* Spinning orbit nodes */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '200px 200px' }}
            >
              <circle cx="200" cy="40" r="4.5" fill="#f59e0b" className="shadow-[0_0_8px_#f59e0b]" />
              <circle cx="40" cy="200" r="3.5" fill="#f43f5e" />
            </motion.g>

            <motion.g
              animate={{ rotate: -360 }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '200px 200px' }}
            >
              <circle cx="200" cy="90" r="4" fill="#fb923c" />
              <circle cx="290" cy="200" r="3" fill="#f59e0b" />
            </motion.g>

            {/* Neural core */}
            <circle cx="200" cy="200" r="12" fill="#fb923c" className="opacity-20" />
            <motion.circle
              cx="200"
              cy="200"
              r="7"
              fill="#fb923c"
              animate={{
                scale: [1, 1.25, 1],
                fill: ['#fb923c', '#f43f5e', '#fb923c'],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </svg>
        </div>

        {/* Flowing background lines */}
        <svg className="absolute w-full h-full opacity-20" viewBox="0 0 1000 500" preserveAspectRatio="none">
          <path d="M -50 400 C 150 250, 350 450, 550 250 C 750 50, 850 150, 1050 50" stroke="#f59e0b" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
          <path d="M -50 150 C 200 300, 450 100, 700 350 C 850 450, 950 250, 1050 300" stroke="#f43f5e" strokeWidth="1" fill="none" />
          
          {/* Data packet flows */}
          <motion.circle
            cx="0" cy="0" r="3"
            fill="#f59e0b"
            animate={{
              cx: [-50, 1050],
              cy: [150, 300],
            }}
            style={{
              offsetPath: `path('M -50 150 C 200 300, 450 100, 700 350 C 850 450, 950 250, 1050 300')`
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          />
        </svg>
      </div>
    );
  }

  // default to collab
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-slate-950" id="network-bg-collab">
      {/* Deep teal glowing backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_75%,rgba(16,185,129,0.06)_0%,rgba(9,9,11,1)_100%)]" />
      <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" />

      {/* Cyber mesh grid background with custom perspective lines */}
      <div 
        className="absolute inset-0 opacity-[0.08]" 
        style={{
          backgroundImage: `
            linear-gradient(to right, #10b981 1px, transparent 1px),
            linear-gradient(to bottom, #10b981 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Isometric futuristic tech hubs */}
      <div className="absolute left-10 top-0 bottom-0 w-1/3 opacity-20 hidden lg:block">
        <svg className="w-full h-full text-emerald-500" viewBox="0 0 250 400" fill="none">
          <g transform="translate(20, 50)">
            {/* Server Hub 1 */}
            <rect x="20" y="40" width="80" height="120" rx="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <line x1="20" y1="70" x2="100" y2="70" stroke="currentColor" strokeWidth="1" />
            <line x1="20" y1="100" x2="100" y2="100" stroke="currentColor" strokeWidth="1" />
            <line x1="20" y1="130" x2="100" y2="130" stroke="currentColor" strokeWidth="1" />
            
            {/* Glowing indicators */}
            <motion.circle cx="35" cy="55" r="2.5" fill="#10b981" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <motion.circle cx="50" cy="55" r="2.5" fill="#10b981" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            <circle cx="65" cy="55" r="2.5" fill="#047857" />

            <motion.circle cx="35" cy="85" r="2" fill="#10b981" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.8, repeat: Infinity }} />
            <motion.circle cx="50" cy="85" r="2" fill="#059669" />

            {/* Inter-server links */}
            <path d="M 100 100 L 180 180" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
            
            {/* Server Hub 2 */}
            <rect x="140" y="180" width="80" height="120" rx="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <line x1="140" y1="210" x2="220" y2="210" stroke="currentColor" strokeWidth="1" />
            <line x1="140" y1="240" x2="220" y2="240" stroke="currentColor" strokeWidth="1" />
            <line x1="140" y1="270" x2="220" y2="270" stroke="currentColor" strokeWidth="1" />

            <motion.circle cx="155" cy="195" r="2.5" fill="#10b981" animate={{ opacity: [0.8, 0.2, 0.8] }} transition={{ duration: 1.2, repeat: Infinity }} />
            <motion.circle cx="170" cy="195" r="2.5" fill="#047857" />
          </g>
        </svg>
      </div>

      {/* Floating active packet nodes drifting across */}
      <div className="absolute inset-0 opacity-15">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/30 text-emerald-400"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -25, 0],
            }}
            transition={{
              duration: 5 + i * 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
