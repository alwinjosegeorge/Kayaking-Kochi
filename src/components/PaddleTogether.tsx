import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X } from 'lucide-react';

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

export default function PaddleTogether() {
  const [showVideoModal, setShowVideoModal] = useState(false);

  return (
    <section id="paddle-together" className="relative bg-[#F4EBDB] overflow-hidden select-none">

      {/* Top dividing hand-drawn organic sketch line */}
      <HandDrawnLine className="absolute top-0 left-0 w-full text-[#082124]/30 z-20 pointer-events-none" />

      {/* "Paddle together as a family" Section in Crisp, Premium WHITE Theme */}
      <div className="w-full py-14 md:py-28 text-[#07191d] relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

            {/* Left Side: Family Kayaking image with floating transparent pill */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="lg:col-span-6 relative rounded-3xl overflow-hidden shadow-[0_15px_40px_rgba(7,25,29,0.10)] group aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-[400px] border border-[#e8e2da]"
            >
              <img
                src="/sunset_tour.webp"
                alt="Family Kayaking under Kerala Coconut Palms"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-104"
                loading="lazy"
              />

              {/* Floating Transparent 'LEARN MORE' Pill */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="flex items-center gap-2 border border-white/80 bg-black/25 text-white text-[10px] tracking-widest font-mono uppercase px-6 py-3 rounded-full backdrop-blur-md hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 shadow-lg cursor-pointer"
                >
                  <span>Learn More</span>
                  <Play size={10} className="fill-current" />
                </button>
              </div>
            </motion.div>

            {/* Right Side: High-Contrast Editorial Content Layout */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="lg:col-span-6 text-left flex flex-col justify-center items-start space-y-4 md:space-y-6"
            >
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-[#07191d] tracking-tight leading-[0.95] font-sans">
                Paddle Through <br />
                Kerala <br />
                <span className="font-serif italic text-[#0a1617] tracking-normal lowercase block pt-1.5 font-semibold">
                  together
                </span>
              </h2>

              <p className="text-[14px] text-[#2c4044] leading-relaxed font-sans font-light max-w-xl">
                Curated family-friendly kayaking experiences through the peaceful waters of Kadambrayar. Enjoy calm village waterways, local flora, and memorable sunset views.
              </p>

              <a
                href="#popular-tours"
                className="relative px-8 py-3.5 rounded-full text-xs font-semibold font-sans tracking-wide text-[#07191d] overflow-hidden transition-all duration-300 bg-glacier-cyan hover:bg-glacier-blue shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <span>Explore Family Tours</span>
              </a>
            </motion.div>

          </div>
        </div>
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
                src="https://www.youtube.com/embed/tyMVgHzfky8?autoplay=1&mute=0&start=7"
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
