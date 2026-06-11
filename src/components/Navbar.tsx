import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, PhoneCall } from 'lucide-react';

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"></path>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon>
  </svg>
);

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" stroke="none" {...props}>
    <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.414 0-6.19-2.776-6.19-6.19 0-3.414 2.776-6.19 6.19-6.19 1.543 0 2.95.57 4.032 1.503l3.057-3.057C19.263 2.058 15.932 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 11.24-4.542 11.24-11.24 0-.765-.082-1.503-.223-1.955H12.24z"></path>
  </svg>
);

interface NavbarProps {
  currentPath?: string;
}

export default function Navbar({ currentPath = '/' }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [activeSection, setActiveSection] = useState('Home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = currentPath === '/';

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Tours', href: '#popular-tours' },
    { name: 'Fishing', href: '#fishing-section' },
    { name: 'About', href: '#expeditions' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Book', href: '#booking-section' }
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      if (!isHome) {
        setMobileMenuOpen(false);
        window.location.href = '/' + href;
        return;
      }
      e.preventDefault();
      
      const wasMobileMenuOpen = mobileMenuOpen;
      setMobileMenuOpen(false);
      
      const targetId = href.substring(1);
      const el = document.getElementById(targetId || 'hero');
      if (el) {
        const scrollToTarget = () => {
          const lenisInstance = (window as any).lenis;
          if (lenisInstance && typeof lenisInstance.scrollTo === 'function') {
            lenisInstance.scrollTo(el, { duration: 0.9 });
          } else {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        };

        if (wasMobileMenuOpen) {
          setTimeout(scrollToTarget, 300);
        } else {
          scrollToTarget();
        }
      }
    } else if (href.startsWith('/')) {
      setMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      // Don't hide the navbar if the mobile menu is active
      if (mobileMenuOpen) return;

      const currentScrollY = window.scrollY;

      // Capsule styling trigger
      const shouldScroll = currentScrollY > 50;
      setScrolled(prev => (prev !== shouldScroll ? shouldScroll : prev));

      const lastY = lastScrollY.current;

      // Hide on scroll down, show on scroll up
      if (currentScrollY <= 50) {
        setVisible(prev => (prev !== true ? true : prev));
      } else if (window.innerWidth < 1024) {
        // On mobile, once scrolled past 50px, keep it hidden completely until scrolled back to top
        setVisible(prev => (prev !== false ? false : prev));
      } else if (currentScrollY > lastY) {
        setVisible(prev => (prev !== false ? false : prev));
      } else {
        setVisible(prev => (prev !== true ? true : prev));
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -50% 0px',
      threshold: 0
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id === 'popular-tours') setActiveSection('Tours');
          else if (id === 'fishing-section') setActiveSection('Fishing');
          else if (id === 'expeditions') setActiveSection('About');
          else if (id === 'gallery') setActiveSection('Gallery');
          else if (id === 'reviews') setActiveSection('Reviews');
          else if (id === 'booking-section') setActiveSection('Book');
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    const sections = ['popular-tours', 'fishing-section', 'expeditions', 'gallery', 'reviews', 'booking-section'];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (currentPath.startsWith('/faq')) {
      setActiveSection('FAQ');
    } else if (currentPath === '/') {
      setActiveSection('Home');
    }
  }, [currentPath]);

  // Determine theme mode (dark vs light sand)
  const isDarkTheme = isHome;

  // Define dynamic container style and classes
  let navStyle: React.CSSProperties = {};
  let navClass = '';
  
  if (isHome) {
    if (scrolled) {
      navStyle = {
        backgroundColor: 'rgba(9, 31, 39, 0.75)',
      };
      navClass = 'w-full px-5 sm:px-10 py-3.5 mt-0 rounded-none border-b border-cream/10 backdrop-blur-2xl bg-nav-grain';
    } else {
      navStyle = {};
      navClass = 'w-full max-w-7xl px-5 sm:px-10 py-4 sm:py-6 mt-0 rounded-none border-transparent bg-transparent backdrop-blur-none';
    }
  } else {
    // Other pages: always full-width sand
    navStyle = {
      backgroundColor: '#F4EBDB',
    };
    navClass = 'w-full px-5 sm:px-10 py-4 mt-0 rounded-none border-b border-[#091F27]/12 bg-nav-grain';
  }

  return (
    <div className="fixed top-0 left-0 w-full z-50 flex justify-center pointer-events-none select-none">
      <nav
        style={navStyle}
        className={`flex flex-col justify-between items-center pointer-events-auto relative transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        } ${navClass}`}
      >
        <div className="w-full flex items-center justify-between">
          
          {/* Logo Brand Emblem */}
          <a href="#" onClick={(e) => handleLinkClick(e, '#')} className="flex items-center gap-3 group shrink-0">
            <motion.img 
              layoutId="logo-transition"
              src="/logo.webp" 
              alt="Hooked & Cooked Logo" 
              width="48"
              height="48"
              className={`object-contain transition-all duration-300 shrink-0 ${
                isHome && scrolled ? 'w-10 h-10' : 'w-11 h-11 sm:w-12 sm:h-12'
              }`}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            />
            <div className="flex flex-col items-start leading-none text-left">
              <span className={`text-[11px] font-black tracking-widest uppercase transition-colors duration-300 ${
                isDarkTheme 
                  ? 'text-cream group-hover:text-glacier-cyan' 
                  : 'text-[#091F27] group-hover:text-[#0D2B35]'
              }`}>
                HOOKED & COOKED
              </span>
              <span className={`text-[7px] font-mono tracking-[0.25em] uppercase mt-0.5 ${
                isDarkTheme ? 'text-glacier-cyan/55' : 'text-[#091F27]/60'
              }`}>
                H & C BOAT CLUB
              </span>
            </div>
          </a>

          {/* Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center space-x-10 relative">
            {navLinks.map((link, idx) => {
              const isActive = activeSection === link.name;
              return (
                <a
                  key={idx}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className={`relative py-1 text-[11px] font-sans font-bold tracking-wider uppercase transition-colors duration-300 flex flex-col items-center group/item ${
                    isActive 
                      ? (isDarkTheme ? 'text-cream font-black' : 'text-[#091F27]') 
                      : (isDarkTheme ? 'text-gray-400 hover:text-cream' : 'text-[#091F27]/60 hover:text-[#091F27]')
                  }`}
                >
                  <span>{link.name}</span>
                  
                  {/* Subtle active underline sliding below */}
                  {isActive && (
                    <motion.span
                      layoutId="active-underline"
                      className={`absolute bottom-0 left-0 w-full h-[1.5px] ${
                        isDarkTheme ? 'bg-glacier-cyan shadow-[0_1px_5px_rgba(0,245,255,0.4)]' : 'bg-[#091F27]'
                      }`}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}

                  {/* Elegant magnet underline hover effect */}
                  {!isActive && (
                    <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] transition-all duration-300 group-hover/item:w-1/2 ${
                      isDarkTheme ? 'bg-cream/40' : 'bg-[#091F27]/30'
                    }`} />
                  )}
                </a>
              );
            })}
          </div>

          {/* Call CTA & Social Links (Desktop) */}
          <div className="hidden lg:flex items-center space-x-5 shrink-0">
            <div className={`flex items-center space-x-2 border-r pr-4 ${
              isDarkTheme ? 'border-cream/10' : 'border-[#091F27]/12'
            }`}>
              <a 
                href="https://www.youtube.com/@HookedandCooked-l1l" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="Visit our YouTube channel"
                className={`transition-colors duration-300 p-1.5 rounded-full ${
                  isDarkTheme 
                    ? 'text-gray-400 hover:text-glacier-cyan hover:bg-cream/5' 
                    : 'text-[#091F27] hover:text-[#0D2B35] hover:bg-[#091F27]/5'
                }`}
              >
                <YoutubeIcon />
              </a>

            </div>

            {isDarkTheme ? (
              <a
                href="#booking-section"
                onClick={(e) => handleLinkClick(e, '#booking-section')}
                className="relative px-6 py-2.5 rounded-full text-[9px] font-mono tracking-[0.25em] uppercase text-cream overflow-hidden group transition-all duration-300 border border-cream/20 hover:border-glacier-cyan hover:shadow-[0_0_15px_rgba(0,245,255,0.2)]"
              >
                <div className="absolute inset-0 bg-glacier-cyan translate-y-full group-hover:translate-y-0 transition-transform duration-300 -z-10" />
                <span className="relative z-10 flex items-center gap-1.5 group-hover:text-[#091F27] transition-colors duration-300 font-bold">
                  <PhoneCall size={10} />
                  Book a Paddle
                </span>
              </a>
            ) : (
              <a
                href="tel:+919072611622"
                className="px-5 py-2 rounded-full text-[10px] font-sans font-bold tracking-wider uppercase text-[#091F27] border border-[#091F27] hover:bg-[#091F27] hover:text-[#FAF9F6] transition-all duration-300 bg-transparent shrink-0"
              >
                Call us
              </a>
            )}
          </div>

          {/* Hamburger (Mobile Toggle) */}
          <div className="flex items-center lg:hidden pr-1">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className={`focus:outline-none transition-colors duration-300 p-2 rounded-full ${
                isDarkTheme 
                  ? 'text-gray-400 hover:text-cream hover:bg-cream/5' 
                  : 'text-[#091F27] hover:text-[#0D2B35] hover:bg-[#091F27]/5'
              }`}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Dynamic Expanding Mobile Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{
                backgroundImage: "url('/bg-grain.webp')",
                backgroundColor: '#091F27',
                backgroundRepeat: 'repeat',
              }}
              className="w-full overflow-hidden flex flex-col pt-4 pb-2 space-y-2 border-t mt-3 lg:hidden rounded-2xl p-4 shadow-xl border-cream/10"
            >
              {navLinks.map((link, idx) => {
                const isActive = activeSection === link.name;
                return (
                  <a
                    key={idx}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className={`px-5 py-3 rounded-2xl text-[10px] font-mono tracking-[0.25em] uppercase transition-all flex items-center justify-between ${
                      isActive 
                        ? 'bg-glacier-cyan text-[#091F27] font-bold shadow-md' 
                        : 'text-gray-400 hover:bg-cream/5 hover:text-cream'
                    }`}
                  >
                    <span>{link.name}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#091F27]" />
                    )}
                  </a>
                );
              })}

              <div className="h-[1px] w-full my-2 bg-cream/10" />

              <div className="flex justify-between items-center px-4 py-2">
                <div className="flex space-x-3">
                  <a 
                    href="https://www.youtube.com/@HookedandCooked-l1l" 
                    target="_blank" 
                    rel="noreferrer" 
                    aria-label="Visit our YouTube channel"
                    className="p-1.5 rounded-full text-gray-400 hover:text-glacier-cyan hover:bg-cream/5"
                  >
                    <YoutubeIcon />
                  </a>

                </div>
                {isDarkTheme ? (
                  <a
                    href="#booking-section"
                    onClick={(e) => handleLinkClick(e, '#booking-section')}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-cream/10 hover:bg-glacier-cyan hover:text-[#091F27] text-[9px] font-mono tracking-[0.2em] text-cream uppercase hover:scale-103 transition-all font-bold border border-cream/10"
                  >
                    <PhoneCall size={10} />
                    Book a Paddle
                  </a>
                ) : (
                  <a
                    href="tel:+919072611622"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-cream/20 hover:border-glacier-cyan hover:text-[#091F27] text-[9px] font-mono tracking-[0.2em] text-cream uppercase hover:bg-glacier-cyan transition-all font-bold"
                  >
                    <PhoneCall size={10} />
                    Call us
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}
