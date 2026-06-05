import React from 'react';
import { motion } from 'framer-motion';

// Detect mobile once at module level for animation optimisation
const isMobileDevice = typeof window !== 'undefined' && (window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent));

const WhaleTailSVG = () => (
  <svg 
    className="w-20 h-20 text-glacier-cyan relative z-10 transition-transform duration-500 hover:scale-110"
    viewBox="0 0 100 100" 
    fill="currentColor"
  >
    <path d="M50,75 C50,75 54,45 68,35 C82,25 96,23 98,30 C100,37 84,43 72,47 C60,51 51,62 50,75 Z" />
    <path d="M50,75 C50,75 46,45 32,35 C18,25 4,23 2,30 C0,37 16,43 28,47 C40,51 49,62 50,75 Z" />
    <path d="M50,75 L50,85" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M38,82 C38,82 45,86 50,86 C55,86 62,82 62,82" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M42,88 C42,88 47,91 50,91 C53,91 58,88 58,88" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function Intro() {
  const cards = [
    {
      icon: <img src="/family.webp" alt="Family Owned" width="64" height="64" className="w-16 h-16 object-contain" loading="lazy" />,
      title: "FAMILY OWNED &\nLOCALLY OPERATED",
      desc: "Based in Kadambrayar, Kochi, we create peaceful kayaking experiences through Kerala’s beautiful backwaters for families, couples, and adventure lovers."
    },
    {
      icon: <img src="/kayak.webp" alt="Small Group" width="64" height="64" className="w-16 h-16 object-contain" loading="lazy" />,
      title: "SMALL GROUP &\nPRIVATE KAYAKING",
      desc: "Enjoy calm waters, scenic routes, and curated kayaking adventures designed for small groups, couples, and private experiences."
    },
    {
      icon: <img src="/eco.webp" alt="Eco Tourism" width="64" height="64" className="w-16 h-16 object-contain" loading="lazy" />,
      title: "ECO TOURISM &\nNATURE EXPERIENCES",
      desc: "We believe in responsible tourism that respects nature, protects backwaters, and creates meaningful outdoor experiences."
    },
    {
      icon: <img src="/guide.webp" alt="Local Guides" width="64" height="64" className="w-16 h-16 object-contain" loading="lazy" />,
      title: "GUIDED BY LOCAL\nEXPERTS",
      desc: "Our experienced local guides ensure a safe, beginner-friendly, and unforgettable kayaking experience across Kadambrayar."
    }
  ];

  return (
    <section id="expeditions" className="relative py-14 md:py-28 bg-abyss-black overflow-hidden select-none">
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center">
        
        {/* Centered Whale Tail icon */}
        <motion.div
          initial={isMobileDevice ? false : { opacity: 0, scale: 0.8 }}
          whileInView={isMobileDevice ? undefined : { opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex justify-center mb-6"
        >
          <div className="relative group">
            <WhaleTailSVG />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={isMobileDevice ? false : { opacity: 0, y: 30 }}
          whileInView={isMobileDevice ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2 }}
          className="text-4xl md:text-6xl lg:text-7xl font-black tracking-wide text-white uppercase max-w-5xl mx-auto leading-none mb-16 md:mb-32 font-sans"
        >
          Kayak Kerala Through <br />
          <span className="font-serif italic text-glacier-cyan font-light tracking-normal lowercase block md:inline py-2">
            passionate
          </span>{" "}
          Guides & Hidden Waters.
        </motion.h2>

        {/* 4 Value Cards Grid exactly matching the screenshot (borderless, high-contrast, text-left) */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-12 lg:gap-8 text-left max-w-6xl mx-auto items-start">
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={isMobileDevice ? false : { opacity: 0, y: 25 }}
              whileInView={isMobileDevice ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className="flex flex-col items-start"
            >
              {/* Illustration Icon */}
              <div className="mb-4 sm:mb-8 text-white hover:text-glacier-cyan transform hover:scale-105 transition-all duration-300">
                {card.icon}
              </div>
              
              {/* Heading */}
              <h3 className="text-[11.5px] sm:text-[14px] font-extrabold tracking-[0.08em] leading-snug text-white uppercase mb-3 sm:mb-4 font-sans select-none">
                {card.title}
              </h3>
              
              {/* Description */}
              <p className="text-[11.5px] sm:text-[13px] text-[#ccd6d7] leading-relaxed font-sans font-normal tracking-wide max-w-[270px] select-text">
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
