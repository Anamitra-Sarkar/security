"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface MagnifyingGlassProps {
  isAnalyzing: boolean;
}

export default function MagnifyingGlass({ isAnalyzing }: MagnifyingGlassProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isAnalyzing) return;

    let startTime = Date.now();
    let animationFrame: number;

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000; // seconds
      
      // Use sine and cosine for smooth, organic movement
      // Different frequencies for x and y create interesting patterns
      const x = Math.sin(elapsed * 0.7) * 40 + Math.cos(elapsed * 0.4) * 30;
      const y = Math.cos(elapsed * 0.5) * 35 + Math.sin(elapsed * 0.6) * 25;
      
      setPosition({ x, y });
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isAnalyzing]);

  if (!isAnalyzing) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.3 }}
      className="fixed top-1/2 left-1/2 pointer-events-none z-50"
      style={{
        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
        transition: 'transform 0.8s ease-in-out',
      }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 blur-2xl opacity-50">
        <div className="w-32 h-32 bg-blue-400 rounded-full" />
      </div>

      {/* Main magnifying glass */}
      <motion.svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        className="relative drop-shadow-2xl"
        animate={{
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Handle */}
        <motion.path
          d="M 75 75 L 110 110"
          stroke="#1E40AF"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          animate={{
            strokeWidth: [8, 10, 8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Circle rim */}
        <motion.circle
          cx="45"
          cy="45"
          r="35"
          fill="none"
          stroke="#1E40AF"
          strokeWidth="6"
          animate={{
            strokeWidth: [6, 8, 6],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Glass surface with gradient */}
        <defs>
          <radialGradient id="glassGradient" cx="0.3" cy="0.3">
            <stop offset="0%" stopColor="#BFDBFE" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
          </radialGradient>
          
          <linearGradient id="scanBeam" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0" />
            <stop offset="50%" stopColor="#10B981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        <circle
          cx="45"
          cy="45"
          r="33"
          fill="url(#glassGradient)"
        />
        
        {/* Scanning beam effect */}
        <motion.line
          x1="20"
          y1="20"
          x2="70"
          y2="70"
          stroke="url(#scanBeam)"
          strokeWidth="3"
          strokeLinecap="round"
          animate={{
            x1: [20, 30, 20],
            y1: [20, 30, 20],
            x2: [70, 60, 70],
            y2: [70, 60, 70],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Sparkle 1 */}
        <motion.circle
          cx="30"
          cy="25"
          r="2"
          fill="#FFFFFF"
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 0,
          }}
        />
        
        {/* Sparkle 2 */}
        <motion.circle
          cx="55"
          cy="35"
          r="2"
          fill="#FFFFFF"
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 0.5,
          }}
        />
        
        {/* Sparkle 3 */}
        <motion.circle
          cx="40"
          cy="55"
          r="2"
          fill="#FFFFFF"
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 1,
          }}
        />
      </motion.svg>

      {/* Analyzing text */}
      <motion.div
        className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
        animate={{
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent drop-shadow">
          Analyzing...
        </span>
      </motion.div>

      {/* Particle effects */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400 rounded-full"
          style={{
            left: '50%',
            top: '50%',
          }}
          animate={{
            x: [0, Math.cos(i * 72 * Math.PI / 180) * 60],
            y: [0, Math.sin(i * 72 * Math.PI / 180) * 60],
            opacity: [1, 0],
            scale: [1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeOut",
          }}
        />
      ))}
    </motion.div>
  );
}
