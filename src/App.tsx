import { useState, useEffect } from 'react';
import Lenis from 'lenis';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PopularTours from './components/PopularTours';
import Intro from './components/Intro';
import VideoSection from './components/VideoSection';
import BookingSection from './components/BookingSection';
import GallerySection from './components/GallerySection';
import PaddleTogether from './components/PaddleTogether';
import Reviews from './components/Reviews';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import ControlHub from './components/ControlHub';
import BoardingPass from './components/BoardingPass';
import type { Booking, ClosedSlot } from './types';
import { generateSecurityToken } from './utils/security';


// Helper to format today's date in YYYY-MM-DD format based on local time
const getTodayDateStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Generates 25 realistic historical bookings to populate revenue charts (₹3,42,000 range)
const generateMockBookings = (): Booking[] => {
  const mock: any[] = [];
  const routes = ['kadambrayar', 'vembanad', 'kadamakudy'];
  const slots = ['6:00 AM', '8:00 AM', '10:00 AM', '1:00 PM', '3:00 PM', '5:00 PM'];
  const sources = ['Online', 'WhatsApp', 'Phone Call', 'Walk-in'] as const;
  const names = [
    'Alwin Jose', 'Priya Menon', 'Rahul Sharma', 'Anjali Thomas', 'Fathima Rinshad',
    'John McCormick', 'Sandra Pugh', 'Vernie Hart', 'Mark Clark', 'Rebekah Foster',
    'Brooklyn Zoe', 'Jinto George', 'Sneha Varghese', 'Abhishek Nair', 'Dileep Kumar'
  ];

  let totalRevenue = 0;
  let counter = 1;

  // Generate 20 past bookings in April and May
  for (let i = 0; i < 20; i++) {
    const isMay = i % 2 === 0;
    const day = (i * 3 + 1) % 28 + 1;
    const dateStr = `2026-0${isMay ? '5' : '4'}-${String(day).padStart(2, '0')}`;
    const route = routes[i % 3];
    const slot = slots[i % 6];
    const source = sources[i % 4];
    const name = names[i % names.length];
    const guests = (i % 3) + 1; // 1, 2, or 3 guests
    const kayakType = i % 2 === 0 ? 'single' : 'double';
    const amount = kayakType === 'single' ? guests * 450 : Math.ceil(guests / 2) * 900;

    mock.push({
      id: `HC-2026-${String(counter++).padStart(4, '0')}`,
      date: dateStr,
      route,
      slot,
      kayakType,
      guests,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      phone: `+91 ${90000 + i * 350} ${10000 + i * 78}`,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      source,
      amount,
      createdAt: new Date(dateStr).toISOString()
    });
    totalRevenue += amount;
  }

  // Generate 5 active bookings for early June 2026
  for (let i = 1; i <= 5; i++) {
    const dateStr = `2026-06-0${i}`;
    const route = routes[i % 3];
    const slot = slots[i % 6];
    const name = names[(i + 4) % names.length];
    const guests = 2;
    const kayakType = 'single';
    const amount = 900;

    mock.push({
      id: `HC-2026-${String(counter++).padStart(4, '0')}`,
      date: dateStr,
      route,
      slot,
      kayakType,
      guests,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      phone: `+91 94470 1230${i}`,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      source: 'Online',
      amount,
      createdAt: new Date(dateStr).toISOString()
    });
    totalRevenue += amount;
  }

  // Add 4 bookings specifically for TODAY (June 4, 2026) to test the operations board
  const todayStr = getTodayDateStr();
  
  // 8:00 AM Run
  mock.push({
    id: `HC-2026-${String(counter++).padStart(4, '0')}`,
    date: todayStr,
    route: 'kadambrayar',
    slot: '8:00 AM',
    kayakType: 'double',
    guests: 6,
    name: 'Jinto George',
    email: 'jinto.george@example.com',
    phone: '+91 90812 34567',
    status: 'Confirmed',
    paymentStatus: 'Paid',
    source: 'WhatsApp',
    amount: 2700,
    createdAt: new Date().toISOString()
  });

  // 10:00 AM Run
  mock.push({
    id: `HC-2026-${String(counter++).padStart(4, '0')}`,
    date: todayStr,
    route: 'vembanad',
    slot: '10:00 AM',
    kayakType: 'single',
    guests: 8,
    name: 'Sneha Varghese',
    email: 'snehav@example.com',
    phone: '+91 94950 98765',
    status: 'Confirmed',
    paymentStatus: 'Paid',
    source: 'Phone Call',
    amount: 3600,
    createdAt: new Date().toISOString()
  });

  // 1:00 PM Run
  mock.push({
    id: `HC-2026-${String(counter++).padStart(4, '0')}`,
    date: todayStr,
    route: 'kadamakudy',
    slot: '1:00 PM',
    kayakType: 'single',
    guests: 4,
    name: 'Abhishek Nair',
    email: 'abhishek.n@example.com',
    phone: '+91 98950 11223',
    status: 'Confirmed',
    paymentStatus: 'Paid',
    source: 'Online',
    amount: 1800,
    createdAt: new Date().toISOString()
  });

  // 5:00 PM Run - Checked In
  mock.push({
    id: `HC-2026-${String(counter++).padStart(4, '0')}`,
    date: todayStr,
    route: 'kadambrayar',
    slot: '5:00 PM',
    kayakType: 'single',
    guests: 12,
    name: 'Dileep Kumar',
    email: 'dileep.k@example.com',
    phone: '+91 94460 55443',
    status: 'Checked In',
    paymentStatus: 'Paid',
    source: 'Walk-in',
    amount: 5400,
    createdAt: new Date().toISOString(),
    checkInTime: '05:08 PM',
    checkInDate: '04 Jun 2026'
  });

  // Finally, scale up some totals to make revenue cards look realistic (₹3,42,000 target total)
  // We'll append 2-3 massive group bookings or bulk entries from WhatsApp in the past
  mock.push({
    id: `HC-2026-0000`,
    date: '2026-05-10',
    route: 'vembanad',
    slot: '8:00 AM',
    kayakType: 'double',
    guests: 200,
    name: 'Corporate Outing - E&Y',
    email: 'ey.outings@example.com',
    phone: '+91 80210 11002',
    status: 'Confirmed',
    paymentStatus: 'Paid',
    source: 'Phone Call',
    amount: 90000,
    createdAt: new Date('2026-05-10').toISOString()
  });

  mock.push({
    id: `HC-2026-0000-B`,
    date: '2026-05-24',
    route: 'kadambrayar',
    slot: '10:00 AM',
    kayakType: 'single',
    guests: 260,
    name: 'St. Alberts College Camp',
    email: 'alberts.camp@example.com',
    phone: '+91 90223 88776',
    status: 'Confirmed',
    paymentStatus: 'Paid',
    source: 'WhatsApp',
    amount: 117000,
    createdAt: new Date('2026-05-24').toISOString()
  });

  return mock.map(b => ({
    ...b,
    securityToken: generateSecurityToken(b.id, b.name, b.route, b.slot, b.date, b.guests)
  })).sort((a, b) => a.id.localeCompare(b.id));
};

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dynamic Global State hooks
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [closedSlots, setClosedSlots] = useState<ClosedSlot[]>([]);
  
  // Custom WhatsApp Simulator state for Sandbox Notifications
  const [whatsAppNotification, setWhatsAppNotification] = useState<{
    open: boolean;
    name: string;
    message: string;
    phone?: string;
    qrUrl?: string;
  } | null>(null);

  // Initialize and Sync states
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [bookingsRes, blockedRes, closedRes] = await Promise.all([
          fetch('/api/bookings'),
          fetch('/api/blocked-dates'),
          fetch('/api/closed-slots')
        ]);

        if (bookingsRes.ok) {
          const data = await bookingsRes.json();
          setBookings(data);
        }
        if (blockedRes.ok) {
          const data = await blockedRes.json();
          setBlockedDates(data);
        }
        if (closedRes.ok) {
          const data = await closedRes.json();
          setClosedSlots(data);
        }
      } catch (err) {
        console.error('Error loading data from database API: ', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();

    // 2. SPA location listener
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    
    window.addEventListener('popstate', handleLocationChange);

    // Intercept clicks on links with relative paths
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.getAttribute('href')?.startsWith('/')) {
        e.preventDefault();
        const url = anchor.getAttribute('href')!;
        window.history.pushState({}, '', url);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    };
    document.addEventListener('click', handleLinkClick);

    // 3. Lenis Kinetic Smooth Scrolling
    const lenis = new Lenis({
      duration: 2.2,
      easing: (t) => 1 - Math.pow(1 - t, 5),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 2.0,
    });
    (window as any).lenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      delete (window as any).lenis;
      window.removeEventListener('popstate', handleLocationChange);
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  // State manipulation methods
  const addBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'securityToken'>) => {
    const year = new Date(bookingData.date).getFullYear() || 2026;
    
    // Auto-generate ID: HC-YYYY-XXXX (counter is based on total existing bookings for that year)
    const yearBookings = bookings.filter(b => b.id.startsWith(`HC-${year}-`));
    
    // Find highest index number
    let highestIdx = 0;
    yearBookings.forEach(b => {
      const parts = b.id.split('-');
      if (parts.length >= 3) {
        const num = parseInt(parts[2], 10);
        if (!isNaN(num) && num > highestIdx) {
          highestIdx = num;
        }
      }
    });

    const newId = `HC-${year}-${String(highestIdx + 1).padStart(4, '0')}`;
    const securityToken = generateSecurityToken(
      newId,
      bookingData.name,
      bookingData.route,
      bookingData.slot,
      bookingData.date,
      bookingData.guests
    );
    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      createdAt: new Date().toISOString(),
      securityToken
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBooking),
      });

      if (res.ok) {
        const saved = await res.json();
        setBookings(prev => [...prev, saved].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      }
    } catch (err) {
      console.error('Error adding booking to database: ', err);
    }

    // Trigger on-screen WhatsApp alert popup simulation
    const routeNames: Record<string, string> = {
      kadambrayar: 'Kadambrayar River Expedition',
      vembanad: 'Vembanad Backwater Odyssey',
      kadamakudy: 'Kadamakudy Village Explorer'
    };
    
    // Standard WhatsApp format
    const formattedDate = new Date(newBooking.date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const qrPayload = JSON.stringify({
      bookingId: newBooking.id,
      token: newBooking.securityToken,
      guests: newBooking.guests
    });

    const boardingUrl = `https://visitkadambrayar.com/boarding-pass?id=${newBooking.id}&token=${newBooking.securityToken}&name=${encodeURIComponent(newBooking.name)}&route=${newBooking.route}&slot=${encodeURIComponent(newBooking.slot)}&date=${newBooking.date}&guests=${newBooking.guests}&kayak=${newBooking.kayakType}&amount=${newBooking.amount}`;

    const message = `Hi ${newBooking.name} 👋\n\nYour kayaking adventure has been confirmed.\n\nBooking ID:\n${newBooking.id}\n\nRoute:\n${routeNames[newBooking.route] || newBooking.route}\n\nDate:\n${formattedDate}\n\nTime:\n${newBooking.slot}\n\nGuests:\n${newBooking.guests}\n\nPlease show the QR code at check-in.\n\nOpen Boarding Pass & QR Ticket Link:\n${boardingUrl}\n\nSee you on the water! 🚣`;

    // Do not show the WhatsApp sandbox alert popup on booking creation
    QRCode.toDataURL(qrPayload, { margin: 1, width: 200 })
      .catch(err => console.error('Error generating QR in App.tsx: ', err));

    return newBooking;
  };

  const updateBooking = async (updatedBooking: Booking) => {
    try {
      const res = await fetch(`/api/bookings/${updatedBooking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: updatedBooking.status,
          paymentStatus: updatedBooking.paymentStatus,
          checkInTime: updatedBooking.checkInTime,
          checkInDate: updatedBooking.checkInDate,
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        setBookings(prev => prev.map(b => b.id === saved.id ? saved : b));
      }
    } catch (err) {
      console.error('Error updating booking: ', err);
    }

    // Trigger WhatsApp notification for check-in confirmation
    if (updatedBooking.status === 'Checked In') {
      const message = `Welcome aboard, ${updatedBooking.name}! 🚣\n\nYour check-in has been completed successfully.\n\nWe hope you enjoy your kayaking experience!`;
      setWhatsAppNotification({
        open: true,
        name: updatedBooking.name,
        message,
        phone: updatedBooking.phone
      });
    }
  };

  const blockDate = async (date: string) => {
    if (!blockedDates.includes(date)) {
      try {
        const res = await fetch('/api/blocked-dates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ date }),
        });
        if (res.ok) {
          setBlockedDates(prev => [...prev, date]);
        }
      } catch (err) {
        console.error('Error blocking date: ', err);
      }
    }
  };

  const unblockDate = async (date: string) => {
    try {
      const res = await fetch(`/api/blocked-dates/${date}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setBlockedDates(prev => prev.filter(d => d !== date));
      }
    } catch (err) {
      console.error('Error unblocking date: ', err);
    }
  };

  const closeSlot = async (date: string, slot: string) => {
    const exists = closedSlots.some(cs => cs.date === date && cs.slot === slot);
    if (!exists) {
      try {
        const res = await fetch('/api/closed-slots', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ date, slot }),
        });
        if (res.ok) {
          setClosedSlots(prev => [...prev, { date, slot }]);
        }
      } catch (err) {
        console.error('Error closing slot: ', err);
      }
    }
  };

  const reopenSlot = async (date: string, slot: string) => {
    try {
      const res = await fetch(`/api/closed-slots?date=${date}&slot=${encodeURIComponent(slot)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setClosedSlots(prev => prev.filter(cs => !(cs.date === date && cs.slot === slot)));
      }
    } catch (err) {
      console.error('Error reopening slot: ', err);
    }
  };

  const confirmCheckIn = (bookingId: string, token?: string, isAdminOverride: boolean = false) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking Not Found' };
    
    if (!isAdminOverride) {
      if (!token || booking.securityToken !== token) {
        return { success: false, message: 'Security Mismatch - Invalid or missing ticket token signature!' };
      }
    } else {
      if (token && booking.securityToken !== token) {
        return { success: false, message: 'Security Mismatch - Invalid ticket token signature!' };
      }
    }
    
    if (booking.status === 'Checked In') {
      return { 
        success: false, 
        message: 'Already Checked In', 
        time: booking.checkInTime, 
        date: booking.checkInDate 
      };
    }

    const d = new Date();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const checkInTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

    const day = d.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const checkInDate = `${day} ${month} ${year}`;

    const updatedBooking: Booking = {
      ...booking,
      status: 'Checked In',
      checkInTime,
      checkInDate
    };

    updateBooking(updatedBooking);

    return { 
      success: true, 
      message: 'Booking Found', 
      booking: updatedBooking 
    };
  };

  const openWhatsAppLink = (phone: string, text: string) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const isControlHub = currentPath.startsWith('/control-hub');
  const isBoardingPass = currentPath.startsWith('/boarding-pass');

  return (
    <div className="bg-abyss-black text-white min-h-screen relative font-sans antialiased selection:bg-glacier-cyan selection:text-abyss-black">
      
      {/* ──── DYNAMIC TICKET LOGO LOADING SCREEN OVERLAY ──── */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center font-sans selection:bg-glacier-cyan selection:text-black overflow-hidden pointer-events-auto"
          >
            {/* Ambient scanning lines overlay */}
            <div className="absolute inset-0 pointer-events-none z-40 bg-[linear-gradient(rgba(18,30,32,0)_98%,rgba(0,245,255,0.01)_98%)] bg-[size:100%_24px]" />
            
            <motion.img
              layoutId="logo-transition"
              src="/logo.png"
              alt="Hooked & Cooked Logo"
              className="w-24 h-24 object-contain relative z-10"
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Immersive subtle static grid scanning lines overlay */}
      <div className="fixed inset-0 pointer-events-none z-40 bg-[linear-gradient(rgba(18,30,32,0)_98%,rgba(0,245,255,0.01)_98%)] bg-[size:100%_24px]" />
      
      {isControlHub ? (
        <ControlHub 
          bookings={bookings}
          blockedDates={blockedDates}
          closedSlots={closedSlots}
          onAddBooking={addBooking}
          onUpdateBooking={updateBooking}
          onBlockDate={blockDate}
          onUnblockDate={unblockDate}
          onCloseSlot={closeSlot}
          onReopenSlot={reopenSlot}
          onConfirmCheckIn={confirmCheckIn}
          onNavigate={(path) => {
            window.history.pushState({}, '', path);
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}
        />
      ) : isBoardingPass ? (
        <div className="bg-[#FAF2F0] min-h-screen">
          <Navbar currentPath={currentPath} />
          <div className="pt-24 print:pt-0">
            <BoardingPass />
          </div>
        </div>
      ) : (
        <>
          <Navbar currentPath={currentPath} />
          <Hero />
          <PopularTours />
          <Intro />
          <VideoSection />
          
          <BookingSection 
            bookings={bookings}
            blockedDates={blockedDates}
            closedSlots={closedSlots}
            onAddBooking={addBooking}
          />
          
          <GallerySection />
          <PaddleTogether />
          <Reviews />
          <Footer />
          <MobileBottomNav />
        </>
      )}

      {/* ──── WHATSAPP SANDBOX SIMULATION MODAL ──── */}
      <AnimatePresence>
        {isControlHub && whatsAppNotification && whatsAppNotification.open && (
          <div className="fixed bottom-6 right-6 z-[999] max-w-sm w-full select-text">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-[#0b141a] rounded-3xl overflow-hidden border border-[#233138] shadow-[0_20px_50px_rgba(0,0,0,0.5)] font-sans"
            >
              {/* WhatsApp Simulator Header */}
              <div className="bg-[#202c33] px-4 py-3.5 flex items-center justify-between border-b border-[#233138]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#128C7E] flex items-center justify-center font-bold text-white text-sm">
                    HC
                  </div>
                  <div className="flex flex-col items-start leading-none text-left">
                    <span className="text-white text-xs font-bold font-sans">Hooked & Cooked</span>
                    <span className="text-[10px] text-gray-400 font-sans mt-0.5">Online Alert Sandbox</span>
                  </div>
                </div>
                <button 
                  onClick={() => setWhatsAppNotification(null)}
                  className="text-gray-400 hover:text-white text-lg font-light focus:outline-none p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Chat Area */}
              <div 
                className="p-4 space-y-4 max-h-[360px] overflow-y-auto"
                style={{
                  backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
                  backgroundSize: 'contain',
                }}
              >
                {/* Incoming Message Bubble */}
                <div className="bg-[#202c33] text-white rounded-2xl rounded-tl-none p-3.5 max-w-[85%] self-start text-left text-xs leading-relaxed border border-[#2c3940] shadow-sm ml-2 relative">
                  {/* Whatsapp bubble arrow */}
                  <div className="absolute top-0 left-[-8px] w-0 h-0 border-t-[8px] border-t-[#202c33] border-l-[8px] border-l-transparent" />
                  
                  {/* Message body formatted with pre-wrap to support newlines */}
                  <p className="whitespace-pre-wrap font-sans text-gray-100">{whatsAppNotification.message}</p>
                  
                  {whatsAppNotification.qrUrl && (
                    <div className="mt-4 bg-white p-3 rounded-2xl flex flex-col items-center gap-2 border border-[#374248]">
                      <span className="text-[8.5px] font-extrabold tracking-wider uppercase text-black font-sans">
                        SCAN CODE AT BOAT CLUB
                      </span>
                      <img 
                        src={whatsAppNotification.qrUrl} 
                        alt="Check-In Boarding Pass QR" 
                        className="w-40 h-40 object-contain"
                      />
                      <a 
                        href={whatsAppNotification.qrUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[9.5px] text-[#00a884] hover:underline font-bold mt-1"
                      >
                        Open QR Boarding Pass Link
                      </a>
                    </div>
                  )}
                  
                  <span className="block text-[8px] text-right text-gray-400/80 font-sans mt-2">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Send Bar */}
              <div className="bg-[#1f2c34] p-3 flex flex-col gap-2 border-t border-[#233138] text-center">
                <button
                  onClick={() => {
                    if (whatsAppNotification && whatsAppNotification.phone) {
                      openWhatsAppLink(
                        whatsAppNotification.phone, 
                        whatsAppNotification.message + (whatsAppNotification.qrUrl ? `\n\nShow QR ticket here: ${whatsAppNotification.qrUrl}` : '')
                      );
                    }
                  }}
                  className="w-full bg-[#00a884] hover:bg-[#00a884]/90 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Send to Actual WhatsApp</span>
                </button>
                <div className="text-[9px] text-gray-400 select-none">
                  Opens WhatsApp chat with {whatsAppNotification.phone}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;
