import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, X } from 'lucide-react';

const HandDrawnLine = ({ className = "", style = {} }: { className?: string, style?: React.CSSProperties }) => (
  <svg 
    viewBox="0 0 1200 20" 
    className={`w-full h-4 ${className}`} 
    fill="none" 
    stroke="currentColor" 
    strokeLinecap="round"
    style={style}
  >
    {/* Main organic wavy ink stroke */}
    <path 
      d="M0,10 Q150,5 300,12 T600,6 T900,14 T1200,10" 
      strokeWidth="1.6"
      className="opacity-80"
    />
    {/* Secondary overlapping sketchy pencil line */}
    <path 
      d="M0,11 Q150,8 300,10 T600,12 T900,8 T1200,11" 
      strokeWidth="0.8"
      className="opacity-45"
    />
  </svg>
);

export default function MidBanner() {
  const [showVideoModal, setShowVideoModal] = useState(false);

  return (
    <section id="full-video" className="relative bg-abyss-black overflow-hidden select-none">
      
      {/* 1. Full-Width Panoramic Cinematic Image / Video Placeholder */}
      <div className="relative w-full aspect-[21/9] md:aspect-[24/9] overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-abyss-black via-abyss-black/25 to-transparent z-10" />
        <img
          src="/hero_bg.webp"
          alt="Panoramic Kayaking along Scenic Kochi Waterways"
          className="w-full h-full object-cover opacity-80 transition-transform duration-10000 ease-out group-hover:scale-103"
          loading="lazy"
        />
        
        {/* Centered Transparent 'WATCH VIDEO' Play Button Overlay */}
        <div className="absolute inset-0 flex flex-col justify-center items-center z-20 px-6">
          <motion.button
            onClick={() => setShowVideoModal(true)}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 border border-white hover:bg-white hover:text-black rounded-full px-8 py-4 bg-abyss-black/35 backdrop-blur-md text-white text-xs font-mono tracking-[0.25em] uppercase hover:scale-105 transition-all duration-300 shadow-2xl group cursor-pointer"
          >
            <span>Watch Video</span>
            <Play size={12} className="fill-current transform group-hover:scale-110 transition-transform" />
          </motion.button>
          
          <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-glacier-cyan mt-4">
            Kadambrayar River Countryside Paddle
          </span>
        </div>
      </div>

      {/* 2. "Paddle together as a family" Section in Crisp, Premium WHITE Theme matching the screenshot */}
      <div className="w-full bg-[#f9fbfb] py-28 text-[#07191d] relative z-10">
        
        {/* Top dividing hand-drawn organic sketch line */}
        <HandDrawnLine className="absolute top-0 left-0 w-full text-[#082124]/30 z-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Side: Family Kayaking in front of snowy peaks with floating transparent pill */}
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="lg:col-span-6 relative rounded-3xl overflow-hidden shadow-[0_15px_40px_rgba(7,25,29,0.12)] group aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-[400px] border border-[#e2ecee]"
            >
              <img
                src="/sunset_tour.webp"
                alt="Family Kayaking under Kerala Coconut Palms"
                width="540"
                height="360"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-104"
                loading="lazy"
              />
              
              {/* Floating Transparent 'LEARN MORE' Pill matching the screenshot */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <button 
                  onClick={() => setShowVideoModal(true)}
                  aria-label="Learn more about family kayaking"
                  className="flex items-center gap-2 border border-white/80 bg-black/25 text-white text-[10px] tracking-widest font-mono uppercase px-6 py-3 rounded-full backdrop-blur-md hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 shadow-lg cursor-pointer"
                >
                  <span>Learn More</span>
                  <Play size={10} className="fill-current" />
                </button>
              </div>
            </motion.div>

            {/* Right Side: High-Contrast Editorial Content Layout matching the screenshot */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="lg:col-span-6 text-left flex flex-col justify-center items-start space-y-6"
            >
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-[#07191d] tracking-tight leading-[0.95] font-sans">
                Paddle Through <br />
                Kerala <br />
                <span className="font-serif italic text-[#0a1617] tracking-normal lowercase block pt-1.5 font-semibold">
                  together
                </span>
              </h2>
              
              {/* Precise paragraph copywriting matching the screenshot */}
              <p className="text-[14px] text-[#2c4044] leading-relaxed font-sans font-light max-w-xl">
                Curated family-friendly kayaking experiences through the peaceful waters of Kadambrayar. Enjoy calm village waterways, local flora, and memorable sunset views.
              </p>

              {/* Precise explore button matching the screenshot */}
              <a
                href="#popular-tours"
                className="relative px-8 py-3.5 rounded-full text-xs font-semibold font-sans tracking-wide text-[#07191d] overflow-hidden transition-all duration-300 bg-glacier-cyan hover:bg-glacier-blue shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <span>Explore Family Tours</span>
              </a>
            </motion.div>

          </div>
        </div>

        {/* Bottom dividing hand-drawn organic sketch line */}
        <HandDrawnLine className="absolute bottom-0 left-0 w-full text-[#082124]/30 z-20 pointer-events-none" />

      </div>

      {/* Cinematic YouTube Video Embed Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 md:p-12"
          >
            <button 
              onClick={() => setShowVideoModal(false)}
              aria-label="Close video player"
              className="absolute top-6 right-6 text-white hover:text-glacier-cyan p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden border border-white/20 bg-abyss-black shadow-2xl relative"
            >
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/2_XG9k_9r0M?autoplay=1&mute=0"
                title="Cinematic Kerala Travel Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
