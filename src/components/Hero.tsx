import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export default function Hero() {
  const handleBookClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById('booking-section');
    if (el) {
      const lenisInstance = (window as any).lenis;
      if (lenisInstance && typeof lenisInstance.scrollTo === 'function') {
        lenisInstance.scrollTo(el, { duration: 0.9 });
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header id="hero" className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-abyss-black select-none">
      
      {/* Background Video — Mobile: portrait, autoplay, high priority */}
      <video
        src="/phone_home_page.mp4"
        poster="/hero_bg.webp"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover object-center z-0 opacity-95 block md:hidden transform-gpu will-change-transform"
      />
      {/* Background Video — Desktop: landscape, defer load until mobile video done */}
      <video
        src="/IMG_8598.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="none"
        className="absolute inset-0 w-full h-full object-cover object-center z-0 opacity-95 hidden md:block transform-gpu will-change-transform"
      />
      {/* Dark overlay matching the moody cinematic Scandinavian travel vibe */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-abyss-black via-abyss-black/35 to-black/50" />
      <div className="absolute inset-0 z-0 bg-radial-gradient from-transparent via-transparent to-abyss-black/75" />

      {/* Spacing for Navbar */}
      <div className="h-28" />

      {/* Center massive heading */}
      <div className="relative z-10 max-w-6xl mx-auto w-full px-6 md:px-12 flex-grow flex flex-col justify-center items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[1.05] drop-shadow-[0_10px_25px_rgba(0,0,0,0.7)] font-serif"
        >
          Unforgettable <br className="hidden md:block" />
          Kayaking Tours <br className="hidden md:block" />
          in Kochi
        </motion.h1>
      </div>

      {/* Bottom info & buttons align row */}
      <div className="relative z-10 w-full bg-gradient-to-t from-abyss-black to-transparent pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
          
          {/* Left Description */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="md:col-span-6 text-left"
          >
            <p className="text-base sm:text-lg font-sans text-glacier-light tracking-wide leading-relaxed max-w-lg">
              Curated kayaking experiences through Kerala’s most peaceful backwaters
            </p>
          </motion.div>

          {/* Right Buttons side-by-side matching the screenshot exactly */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="md:col-span-6 flex flex-wrap md:justify-end gap-5 items-center"
          >
            {/* Watch Video clean outline button */}
            <a
              href="#full-video"
              className="w-full sm:w-auto text-center px-8 py-3.5 rounded-full border border-white hover:bg-white hover:text-black text-white text-base font-sans font-normal transition-all duration-300 cursor-pointer"
            >
              Watch Video
            </a>

            {/* Book Your Adventure flat solid turquoise button with liquid hover effect */}
            <a
              href="#booking-section"
              onClick={handleBookClick}
              className="group relative w-full sm:w-auto text-center px-8 py-3.5 rounded-full border border-glacier-cyan bg-glacier-cyan text-abyss-black text-base font-sans font-semibold transition-all duration-500 cursor-pointer shadow-md overflow-hidden z-0"
            >
              {/* Liquid rising wave effect */}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[180%] aspect-square rounded-[42%] bg-glacier-blue translate-y-[100%] group-hover:translate-y-[-25%] group-hover:rotate-[360deg] transition-all duration-[900ms] ease-[cubic-bezier(0.19,1,0.22,1)] -z-10" />
              
              <span className="relative z-10 transition-colors duration-500 text-abyss-black">
                Book Your Adventure
              </span>
            </a>
          </motion.div>

        </div>
      </div>

    </header>
  );
}
