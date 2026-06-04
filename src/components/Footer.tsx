import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"></path>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon>
  </svg>
);

export default function Footer() {
  return (
    <footer className="relative text-[#E8E3D8] overflow-hidden select-none" style={{ backgroundColor: '#0D2B35' }}>

      {/* 1. TOP Silhouette Banner */}
      <div className="relative w-full h-[220px] md:h-[280px] overflow-hidden">
        <div className="absolute inset-0 bg-[#F4EBDB] z-0" />
        <img
          src="/footer_banner.png"
          alt="Kadambrayar Kayaking silhouette banner"
          className="absolute inset-0 w-full h-full object-cover z-10"
        />
      </div>

      {/* 2. MAIN FOOTER — Premium 4-Column Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-16 pb-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">
          
          {/* COL 1: Brand */}
          <div className="lg:col-span-1 space-y-5">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Hooked & Cooked Logo" 
                className="w-14 h-14 object-contain shrink-0" 
              />
              <div className="flex flex-col leading-none">
                <h3 className="text-lg font-black tracking-[0.2em] text-white uppercase leading-none">
                  HOOKED & COOKED
                </h3>
                <span className="text-[8px] font-mono tracking-[0.3em] text-[#C8A86B] uppercase mt-1">
                  H & C BOAT CLUB
                </span>
              </div>
            </div>
            
            <p className="text-[13px] text-[#8a9fa3] leading-relaxed font-light">
              River experiences through the hidden backwaters of Kochi.
            </p>
            
            <p className="text-[11px] text-[#5a7074] italic font-serif leading-relaxed">
              Slow paddles. Quiet waters. Meaningful journeys.
            </p>
          </div>

          {/* COL 2: Quick Links */}
          <div className="lg:col-span-1 space-y-5">
            <h4 className="text-[10px] font-mono text-[#C8A86B] uppercase tracking-[0.25em] font-bold">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Home', href: '/' },
                { name: 'Our Tours', href: '/#popular-tours' },
                { name: 'Gallery', href: '/#gallery' },
                { name: 'Book a Paddle', href: '/#booking-section' },
                { name: 'Reviews', href: '/#reviews' },
              ].map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-[13px] text-[#8a9fa3] hover:text-white hover:pl-1 transition-all duration-300 font-light"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 3: Contact */}
          <div className="lg:col-span-1 space-y-5">
            <h4 className="text-[10px] font-mono text-[#C8A86B] uppercase tracking-[0.25em] font-bold">
              Contact
            </h4>
            <ul className="space-y-4 text-[13px] text-[#8a9fa3]">
              <li className="flex items-start gap-3">
                <MapPin size={15} className="text-[#C8A86B]/70 shrink-0 mt-0.5" />
                <span className="font-light leading-relaxed">Kadambrayar, Kochi,<br/>Kerala, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={14} className="text-[#C8A86B]/70 shrink-0" />
                <a href="tel:+919072611622" className="hover:text-white transition-colors font-light tracking-wide">+91 90726 11622</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={14} className="text-[#C8A86B]/70 shrink-0" />
                <a href="mailto:hookedandcooked.riverdian@gmail.com" className="hover:text-white transition-colors font-light text-[12px] break-all">
                  hookedandcooked.riverdian@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* COL 4: Connect */}
          <div className="lg:col-span-1 space-y-5">
            <h4 className="text-[10px] font-mono text-[#C8A86B] uppercase tracking-[0.25em] font-bold">
              Connect
            </h4>
            <div className="flex flex-col space-y-3">
              <a href="https://www.instagram.com/kayakingkadambrayar" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[#8a9fa3] hover:text-white transition-all duration-300 group">
                <span className="w-9 h-9 rounded-lg border border-[#1a3a45] group-hover:border-[#C8A86B]/40 flex items-center justify-center transition-all duration-300">
                  <InstagramIcon />
                </span>
                <span className="text-[13px] font-light">Instagram</span>
              </a>
              <a href="https://www.facebook.com/share/18Wc6VxtKn/" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[#8a9fa3] hover:text-white transition-all duration-300 group">
                <span className="w-9 h-9 rounded-lg border border-[#1a3a45] group-hover:border-[#C8A86B]/40 flex items-center justify-center transition-all duration-300">
                  <FacebookIcon />
                </span>
                <span className="text-[13px] font-light">Facebook</span>
              </a>
              <a href="https://www.youtube.com/@HookedandCooked-l1l" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[#8a9fa3] hover:text-white transition-all duration-300 group">
                <span className="w-9 h-9 rounded-lg border border-[#1a3a45] group-hover:border-[#C8A86B]/40 flex items-center justify-center transition-all duration-300">
                  <YoutubeIcon />
                </span>
                <span className="text-[13px] font-light">YouTube</span>
              </a>
            </div>
          </div>

        </div>

        {/* 3. BOTTOM BAR */}
        <div className="mt-14 pt-6 border-t border-[#122d38] flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[10px] font-mono tracking-[0.15em] text-[#4a6570] uppercase">
            © 2026 H & C Boat Club. All Rights Reserved
          </span>
          <div className="flex flex-wrap items-center gap-5 text-[10px] font-mono tracking-[0.15em] text-[#4a6570] uppercase">
            <a href="#privacy" className="hover:text-[#8a9fa3] transition-colors">Privacy Policy</a>
            <span className="text-[#1a3a45]">•</span>
            <a href="#terms" className="hover:text-[#8a9fa3] transition-colors">Terms & Conditions</a>
            <span className="text-[#1a3a45]">•</span>
            <span>
              Designed & Developed by{" "}
              <a 
                href="https://codexorastudio.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#C8A86B]/60 hover:text-[#C8A86B] transition-all duration-300 font-bold uppercase"
              >
                Codexora Studio
              </a>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
