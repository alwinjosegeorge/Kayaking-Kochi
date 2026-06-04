import React, { useState, useEffect, useRef } from 'react';

// Custom outline icons to match luxury reference design exactly
const HomeIcon = ({ elevated }: { elevated: boolean }) => (
  <svg 
    viewBox="0 0 24 24" 
    width="21" 
    height="21" 
    stroke={elevated ? "#C8A86B" : "currentColor"} 
    strokeWidth="1.6" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const CalendarIcon = ({ elevated }: { elevated: boolean }) => {
  const color = elevated ? "#C8A86B" : "currentColor";
  return (
    <svg 
      viewBox="0 0 24 24" 
      width="23" 
      height="23" 
      stroke={color} 
      strokeWidth="1.8" 
      fill="none" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="4" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <circle cx="8" cy="13" r="1.1" fill={color} stroke="none" />
      <circle cx="12" cy="13" r="1.1" fill={color} stroke="none" />
      <circle cx="16" cy="13" r="1.1" fill={color} stroke="none" />
      <circle cx="8" cy="17" r="1.1" fill={color} stroke="none" />
      <circle cx="12" cy="17" r="1.1" fill={color} stroke="none" />
      <circle cx="16" cy="17" r="1.1" fill={color} stroke="none" />
    </svg>
  );
};

const WhatsAppIcon = ({ elevated }: { elevated: boolean }) => (
  <svg 
    viewBox="0 0 24 24" 
    width="21" 
    height="21" 
    stroke={elevated ? "#C8A86B" : "currentColor"} 
    strokeWidth="1.6" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    <path d="M15.2 13.9c-.2-.1-.7-.4-.8-.4-.1 0-.2-.1-.3 0l-.4.5c-.1.1-.2.1-.4 0-.2-.1-.8-.3-1.5-1-.5-.5-.9-1.1-1-1.2-.1-.2 0-.3.1-.4l.3-.4c.1-.1.1-.2.1-.3l-.4-.8c-.1-.2-.2-.2-.3-.2l-.3.1c-.2.2-.4.4-.4.8 0 .8.6 1.7 1.5 2.5 1 1 2.2 1.6 3.1 1.6.5 0 .9-.2 1.1-.5l.1-.3c-.1-.1-.2-.1-.3-.2z" fill={elevated ? "#C8A86B" : "currentColor"} stroke="none" />
  </svg>
);

const TABS = [
  { id: 'home' as const, label: 'Home', icon: HomeIcon, action: 'scroll-hero' },
  { id: 'book' as const, label: 'Book Now', icon: CalendarIcon, action: 'scroll-booking' },
  { id: 'whatsapp' as const, label: 'WhatsApp', icon: WhatsAppIcon, action: 'link-whatsapp' },
];

export default function MobileBottomNav() {
  const [width, setWidth] = useState(375);
  const [activeTab, setActiveTab] = useState<'home' | 'book' | 'whatsapp'>('home');
  const containerRef = useRef<HTMLDivElement>(null);
  const lastClickTime = useRef<number>(0);
  const [isVisible, setIsVisible] = useState(true);

  // Measure dynamic width to draw SVG curve seamlessly
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Update active state based on scroll height
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;

      // Hide navigation bar when close to the bottom (footer view)
      if (scrollY + windowHeight >= docHeight - 120) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      // Don't override user selection if they clicked recently
      if (Date.now() - lastClickTime.current < 2000) return;

      const bookingEl = document.getElementById('booking-section');
      if (bookingEl) {
        const rect = bookingEl.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.6) {
          setActiveTab('book');
        } else {
          setActiveTab('home');
        }
      } else {
        if (scrollY < 250) {
          setActiveTab('home');
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const lenisInstance = (window as any).lenis;
      if (lenisInstance && typeof lenisInstance.scrollTo === 'function') {
        lenisInstance.scrollTo(el, { duration: 1.8 });
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleTabClick = (tabId: 'home' | 'book' | 'whatsapp', action: string) => {
    lastClickTime.current = Date.now();
    setActiveTab(tabId);

    if (action === 'scroll-hero') {
      handleScrollTo('hero');
    } else if (action === 'scroll-booking') {
      handleScrollTo('booking-section');
    } else if (action === 'link-whatsapp') {
      const message = "Hello,\n\nI would like to reserve an adventure.\n\nThank you.";
      window.open(`https://wa.me/919072611622?text=${encodeURIComponent(message)}`, '_blank');
      // Slide back to the active page section after a delay
      setTimeout(() => {
        const bookingEl = document.getElementById('booking-section');
        if (bookingEl) {
          const rect = bookingEl.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.6) {
            setActiveTab('book');
            return;
          }
        }
        setActiveTab(window.scrollY < 250 ? 'home' : 'book');
      }, 2000);
    }
  };

  // Math for the sliding notch layout
  const activeCenter = width * (activeTab === 'home' ? 1/6 : activeTab === 'book' ? 1/2 : 5/6);
  const leftWidth = Math.max(0, activeCenter - 41);
  const rightWidth = Math.max(0, width - (activeCenter + 41));

  return (
    <div 
      className="fixed bottom-6 left-6 right-6 z-50 md:hidden pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(120px) scale(0.95)',
        opacity: isVisible ? 1 : 0,
      }}
    >
      <style>{`
        .pulse-fab {
          animation: fab-pulse 2.2s infinite ease-in-out;
        }
        
        @keyframes fab-pulse {
          0%, 100% {
            box-shadow: 0 5px 12px rgba(0, 0, 0, 0.35), inset 0 1.2px 2.4px rgba(255, 255, 255, 0.45);
            transform: scale(1) translateY(-16px);
          }
          50% {
            box-shadow: 0 8px 18px rgba(0, 0, 0, 0.45), inset 0 1.2px 2.4px rgba(255, 255, 255, 0.45);
            transform: scale(1.05) translateY(-16px);
          }
        }

        .pulse-fab:active {
          transform: scale(0.94) translateY(-16px) !important;
        }
      `}</style>

      {/* Floating Card Wrapper */}
      <div 
        ref={containerRef}
        className="w-full h-[66px] relative pointer-events-auto"
        style={{
          filter: 'drop-shadow(0 15px 30px rgba(0, 0, 0, 0.55))',
        }}
      >
        {/* Dynamic Sliding Background layout (GPU Accelerated Sliding Track) */}
        <div className="absolute inset-0 w-full h-full overflow-hidden rounded-[32px] pointer-events-none">
          <div 
            style={{
              width: `${2 * width + 82}px`,
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `translateX(${activeCenter - width - 41}px)`,
              transition: 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="pointer-events-none"
          >
            {/* Left Solid Bar */}
            <div 
              style={{ 
                position: 'absolute',
                left: 0,
                width: `${width + 1}px`, // 1px overlap on the right
                height: '100%',
                borderTop: '1.8px solid rgba(255, 255, 255, 0.08)',
              }}
              className="bg-[#091F27]/93 backdrop-blur-2xl"
            />

            {/* Notch SVG Block */}
            <div 
              style={{ 
                position: 'absolute',
                left: `${width}px`,
                width: '82px',
                height: '100%',
              }}
              className="overflow-visible flex-shrink-0"
            >
              {/* Backdrop filter inside exact shape of dip */}
              <div 
                style={{
                  clipPath: 'path("M 0 0 C 17 0, 19 42, 41 42 C 63 42, 65 0, 82 0 L 82 66 L 0 66 Z")',
                  background: 'rgba(9, 31, 39, 0.93)',
                  backdropFilter: 'blur(28px)',
                  WebkitBackdropFilter: 'blur(28px)',
                }}
                className="absolute inset-0 w-full h-full"
              />
              {/* Vector Top Glow Border */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 82 66" fill="none" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="notchGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08" />
                  </linearGradient>
                </defs>
                <path 
                  d="M 0 0 C 17 0, 19 42, 41 42 C 63 42, 65 0, 82 0" 
                  stroke="url(#notchGlowGrad)" 
                  strokeWidth="1.8" 
                />
              </svg>
            </div>

            {/* Right Solid Bar */}
            <div 
              style={{ 
                position: 'absolute',
                left: `${width + 81}px`, // 1px overlap on the left (starts at 81px instead of 82px)
                width: `${width}px`,
                height: '100%',
                borderTop: '1.8px solid rgba(255, 255, 255, 0.08)',
              }}
              className="bg-[#091F27]/93 backdrop-blur-2xl"
            />
          </div>
        </div>

        {/* Tab Actions Layer */}
        {TABS.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          const tabCenter = idx === 0 ? width * (1 / 6) : idx === 1 ? width * (1 / 2) : width * (5 / 6);
          
          return (
            <div 
              key={tab.id}
              style={{
                position: 'absolute',
                left: `${tabCenter}px`,
                transform: 'translateX(-50%)',
                width: '80px',
                height: '66px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              className="pointer-events-auto"
            >
              {/* Inactive Tab State (fades out and drops when active) */}
              <button
                onClick={() => handleTabClick(tab.id, tab.action)}
                className="flex flex-col items-center justify-center gap-1 bg-none border-none absolute"
                style={{
                  opacity: isActive ? 0 : 1,
                  transform: isActive ? 'translateY(12px) scale(0.7)' : 'translateY(0) scale(1)',
                  pointerEvents: isActive ? 'none' : 'auto',
                  color: 'rgba(255, 255, 255, 0.48)',
                  width: '64px',
                  transition: 'all 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <tab.icon elevated={false} />
                <span className="text-[8.5px] font-sans font-bold tracking-widest uppercase mt-1">
                  {tab.label}
                </span>
              </button>

              {/* Active Tab State (rises, scales up, and pulses when active) */}
              <button
                onClick={() => handleTabClick(tab.id, tab.action)}
                className={`pulse-fab w-[60px] h-[60px] rounded-full flex flex-col items-center justify-center border border-[#C8A86B]/30 absolute`}
                style={{
                  opacity: isActive ? 1 : 0,
                  pointerEvents: isActive ? 'auto' : 'none',
                  background: 'linear-gradient(135deg, #FFFDF8 0%, #E8E3D8 100%)',
                  transition: 'all 0.38s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease-in-out',
                }}
              >
                <tab.icon elevated={true} />
                <span 
                  className="text-[7.5px] font-extrabold tracking-wider leading-none uppercase mt-1"
                  style={{ color: '#C8A86B' }}
                >
                  {tab.label}
                </span>
              </button>
            </div>
          );
        })}

      </div>
    </div>
  );
}
