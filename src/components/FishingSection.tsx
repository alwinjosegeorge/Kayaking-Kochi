import React from 'react';
import { motion } from 'framer-motion';
import { Fish, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function FishingSection() {
  const whatsappNumber = "919072611622";
  const defaultMessage = "Hi! I would like to book a fishing experience at Kadambrayar Fishing Point. Please share the slots and details.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <section id="fishing-section" className="relative py-16 md:py-24 bg-[#F4EBDB] text-[#07191d] overflow-hidden select-none">
      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-20">
        
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Minimal Typography & One Scenic Image */}
          <div className="space-y-8 text-left">
            <div className="space-y-4">
              <p className="text-[10px] font-mono tracking-[0.4em] text-[#129A8C] uppercase font-bold">
                Waterfront Escape
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight leading-none font-sans text-[#07191d]">
                Fishing at <br />
                <span className="font-serif italic text-[#129A8C] font-light tracking-normal lowercase">Kadambrayar</span>
              </h2>
              <p className="text-sm text-[#2c4044] font-light leading-relaxed font-sans max-w-lg">
                Escape the city noise and enjoy a peaceful fishing experience on the beautiful shores of Kadambrayar. 
                Perfect for families, friends, and weekend outings.
              </p>
            </div>

            {/* Featured Image */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative aspect-[16/10] overflow-hidden rounded-[24px] border border-[#e2ecee] shadow-md max-w-lg"
            >
              <img 
                src="/fishing_featured.webp" 
                alt="Kadambrayar Fishing Shores" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-[8px] font-mono tracking-[0.2em] text-glacier-cyan uppercase font-bold mb-0.5">Scenic spot</span>
                <h4 className="text-sm font-bold font-sans">Kadambrayar Fishing Shores</h4>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Pricing & WhatsApp Booking Card */}
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white border border-[#e2ecee] rounded-[28px] p-6 sm:p-8 shadow-[0_10px_40px_rgba(7,25,29,0.03),_0_2px_10px_rgba(7,25,29,0.01)] text-[#0d0d0d] relative overflow-hidden"
            >
              <div className="space-y-6 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono tracking-[0.2em] text-[#0d0d0d]/60 uppercase font-bold">
                    All-Inclusive Access
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#F4EBDB] text-[#4A3428] border border-[#4A3428]/10 text-[9px] font-bold tracking-wider uppercase">
                    Daily Slots
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-gray-500 font-sans block">Activity Rate</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-[#0d0d0d] tracking-tight">₹250</span>
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">per person</span>
                  </div>
                  <span className="text-[10px] text-[#C8A86B] font-bold block mt-1">Complete Activity • Rod, Tackle & Bait Included</span>
                </div>

                <hr className="border-[#F0EFEA]" />

                <ul className="space-y-3.5 text-xs text-[#2c4044] font-sans font-light">
                  <li className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#C8A86B]/15 text-[#C8A86B] flex items-center justify-center text-[10px] font-bold">✓</span>
                    <span>Entrance to dedicated waterfront fishing spots</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#C8A86B]/15 text-[#C8A86B] flex items-center justify-center text-[10px] font-bold">✓</span>
                    <span>Fishing rod and tackle gear rentals included</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#C8A86B]/15 text-[#C8A86B] flex items-center justify-center text-[10px] font-bold">✓</span>
                    <span>Basic assistance and fresh bait setup</span>
                  </li>
                </ul>

                <hr className="border-[#F0EFEA]" />

                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#0d0d0d] hover:bg-[#1f1f1f] text-white text-xs font-black tracking-widest uppercase transition-all duration-300 shadow-md cursor-pointer text-center"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 font-bold">
                    Book on WhatsApp
                  </span>
                </a>

                {/* Minimal Safety Guidelines */}
                <div className="bg-[#FAF9F6] border border-[#F0EFEA] rounded-xl p-3.5 space-y-2 text-[11px] text-[#2c4044] font-sans">
                  <span className="font-bold flex items-center gap-1.5 text-amber-600 uppercase text-[9px] tracking-wider">
                    <AlertTriangle size={12} /> Safety Guidelines
                  </span>
                  <ul className="list-disc pl-4 space-y-1 font-light leading-normal">
                    <li>Children must be accompanied by adults near the water.</li>
                    <li>Respect catch-and-release regulations where applicable.</li>
                  </ul>
                </div>

                <div className="flex items-center justify-center gap-2.5 text-[9.5px] font-mono tracking-wider text-gray-400 uppercase text-center mt-1">
                  <ShieldCheck size={12} className="text-[#C8A86B]" /> Secure Redirection • Instant Reply
                </div>
              </div>
            </motion.div>
          </div>

        </div>

      </div>
    </section>
  );
}
