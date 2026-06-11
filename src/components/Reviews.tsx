import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Info, ExternalLink, X, MapPin } from 'lucide-react';

interface GoogleReview {
  id: string;
  name: string;
  avatarColor?: string;
  avatarText?: string;
  rating: number;
  date: string;
  text: string;
  isLocalGuide?: boolean;
  reviewsCount?: number;
  photos?: string[];
  tags: string[];
}

const reviewsData: GoogleReview[] = [
  {
    id: '1',
    name: 'Nimitha Narayanan',
    avatarColor: 'bg-[#e91e63]',
    avatarText: 'N',
    rating: 5,
    date: '3 months ago',
    reviewsCount: 53,
    text: 'Beautiful sunrise, great instructors, and a peaceful vibe. Couldn’t have asked for a better kayaking experience♥',
    tags: ['Sunrise / Morning', 'Instructors']
  },
  {
    id: '2',
    name: 'Sreepriya Vs',
    avatarColor: 'bg-[#009688]',
    avatarText: 'SV',
    rating: 5,
    date: '3 months ago',
    reviewsCount: 92,
    text: 'Had a wonderful morning kayaking experience at H & C Boat Club, Kadambrayar. The calm backwaters, fresh air, and peaceful surroundings made it the perfect way to start the day. The staff were friendly and supportive, especially for beginners. Highly recommend for anyone looking for a refreshing and relaxing activity in Kochi!',
    tags: ['Sunrise / Morning', 'Beginners', 'Instructors']
  },
  {
    id: '3',
    name: 'Joshy Jose',
    avatarColor: 'bg-[#3f51b5]',
    avatarText: 'JJ',
    rating: 5,
    date: '3 months ago',
    reviewsCount: 48,
    photos: ['/IMG_8473.webp', '/IMG_8474.webp', '/IMG_8475.webp'],
    text: 'A lovely place with good kayaks, friendly staff, calm views, and beautiful morning and evening rides—perfect to enjoy with friends and family.',
    tags: ['Sunrise / Morning', 'Sunset View']
  },
  {
    id: '4',
    name: 'Krishnaprakash Kovilakam',
    avatarColor: 'bg-[#ff9800]',
    avatarText: 'KK',
    rating: 5,
    date: 'a month ago',
    isLocalGuide: true,
    reviewsCount: 115,
    photos: ['/IMG_8476.webp', '/IMG_8477.webp'],
    text: 'Good service, affordable too. Really enjoyed the scenery. Perfect spot for group kayaking! Definitely would recommend a try.',
    tags: ['Sunset View']
  },
  {
    id: '5',
    name: 'Sujeesh S',
    avatarColor: 'bg-[#673ab7]',
    avatarText: 'S',
    rating: 5,
    date: 'a month ago',
    reviewsCount: 14,
    text: 'Great kayaking experience! It was very soothing and there was enough time to fully enjoy the ride. Perfect way to relax and unwind.',
    tags: ['Sunrise / Morning', 'Beginners']
  },
  {
    id: '6',
    name: 'Naja pari',
    avatarColor: 'bg-[#00796b]',
    avatarText: 'N',
    rating: 5,
    date: 'a month ago',
    reviewsCount: 76,
    text: 'One of the best escape spots. The kayaking and the route were mesmerising.',
    tags: ['Sunset View']
  }
];

const tagsList = ['All', 'Sunrise / Morning', 'Sunset View', 'Instructors', 'Beginners'];

const GoogleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export default function Reviews() {
  const [activeTag, setActiveTag] = useState('All');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [expandedTextId, setExpandedTextId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter reviews
  const filteredReviews = activeTag === 'All' 
    ? reviewsData 
    : reviewsData.filter(r => r.tags.includes(activeTag));

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.clientWidth / (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1);
      const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="reviews"
      className="w-full py-16 md:py-24 text-[#0d2b35] relative overflow-hidden"
      style={{ background: '#F4EBDB' }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#0d2b35]/10 pb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#A98C64] block mb-2">
              Google Customer Reviews
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-semibold text-[#0d2b35]">
              The Trust We've Earned
            </h2>
          </div>
          
          {/* Google overall score summary & write a review CTA */}
          <div className="flex flex-wrap items-center gap-6 bg-[#FCF9F2]/60 backdrop-blur-md border border-[#0d2b35]/5 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                <GoogleIcon />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold text-[#0d2b35]">4.9</span>
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" className="stroke-none" />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-medium hover:underline cursor-pointer flex items-center gap-1">
                  151 Google reviews <Info size={11} />
                </span>
              </div>
            </div>
            
            <a
              href="https://maps.app.goo.gl/ooykfEihpaaLdGJ66"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 bg-[#0D2B35] text-[#E8E3D8] hover:bg-[#A98C64] hover:text-[#0D2B35] transition-all duration-300 font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm font-sans"
            >
              Write a review <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
          {tagsList.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setActiveTag(tag);
                // Reset scroll position on filter change
                if (scrollContainerRef.current) {
                  scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                }
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                activeTag === tag
                  ? 'bg-[#0D2B35] text-[#E8E3D8] border-[#0D2B35]'
                  : 'bg-white/50 text-[#0d2b35] border-[#0d2b35]/10 hover:bg-white hover:border-[#0d2b35]/30'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Reviews Carousel Wrapper */}
        <div className="relative group">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white border border-[#0d2b35]/15 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#0d2b35] hover:text-white cursor-pointer"
            aria-label="Previous reviews"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Carousel viewport */}
          <div
            ref={scrollContainerRef}
            className="w-full overflow-x-auto flex gap-6 pb-6 no-scrollbar scroll-smooth snap-x snap-mandatory"
          >
            <AnimatePresence mode="popLayout">
              {filteredReviews.map((review) => {
                const isLong = review.text.length > 180;
                const isExpanded = expandedTextId === review.id;
                const displayText = isLong && !isExpanded 
                  ? `${review.text.substring(0, 160)}...` 
                  : review.text;

                return (
                  <motion.div
                    layout
                    key={review.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="w-[85vw] sm:w-[48vw] lg:w-[29.5vw] flex-shrink-0 snap-start bg-[#FCF9F2] border border-[#0d2b35]/5 p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[280px]"
                  >
                    <div>
                      {/* Review Card Header */}
                      <div className="flex items-center gap-3 mb-4">
                        {review.avatarUrl ? (
                          <img
                            src={review.avatarUrl}
                            alt={review.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner ${review.avatarColor || 'bg-[#0d2b35]'}`}>
                            {review.avatarText || review.name[0]}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-bold text-[#0d2b35] font-sans">
                              {review.name}
                            </h4>
                          </div>
                          <span className="text-[11px] text-gray-500 font-medium">
                            {review.isLocalGuide ? 'Local Guide · ' : ''}
                            {review.reviewsCount ? `${review.reviewsCount} reviews` : ''}
                          </span>
                        </div>
                      </div>

                      {/* Review Card Rating & Date */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex text-amber-500">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} size={13} fill="currentColor" className="stroke-none" />
                          ))}
                        </div>
                        <span className="text-[11px] text-gray-400 font-semibold">
                          {review.date}
                        </span>
                      </div>

                      {/* Review Card Text */}
                      <p className="text-[13.5px] leading-relaxed text-[#1a2e1c] font-sans whitespace-pre-wrap">
                        {displayText}
                        {isLong && (
                          <button
                            onClick={() => setExpandedTextId(isExpanded ? null : review.id)}
                            className="text-[#A98C64] hover:underline font-bold text-xs ml-1 focus:outline-none cursor-pointer"
                          >
                            {isExpanded ? 'Read less' : 'Read more'}
                          </button>
                        )}
                      </p>

                      {/* Attached review photos */}
                      {review.photos && review.photos.length > 0 && (
                        <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar">
                          {review.photos.map((photo, pIdx) => (
                            <div
                              key={pIdx}
                              onClick={() => setSelectedPhoto(photo)}
                              className="w-16 h-16 rounded-lg overflow-hidden border border-[#0d2b35]/5 hover:border-[#A98C64] hover:opacity-90 transition-all duration-200 cursor-zoom-in flex-shrink-0"
                            >
                              <img
                                src={photo}
                                alt={`Review upload ${pIdx}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Google G stamp footer */}
                    <div className="border-t border-[#0d2b35]/5 mt-4 pt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] text-gray-400 font-semibold font-sans">
                        <GoogleIcon />
                        <span>Posted on Google</span>
                      </div>
                      
                      <a 
                        href="https://maps.app.goo.gl/ooykfEihpaaLdGJ66" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] text-[#A98C64] hover:underline font-bold flex items-center gap-0.5"
                      >
                        Verify <ExternalLink size={8} />
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white border border-[#0d2b35]/15 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#0d2b35] hover:text-white cursor-pointer"
            aria-label="Next reviews"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Dynamic Pagination dots */}
        <div className="flex justify-center gap-2 mt-2">
          {filteredReviews.map((_, idx) => (
            <span
              key={idx}
              className="w-1.5 h-1.5 rounded-full bg-[#0d2b35]/20"
            />
          ))}
        </div>

      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-6 right-6 text-white hover:text-gray-300 focus:outline-none p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 cursor-pointer"
              aria-label="Close image"
            >
              <X size={24} />
            </button>
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={selectedPhoto}
              alt="Fullscreen review photo"
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

