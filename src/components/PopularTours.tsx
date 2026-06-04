import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const popularTours = [
  {
    title: "Kadambrayar River & Mangrove Day Tour",
    price: "₹450",
    subPrice: "per person",
    badge: "Most Popular",
    image: "/mangrove_tour.webp",
    desc: "Paddle through scenic mangrove waterways and peaceful backwater routes across Kadambrayar."
  },
  {
    title: "Countryside Sunset Kayak Tour",
    price: "₹450",
    subPrice: "per person",
    badge: "Sunset Special",
    image: "/sunset_tour.webp",
    desc: "Experience golden sunsets and calm village waters through curated evening paddles."
  },
  {
    title: "Vembanad Lake Wilderness Paddle",
    badge: "Full Day Adventure",
    image: "/vembanad_tour.webp",
    desc: "Explore the open waters and peaceful beauty of Kerala’s iconic backwater landscapes."
  },
  {
    title: "Kadamakkudy Island Explorer",
    badge: "Countryside Escape",
    image: "/kadamakkudy_tour.webp",
    desc: "Discover hidden island villages, quiet waters, and authentic countryside experiences."
  }
];

export default function PopularTours() {
  const [sliderIndex, setSliderIndex] = useState(0);

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

  const handlePrev = () => {
    setSliderIndex(prev => (prev === 0 ? popularTours.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSliderIndex(prev => (prev === popularTours.length - 1 ? 0 : prev + 1));
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

        {/* Borderless Cards Grid matching the screenshot exactly */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
          {popularTours.map((tour, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              onClick={handleCardClick}
              className="flex flex-col space-y-6 text-left group hover:translate-y-[-6px] transition-all duration-500 relative z-10 cursor-pointer"
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
              <p className="text-[13px] text-[#8e9f9f] leading-relaxed font-sans font-light max-w-[270px]">
                {tour.desc}
              </p>

            </motion.div>
          ))}
        </div>

        {/* Circular outline navigation buttons at bottom-left */}
        <div className="flex items-center space-x-4 mt-10 md:mt-16 pt-4">
          <button 
            onClick={handlePrev}
            aria-label="Previous tour"
            className="w-10 h-10 rounded-full border border-white/30 hover:border-white text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={handleNext}
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
