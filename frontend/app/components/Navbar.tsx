"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface NavbarProps {
  onGetStarted?: () => void;
}

export default function Navbar({ onGetStarted }: NavbarProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#050d1a]/80 backdrop-blur-md border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8L7 12L13 4"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight font-[Sora,Inter,sans-serif]">
            Zynera
          </span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
          >
            Features
          </Link>
          <Link
            href="#architecture"
            className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
          >
            Architecture
          </Link>
          <Link
            href="/docs"
            className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
          >
            Docs
          </Link>
        </div>

        {/* CTA */}
        <button
          onClick={onGetStarted}
          className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 text-white font-medium shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200"
        >
          Get Started
        </button>
      </div>
    </motion.nav>
  );
}
