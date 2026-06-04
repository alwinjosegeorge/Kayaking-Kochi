import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles, MapPin, Wind, CalendarRange } from 'lucide-react';

const HandDrawnLine = ({ className = "", style = {} }: { className?: string, style?: React.CSSProperties }) => (
  <svg 
    viewBox="0 0 1200 20" 
    className={`w-full h-4 ${className}`} 
    fill="none" 
    stroke="currentColor" 
    strokeLinecap="round"
    style={style}
  >
    {/* Main organic wavy ink stroke */}
    <path 
      d="M0,10 Q150,5 300,12 T600,6 T900,14 T1200,10" 
      strokeWidth="1.6"
      className="opacity-80"
    />
    {/* Secondary overlapping sketchy pencil line */}
    <path 
      d="M0,11 Q150,8 300,10 T600,12 T900,8 T1200,11" 
      strokeWidth="0.8"
      className="opacity-45"
    />
  </svg>
);

const expeditions = [
  {
    title: "Kadambrayar Escape",
    duration: "3 Days / 2 Nights",
    location: "Kadambrayar Countryside",
    temperature: "24°C to 32°C",
    image: "/mangrove_tour.webp",
    description: "Deep wilderness river kayaking through tranquil country canals. Winding past local villages, lush paddy fields, and historic coconut groves.",
    highlights: [
      "Camp under swaying coconut palms",
      "Paddle through narrow mangrove tunnels",
      "Led by expert local kayak guides",
      "Traditional Kerala-style meals included"
    ]
  },
  {
    title: "Island Drift Expedition",
    duration: "2 Days / 1 Night",
    location: "Kadamakkudy Islands Reserve",
    temperature: "25°C to 33°C",
    image: "/kadamakkudy_tour.webp",
    description: "Perfect introduction to wilderness island camping and kayaking. Ideal for families and adventurers who want to experience remote country islets without extreme challenges.",
    highlights: [
      "Stunning countryside vistas",
      "Hike through organic shrimp farms",
      "Led by expert local kayak guides",
      "Authentic Kerala seafood experiences"
    ]
  },
  {
    title: "Vembanad Backwater Odyssey",
    duration: "5 Days / 4 Nights",
    location: "Outer Vembanad Lake Coast",
    temperature: "22°C to 30°C",
    image: "/vembanad_tour.webp",
    description: "Our most remote backwaters voyage. We paddle deep into the largest lake in Kerala, discovering quiet fishing islets and traditional houseboat channels.",
    highlights: [
      "Explore quiet backwater channels",
      "Witness traditional toddy tapping",
      "Led by expert local kayak guides",
      "Traditional Kerala-style meals included"
    ]
  }
];

export default function MultiDayTours() {
  return (
    <section id="multiday-tours" className="relative py-28 bg-[#f9fbfb] overflow-hidden select-none text-[#07191d]">
      
      {/* Divider line separating previous sections */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-[#e2ecee]" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header matching the light editorial style */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-[10px] font-mono tracking-[0.4em] text-glacier-cyan uppercase mb-3 font-bold">
            DEEP WILDERNESS VOYAGES
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase text-[#07191d] tracking-tight leading-none mb-6 font-sans">
            Multi Day <br />
            Backwater Voyages
          </h2>
          <p className="text-xs font-mono tracking-widest text-[#2c4044] uppercase">
            Immersive multi-day paddling experiences across Kerala backwaters.
          </p>
        </div>

        {/* Expedition Cards Grid in CRISP WHITE theme matching the first screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {expeditions.map((exp, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: idx * 0.15 }}
              className="group rounded-3xl overflow-hidden bg-white/95 border border-[#e2ecee] hover:border-glacier-cyan/30 hover:shadow-[0_20px_50px_rgba(0,245,255,0.08)] flex flex-col justify-between h-full transition-all duration-500 hover:translate-y-[-8px] relative z-10 backdrop-blur-md"
            >
              <div>
                {/* Image panel */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                  <img
                    src={exp.image}
                    alt={exp.title}
                    width="340"
                    height="212"
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-106"
                    loading="lazy"
                  />
                  <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-full bg-[#07191d] text-[9px] font-mono tracking-widest text-white uppercase flex items-center gap-1.5 shadow-md">
                      <CalendarRange size={10} className="text-glacier-cyan" />
                      {exp.duration}
                    </span>
                  </div>
                </div>

                {/* Info Content */}
                <div className="p-6 text-left">
                  <h3 className="text-lg md:text-xl font-bold uppercase tracking-wide text-[#07191d] mb-3 group-hover:text-glacier-cyan transition-colors duration-300 leading-tight">
                    {exp.title}
                  </h3>
                  <p className="text-xs font-sans text-[#2c4044] leading-relaxed mb-6 font-light">
                    {exp.description}
                  </p>

                  {/* Telemetry specs table with light background matching the screenshot */}
                  <div className="p-4 rounded-2xl bg-[#f3f7f8] border border-[#e2ecee] space-y-2 mb-6 font-mono text-[9px] tracking-widest uppercase text-[#2c4044]">
                    <div className="flex justify-between border-b border-[#e2ecee] pb-1.5">
                      <span>Basecamp Location</span>
                      <span className="text-[#07191d] font-semibold flex items-center gap-1">
                        <MapPin size={10} className="text-glacier-cyan" />
                        {exp.location}
                      </span>
                    </div>
                    <div className="flex justify-between pt-0.5">
                      <span>Avg Temperature</span>
                      <span className="text-[#07191d] font-semibold flex items-center gap-1">
                        <Wind size={10} className="text-glacier-cyan" />
                        {exp.temperature}
                      </span>
                    </div>
                  </div>

                  {/* Highlights list */}
                  <h4 className="text-[10px] font-mono tracking-widest text-[#07191d] uppercase mb-4 flex items-center gap-2 border-b border-[#e2ecee] pb-2 font-bold">
                    <Sparkles size={12} className="text-glacier-cyan animate-pulse" />
                    Expedition Highlights
                  </h4>
                  <ul className="space-y-2.5">
                    {exp.highlights.map((highlight, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2.5 text-xs text-[#2c4044] font-sans font-light tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-glacier-cyan mt-1.5 shrink-0"></span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-6 pt-2">
                <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-glacier-cyan to-glacier-blue hover:brightness-105 text-[#07191d] font-semibold font-mono text-[10px] tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md">
                  <Compass size={12} className="animate-spin-slow" />
                  Discover Route
                </button>
              </div>

            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom dividing hand-drawn organic sketch line */}
      <HandDrawnLine className="absolute bottom-0 left-0 w-full text-[#082124]/30 z-20 pointer-events-none" />

    </section>
  );
}
