import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Detect mobile once at module level for animation optimisation
const isMobileDevice = typeof window !== 'undefined' && (window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent));


const popularTours = [
  {
    title: "Sunrise Kayaking",
    price: "₹450",
    subPrice: "per person",
    badge: "Morning Special",
    image: "/mangrove_tour.webp",
    desc: "Start your day gliding through calm backwaters as the rising sun paints the sky. Experience peaceful waterways, birdsong, and the refreshing beauty of Kerala's morning landscapes."
  },
  {
    title: "Sunset Kayaking",
    price: "₹450",
    subPrice: "per person",
    badge: "Most Popular",
    image: "/sunset_tour.webp",
    desc: "Paddle through golden waters and witness breathtaking sunsets over Kerala's backwaters. A relaxing evening adventure perfect for couples, families, and nature lovers."
  },
  {
    title: "City Ride",
    price: "₹450",
    subPrice: "per person",
    badge: "Urban Explorer",
    image: "/vembanad_tour.webp",
    desc: "Explore the vibrant waterways surrounding Kochi and discover the unique blend of urban life and natural beauty. A refreshing perspective of the city from the water."
  },
  {
    title: "Village Ride",
    price: "₹450",
    subPrice: "per person",
    badge: "Countryside Escape",
    image: "/kadamakkudy_tour.webp",
    desc: "Journey through authentic village canals, coconut groves, and peaceful countryside scenery. Experience the traditional charm and everyday life of Kerala's backwater communities."
  }
];

export default function PopularTours() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
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

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.85;
      const targetScrollLeft = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
        
      container.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="popular-tours" className="relative py-14 md:py-28 bg-abyss-black overflow-hidden select-none text-white">
      
      {/* Background soft glow auroras */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full bg-glacier-cyan/5 blur-[130px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Title */}
        <div className="text-left mb-10 md:mb-16 max-w-4xl">
          <p className="text-[10px] font-mono tracking-[0.4em] text-glacier-cyan uppercase mb-3 font-bold">
            CURATED ADVENTURES
          </p>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase text-white tracking-tight leading-none font-sans">
            Our Most Popular <br />
            Backwater Experiences
          </h2>
        </div>

        {/* Horizontal Scroll Carousel on Mobile/Tablet, Grid on Desktop */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-6 md:gap-8 pb-6 lg:pb-0 no-scrollbar"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {popularTours.map((tour, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: isMobileDevice ? 15 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              onClick={handleCardClick}
              className="flex flex-col space-y-6 text-left group hover:translate-y-[-6px] transition-all duration-500 relative z-10 cursor-pointer w-[245px] sm:w-[285px] shrink-0 lg:w-auto lg:shrink"
            >
              {/* Image Frame with rounded corners */}
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] border border-transparent group-hover:border-glacier-cyan/25 group-hover:shadow-[0_15px_40px_rgba(0,245,255,0.06)] transition-all duration-500">
                <img
                  src={tour.image}
                  alt={tour.title}
                  width="294"
                  height="368"
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-106"
                  loading="lazy"
                />
                
                {/* White capsule badges matching the screenshot */}
                <div className="absolute top-4 left-4 z-20">
                  <span className="px-3 py-1.5 rounded-full bg-white text-black text-[9px] font-bold tracking-wide shadow-md">
                    {tour.badge}
                  </span>
                </div>
              </div>

              {/* Title & Pricing Aligned Row */}
              <div className="flex justify-between items-start gap-4">
                <h3 className="text-[17px] font-black uppercase tracking-wide text-white leading-tight max-w-[200px]">
                  {tour.title}
                </h3>
                
                {tour.price && (
                  <div className="text-right font-mono flex flex-col items-end">
                    <span className="text-[17px] font-black text-white">{tour.price}</span>
                    <span className="text-[8px] text-gray-400 uppercase tracking-widest leading-none mt-0.5 whitespace-nowrap">
                      {tour.subPrice}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-[13px] text-[#8e9f9f] leading-relaxed font-sans font-light max-w-full">
                {tour.desc}
              </p>

            </motion.div>
          ))}
        </div>

        {/* Circular outline navigation buttons at bottom-left */}
        <div className="flex items-center space-x-4 mt-8 pt-2 lg:hidden">
          <button 
            onClick={() => scroll('left')}
            aria-label="Previous tour"
            className="w-10 h-10 rounded-full border border-white/30 hover:border-white text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => scroll('right')}
            aria-label="Next tour"
            className="w-10 h-10 rounded-full border border-white/30 hover:border-white text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>

      </div>
    </section>
  );
}
