import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X } from 'lucide-react';

export default function VideoSection() {
  const [showVideoModal, setShowVideoModal] = useState(false);

  return (
    <section id="full-video" className="relative bg-abyss-black overflow-hidden select-none">

      {/* Full-Width Panoramic Cinematic Image / Video Placeholder */}
      <div className="relative w-full aspect-[21/9] md:aspect-[24/9] overflow-hidden border-t border-glacier-cyan/15 group">
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
                src="https://www.youtube.com/embed/EwsZtNDC_h4?autoplay=1&mute=0"
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
