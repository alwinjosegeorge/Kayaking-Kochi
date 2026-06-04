import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const reviews = [
  {
    quote: "Paddling through Kadambrayar during sunrise was unforgettable. The calm waters and local guides made the experience feel deeply personal.",
    author: "Priya Menon",
    subtitle: "Countryside Sunrise Kayaker · Bangalore",
  },
  {
    quote: "The sunset backwater tour felt cinematic. One of the most peaceful experiences we had in Kerala.",
    author: "Rahul Sharma",
    subtitle: "Sunset Backwater Explorer · Mumbai",
  },
  {
    quote: "Beautiful hidden waterways, incredible hospitality, and extremely professional guides.",
    author: "Anjali Thomas",
    subtitle: "Hidden Waterways Guest · Kochi",
  },
  {
    quote: "Sunset kayaking through Kadambrayar was the most peaceful experience we had in Kochi. The backwaters, birds, and golden evening reflections felt unreal. Truly unforgettable.",
    author: "Adith & Meera",
    subtitle: "Kadamakkudy River Paddlers · Bangalore",
  },
  {
    quote: "The mangrove forest paddle was magical. Silence, birds, and glassy water — it felt like time stopped.",
    author: "Fathima & Rinshad",
    subtitle: "Mangrove Forest Explorers · Calicut",
  },
];

const AUTOPLAY_DELAY = 4000;

export default function Reviews() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  // Autoplay: advance every 4 seconds, pause on hover
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % reviews.length);
    }, AUTOPLAY_DELAY);
    return () => clearInterval(timer);
  }, [paused]);

  const prev = () => setCurrent((c) => (c - 1 + reviews.length) % reviews.length);
  const next = () => setCurrent((c) => (c + 1) % reviews.length);

  return (
    <section
      id="reviews"
      style={{ background: '#F4EBDB' }}
      className="w-full py-10 md:py-16 text-[#1a2e1c]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-4xl mx-auto px-8 md:px-16 flex flex-col items-center">

        {/* Quote badge — circle with quote icon, no shadow, no glow */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
          style={{ border: '1px solid rgba(169, 140, 100, 0.3)', background: '#faf5ed' }}
        >
          <svg
            width="22" height="22" viewBox="0 0 24 24" fill="#A98C64"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-4.795 2.636-4.795 5.656h5.8v10.2h-11v-.002zm-12 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.154c-2.433.917-4.796 2.636-4.796 5.656h5.8v10.2h-11v-.002z" />
          </svg>
        </div>

        {/* Review carousel */}
        <div className="w-full relative min-h-[150px] sm:min-h-[125px] md:min-h-[110px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-center flex flex-col items-center w-full"
            >
              {/* Large italic serif quote */}
              <blockquote
                className="font-serif italic font-light leading-relaxed text-center"
                style={{
                  fontSize: 'clamp(1.15rem, 2.8vw, 1.85rem)',
                  color: '#1a2e1c',
                  maxWidth: '860px',
                  lineHeight: 1.5,
                }}
              >
                "{reviews[current].quote}"
              </blockquote>

              {/* Author info */}
              <div className="mt-5 flex flex-col items-center gap-1">
                <span
                  className="uppercase tracking-widest font-sans font-semibold"
                  style={{ fontSize: '0.68rem', color: '#A98C64', letterSpacing: '0.22em' }}
                >
                  {reviews[current].author}
                </span>
                <span
                  className="font-sans"
                  style={{ fontSize: '0.78rem', color: '#6b5a43', opacity: 0.85 }}
                >
                  {reviews[current].subtitle}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom navigation: ‹ · · ● · › */}
        <div className="flex items-center gap-5 mt-6">

          {/* Prev button — thin circle, no fill */}
          <button
            onClick={prev}
            aria-label="Previous review"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:opacity-70 focus:outline-none"
            style={{ border: '1px solid rgba(169, 140, 100, 0.35)', background: 'transparent' }}
          >
            <ChevronLeft size={16} color="#A98C64" strokeWidth={1.6} />
          </button>

          {/* Dot indicators */}
          <div className="flex items-center gap-2.5">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Review ${i + 1}`}
                className="focus:outline-none transition-all duration-400"
                style={{
                  width: current === i ? '28px' : '7px',
                  height: '7px',
                  borderRadius: '9999px',
                  background: current === i ? '#A98C64' : 'rgba(169,140,100,0.3)',
                  transition: 'width 0.4s ease, background 0.3s ease',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={next}
            aria-label="Next review"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:opacity-70 focus:outline-none"
            style={{ border: '1px solid rgba(169, 140, 100, 0.35)', background: 'transparent' }}
          >
            <ChevronRight size={16} color="#A98C64" strokeWidth={1.6} />
          </button>

        </div>

      </div>
    </section>
  );
}
