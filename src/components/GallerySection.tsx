import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Maximize2, X } from 'lucide-react';

interface GalleryItem {
  id: number;
  category: 'mangroves' | 'sunsets' | 'guests' | 'expeditions';
  title: string;
  image: string;
  span: string; // for masonry grid aspect ratios
}

export default function GallerySection() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'mangroves' | 'sunsets' | 'guests' | 'expeditions'>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const galleryItems: GalleryItem[] = [
    {
      id: 1,
      category: 'expeditions',
      title: "Solo Backwater Exploration",
      image: "/IMG_8470.JPG.webp",
      span: "aspect-[3/4]"
    },
    {
      id: 2,
      category: 'guests',
      title: "Paddling with Water Lilies",
      image: "/IMG_8471.JPG.webp",
      span: "aspect-square"
    },
    {
      id: 3,
      category: 'mangroves',
      title: "Sunny Palm-lined Canals",
      image: "/IMG_8473.webp",
      span: "md:col-span-2 aspect-[16/10]"
    },
    {
      id: 4,
      category: 'guests',
      title: "Couples' River Date",
      image: "/IMG_8474.webp",
      span: "aspect-[4/3]"
    },
    {
      id: 5,
      category: 'sunsets',
      title: "Golden Hour Reflection",
      image: "/IMG_8475.webp",
      span: "aspect-square"
    },
    {
      id: 6,
      category: 'sunsets',
      title: "Peaceful Twilight Cruise",
      image: "/IMG_8476.webp",
      span: "aspect-[3/4]"
    },
    {
      id: 7,
      category: 'guests',
      title: "Our Furry Co-pilot",
      image: "/IMG_8477.webp",
      span: "md:col-span-2 aspect-[16/10]"
    },
    {
      id: 8,
      category: 'expeditions',
      title: "Father & Son Sunset Paddle",
      image: "/IMG_8478.webp",
      span: "aspect-[4/3]"
    }
  ];

  const filteredItems = activeFilter === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeFilter);

  return (
    <section id="gallery" className="relative py-12 md:py-24 bg-[#F4EBDB] overflow-hidden select-none text-[#07191d]">
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-16">
          <p className="text-[10px] font-mono tracking-[0.4em] text-[#129A8C] uppercase mb-3 font-bold">
            VISUAL DISPATCHES
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-[#07191d] font-sans leading-none">
            Moments from the River
          </h2>
          <p className="text-xs font-mono tracking-widest text-[#2c4044] uppercase mt-4">
            Curated visual travelogue capturing peaceful village routes, sunsets, and local mangroves.
          </p>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap justify-center items-center gap-3 mb-8 md:mb-16 font-mono text-[9px] tracking-widest uppercase">
          {['all', 'mangroves', 'sunsets', 'guests', 'expeditions'].map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter as any)}
                className={`px-6 py-2.5 rounded-full border transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-[#07191d] border-[#07191d] text-white font-bold shadow-md'
                    : 'bg-white/50 border-[#e2ecee] hover:border-[#07191d]/30 text-[#2c4044]'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
        {/* True CSS Columns Masonry (Zero Image Cropping) */}
        <motion.div 
          layout 
          className="columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-6 max-w-6xl mx-auto [column-fill:_balance]"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="break-inside-avoid mb-4 sm:mb-6 relative overflow-hidden rounded-[16px] sm:rounded-[24px] border border-[#e2ecee] bg-white group hover:shadow-[0_15px_40px_rgba(7,25,29,0.06)] hover:translate-y-[-4px] transition-all duration-500 cursor-pointer"
                onClick={() => setSelectedImage(item)}
              >
                {/* Image - rendered in full native dimensions with zero cropping */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-auto block object-contain transition-transform duration-1000 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                {/* Cinematic Glass Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-3 sm:p-6 text-white text-left">
                  <div className="backdrop-blur-md bg-white/10 border border-white/20 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl flex items-center justify-between shadow-2xl w-full">
                    <div>
                      <span className="text-[8px] font-sans font-extrabold tracking-[0.2em] text-glacier-cyan uppercase block mb-0.5">
                        {item.category}
                      </span>
                      <h4 className="text-[10px] sm:text-sm font-bold font-sans tracking-wide text-white leading-tight">
                        {item.title}
                      </h4>
                    </div>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-white/20 bg-white/10 flex items-center justify-center shrink-0">
                      <Maximize2 size={10} className="text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Full-Screen Glass Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 backdrop-blur-md"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 text-white hover:text-glacier-cyan p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-4xl w-full max-h-[80vh] rounded-3xl overflow-hidden border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="w-full h-full max-h-[80vh] object-contain bg-black"
              />
              <div className="absolute bottom-6 left-6 right-6 backdrop-blur-lg bg-black/60 border border-white/10 p-5 rounded-2xl text-left text-white flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-sans font-extrabold tracking-[0.2em] text-glacier-cyan uppercase block mb-0.5">
                    {selectedImage.category}
                  </span>
                  <h3 className="text-lg font-bold font-sans tracking-wide text-white">
                    {selectedImage.title}
                  </h3>
                </div>
                <span className="text-[9px] font-sans font-bold tracking-widest uppercase text-gray-400/80">
                  © Hooked & Cooked
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
