import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShieldCheck, Zap, CreditCard, ChevronRight, QrCode, Share2 } from 'lucide-react';
import type { Booking, ClosedSlot } from '../types';

const SLOTS = [
  { time: '6:00 AM' },
  { time: '8:00 AM' },
  { time: '10:00 AM' },
  { time: '1:00 PM' },
  { time: '3:00 PM' },
  { time: '5:00 PM' },
];

const ROUTES = [
  {
    id: 'kadambrayar',
    name: 'Kadambrayar River Expedition',
    desc: 'Glide through pristine mangrove forests during sunrise.',
    image: '/mangrove_tour.webp',
  },
  {
    id: 'vembanad',
    name: 'Vembanad Backwater Odyssey',
    desc: 'Explore the wide wilderness and traditional canals.',
    image: '/vembanad_tour.webp',
  },
  {
    id: 'kadamakudy',
    name: 'Kadamakudy Village Explorer',
    desc: 'Immerse in local island fish farms and sunset views.',
    image: '/sunset_tour.webp',
  },
];

const gold  = '#C8A86B';
const ink   = '#0D0D0D';
const aqua  = '#73E6D8';
const coral = '#E06C61';
const grayMuted = '#8E8A80';
const bgBeige = '#F4EBDB';

const CAPACITY = 12;

const getKayakTypeDisplay = (kType: string) => {
  if (kType === 'single') return 'Single Kayak';
  if (kType === 'double') return 'Double Kayak';
  if (typeof kType === 'string' && kType.startsWith('mixed:')) {
    const parts = kType.split(':');
    const s = parseInt(parts[1], 10) || 0;
    const d = parseInt(parts[2], 10) || 0;
    const sLabel = s === 1 ? '1 Single Kayak' : `${s} Single Kayaks`;
    const dLabel = d === 1 ? '1 Double Kayak' : `${d} Double Kayaks`;
    return `Custom Group (${sLabel} + ${dLabel})`;
  }
  return kType;
};

interface BookingSectionProps {
  bookings: Booking[];
  blockedDates: string[];
  closedSlots: ClosedSlot[];
  onAddBooking: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'securityToken'>) => Booking | Promise<Booking>;
}

export default function BookingSection({
  bookings,
  blockedDates,
  closedSlots,
  onAddBooking
}: BookingSectionProps) {
  const [step, setStep]           = useState<1 | 2>(1);
  const [submitted, setSubmitted] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [paying, setPaying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [mixedSingleCount, setMixedSingleCount] = useState(1);
  const [mixedDoubleCount, setMixedDoubleCount] = useState(1);

  // Dynamically load the real Razorpay Checkout script from official CDN
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof (window as any).Razorpay !== 'undefined') {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    setPaying(true);
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert('Failed to load Razorpay Checkout SDK. Please check your internet connection.');
      setPaying(false);
      return;
    }

    const options = {
      key: 'rzp_test_SxPzJH8enhojon', // User's Test API Key
      amount: totalPrice * 100, // Amount in paise (1 INR = 100 Paise)
      currency: 'INR',
      name: 'Hooked & Cooked',
      description: `${selectedRouteObj?.name || 'Kayak Expedition'} - ${getKayakTypeDisplay(form.kayakType)} - ${form.guests} Guests`,
      image: '/logo.webp',
      handler: async function () {
        // Real checkout payment success callback
        const res = onAddBooking({
          date: form.date,
          route: form.route,
          slot: form.slot,
          kayakType: form.kayakType,
          guests: form.guests,
          name: form.name,
          email: form.email,
          phone: form.phone,
          status: 'Confirmed',
          paymentStatus: 'Paid',
          source: 'Online',
          amount: totalPrice
        });
        const newBooking = res instanceof Promise ? await res : res;
        setCreatedBooking(newBooking);
        setPaying(false);
        setSubmitted(true);
      },
      prefill: {
        name: form.name,
        email: form.email,
        contact: form.phone
      },
      notes: {
        address: 'Kadambrayar Boat Club, Kochi'
      },
      theme: {
        color: '#0D0D0D' // Matching brand dark color
      },
      modal: {
        ondismiss: function () {
          setPaying(false);
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };
  
  // Accordion active step in Step 1 (1: Date, 2: Slot, 3: Kayak, 4: Guests)
  const [subStep, setSubStep]     = useState<1 | 2 | 3 | 4>(1);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    if (createdBooking) {
      const qrPayload = JSON.stringify({
        bookingId: createdBooking.id,
        token: createdBooking.securityToken,
        guests: createdBooking.guests
      });
      import('qrcode')
        .then(({ default: qrcode }) => {
          qrcode.toDataURL(qrPayload, { margin: 1, width: 200 })
            .then(url => setQrCodeUrl(url))
            .catch(err => console.error('Error generating QR code locally: ', err));
        })
        .catch(err => console.error('Error importing qrcode dynamically: ', err));
    }
  }, [createdBooking]);

  // Custom Calendar state
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear]   = useState(today.getFullYear());

  const [form, setForm]           = useState({
    date: '', // format YYYY-MM-DD
    route: 'kadambrayar',
    slot: '',
    kayakType: 'single' as string,
    guests: 2,
    name: '',
    email: '',
    phone: '',
  });

  const selectedRouteObj = ROUTES.find(r => r.id === form.route);

  // Dynamic booking simulation (Deterministic lookup based on date & slot time)
  const getBookedSeats = (dateStr: string, slotTime: string) => {
    if (!dateStr || !slotTime) return 0;
    const [, monthStr, dayStr] = dateStr.split('-');
    const day = parseInt(dayStr, 10) || 1;
    const month = parseInt(monthStr, 10) || 1;
    // Deterministic pseudo-random booking records
    const hash = (day * 3 + month * 7 + slotTime.length * 11) % 13;
    return Math.min(hash, CAPACITY);
  };

  const getSlotInventory = (dateStr: string, slotTime: string) => {
    let bookedSingle = 0;
    let bookedDouble = 0;

    const activeBookings = bookings.filter(
      b => b.date === dateStr && b.slot === slotTime && b.status !== 'Cancelled'
    );

    activeBookings.forEach(b => {
      if (b.kayakType === 'single') {
        bookedSingle += b.guests;
      } else if (b.kayakType === 'double') {
        bookedDouble += Math.ceil(b.guests / 2);
      } else if (typeof b.kayakType === 'string' && b.kayakType.startsWith('mixed:')) {
        const parts = b.kayakType.split(':');
        const s = parseInt(parts[1], 10) || 0;
        const d = parseInt(parts[2], 10) || 0;
        bookedSingle += s;
        bookedDouble += d;
      }
    });

    const remainingSingle = Math.max(0, 8 - bookedSingle);
    const remainingDouble = Math.max(0, 2 - bookedDouble);
    const remainingGuests = remainingSingle + remainingDouble * 2;

    return {
      remainingGuests,
      remainingSingle,
      remainingDouble,
    };
  };

  const getSlotAvailability = (dateStr: string, slotTime: string) => {
    const { remainingGuests } = getSlotInventory(dateStr, slotTime);
    return { booked: 12 - remainingGuests, remaining: remainingGuests };
  };

  const getMixedCounts = (kType: string) => {
    if (typeof kType === 'string' && kType.startsWith('mixed:')) {
      const parts = kType.split(':');
      const s = parseInt(parts[1], 10) || 0;
      const d = parseInt(parts[2], 10) || 0;
      return { s, d };
    }
    return { s: 0, d: 0 };
  };

  const updateMixedCounts = (s: number, d: number) => {
    const totalCapacity = s + d * 2;
    const { remainingGuests, remainingSingle, remainingDouble } = getSlotInventory(form.date, form.slot);
    
    // Check if within bounds
    if (s > remainingSingle || d > remainingDouble || totalCapacity > remainingGuests) {
      return;
    }
    setMixedSingleCount(s);
    setMixedDoubleCount(d);
    setForm(p => ({
      ...p,
      kayakType: `mixed:${s}:${d}`,
      guests: totalCapacity
    }));
  };

  const handleSelectMixedPlatform = () => {
    const { remainingGuests, remainingSingle, remainingDouble } = getSlotInventory(form.date, form.slot);
    let s = 1;
    let d = 1;

    // Adjust initial values if they exceed slot availability
    if (s > remainingSingle) s = remainingSingle;
    if (d > remainingDouble) d = remainingDouble;

    // Check if total fits remaining capacity
    if (s + d * 2 > remainingGuests) {
      if (remainingGuests >= 2) {
        s = 0;
        d = 1;
      } else if (remainingGuests >= 1) {
        s = 1;
        d = 0;
      } else {
        s = 0;
        d = 0;
      }
    }

    setMixedSingleCount(s);
    setMixedDoubleCount(d);
    setForm(p => ({
      ...p,
      kayakType: `mixed:${s}:${d}`,
      guests: s + d * 2
    }));
    setSubStep(4);
  };

  const handleMixedSingleChange = (newSingle: number) => {
    if (newSingle < 0) return;
    if (newSingle === 0 && mixedDoubleCount === 0) return;
    updateMixedCounts(newSingle, mixedDoubleCount);
  };

  const handleMixedDoubleChange = (newDouble: number) => {
    if (newDouble < 0) return;
    if (mixedSingleCount === 0 && newDouble === 0) return;
    updateMixedCounts(mixedSingleCount, newDouble);
  };

  // Price Calculation: Single ₹450 / Double ₹900 / Mixed derived
  let totalPrice = 0;
  if (form.kayakType === 'single') {
    totalPrice = form.guests * 450;
  } else if (form.kayakType === 'double') {
    totalPrice = Math.ceil(form.guests / 2) * 900;
  } else if (typeof form.kayakType === 'string' && form.kayakType.startsWith('mixed:')) {
    const { s, d } = getMixedCounts(form.kayakType);
    totalPrice = s * 450 + d * 900;
  }

  // Calendar logic helpers
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  // Dynamic date state calculations for full-cell coloring
  const getDateStatus = (day: number, month: number, year: number) => {
    const checkDate = new Date(year, month, day);
    checkDate.setHours(23, 59, 59, 999);
    
    // Past dates are disabled
    if (checkDate < today) return 'past';

    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    // Check if manually blocked by admin
    if (blockedDates.includes(dateStr)) return 'soldout';

    let totalRemaining = 0;
    let totalSlots = SLOTS.length;
    let soldOutCount = 0;

    SLOTS.forEach(slot => {
      const { remaining } = getSlotAvailability(dateStr, slot.time);
      if (remaining <= 0 || isSlotClosed(slot.time, dateStr)) soldOutCount++;
      else totalRemaining += remaining;
    });

    if (soldOutCount === totalSlots) return 'soldout';
    if (totalRemaining <= 6) return 'almostfull';
    if (totalRemaining <= 18) return 'limited';
    return 'available';
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const cells = [];

    // Empty cells before the first day
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="w-10 h-10" />);
    }

    // Days cells
    for (let day = 1; day <= daysInMonth; day++) {
      const status = getDateStatus(day, currentMonth, currentYear);
      const isSelected = form.date === `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      let bg = '#FFFFFF';
      let textColor = ink;
      let cursor = 'pointer';
      let opacity = '1';

      if (status === 'past') {
        textColor = '#C2BFB6';
        cursor = 'not-allowed';
        opacity = '0.35';
      } else if (status === 'soldout') {
        bg = '#FADED9';
        textColor = '#E06C61';
        cursor = 'not-allowed';
      } else if (status === 'almostfull') {
        bg = '#FADED9';
      } else if (status === 'limited') {
        bg = '#FAF0D2';
      } else {
        bg = '#D2F7F2';
      }

      cells.push(
        <button
          key={day}
          type="button"
          disabled={status === 'past' || status === 'soldout'}
          onClick={() => handleDateClick(day)}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: isSelected ? ink : bg,
            color: isSelected ? '#FFFFFF' : textColor,
            cursor: cursor,
            opacity: opacity,
            fontWeight: isSelected ? 800 : 500,
            fontSize: '12px',
            border: isSelected ? 'none' : '1px solid #F4EBDB',
            transition: 'all 0.15s ease',
          }}
          className="hover:scale-105 active:scale-95"
        >
          {day}
        </button>
      );
    }

    return cells;
  };

  const handleDateClick = (day: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    
    const status = getDateStatus(day, currentMonth, currentYear);
    if (status !== 'past' && status !== 'soldout') {
      setForm(p => ({ ...p, date: dateStr, route: 'kadambrayar', slot: '' })); // reset dependencies
      setSubStep(2); // Auto advance to slots selection
    }
  };

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return '—';
    const [year, month, day] = dateStr.split('-');
    const monthName = months[parseInt(month, 10) - 1].substring(0, 3);
    return `${parseInt(day, 10)} ${monthName} ${year}`;
  };

  const goToStep2 = () => {
    if (!form.date) { alert('Please select a date.'); setSubStep(1); return; }
    if (!form.slot) { alert('Please select a departure time slot.'); setSubStep(2); return; }
    if (isSlotClosed(form.slot, form.date)) {
      alert('This departure slot is now closed for bookings.');
      setSubStep(2);
      return;
    }
    
    // Enforce kayak-specific limits
    const { remainingGuests, remainingSingle, remainingDouble } = getSlotInventory(form.date, form.slot);
    let reqGuests = form.guests;
    let reqSingle = 0;
    let reqDouble = 0;

    if (form.kayakType === 'single') {
      reqSingle = form.guests;
    } else if (form.kayakType === 'double') {
      reqDouble = Math.ceil(form.guests / 2);
    } else if (typeof form.kayakType === 'string' && form.kayakType.startsWith('mixed:')) {
      const { s, d } = getMixedCounts(form.kayakType);
      reqSingle = s;
      reqDouble = d;
      reqGuests = s + d * 2;
    }

    if (reqGuests > remainingGuests) {
      alert(`Cannot proceed. Exceeds overall slot capacity. (Requested: ${reqGuests} guests, Remaining: ${remainingGuests})`);
      return;
    }
    if (reqSingle > remainingSingle) {
      alert(`Cannot proceed. Exceeds Single Kayak inventory limit of 8. (Requested: ${reqSingle}, Remaining: ${remainingSingle})`);
      return;
    }
    if (reqDouble > remainingDouble) {
      alert(`Cannot proceed. Exceeds Double Kayak inventory limit of 2. (Requested: ${reqDouble}, Remaining: ${remainingDouble})`);
      return;
    }

    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length < 10) {
      alert('Please enter a valid phone number with at least 10 digits.');
      return;
    }

    // Validate kayak-specific limits again on submission
    const { remainingGuests, remainingSingle, remainingDouble } = getSlotInventory(form.date, form.slot);
    let reqGuests = form.guests;
    let reqSingle = 0;
    let reqDouble = 0;

    if (form.kayakType === 'single') {
      reqSingle = form.guests;
    } else if (form.kayakType === 'double') {
      reqDouble = Math.ceil(form.guests / 2);
    } else if (typeof form.kayakType === 'string' && form.kayakType.startsWith('mixed:')) {
      const { s, d } = getMixedCounts(form.kayakType);
      reqSingle = s;
      reqDouble = d;
      reqGuests = s + d * 2;
    }

    if (reqGuests > remainingGuests) {
      alert(`Cannot proceed. Exceeds overall slot capacity. (Requested: ${reqGuests} guests, Remaining: ${remainingGuests})`);
      return;
    }
    if (reqSingle > remainingSingle) {
      alert(`Cannot proceed. Exceeds Single Kayak inventory limit of 8. (Requested: ${reqSingle}, Remaining: ${remainingSingle})`);
      return;
    }
    if (reqDouble > remainingDouble) {
      alert(`Cannot proceed. Exceeds Double Kayak inventory limit of 2. (Requested: ${reqDouble}, Remaining: ${remainingDouble})`);
      return;
    }

    handleRazorpayPayment();
  };

  const resetAll = () => {
    setSubmitted(false);
    setCreatedBooking(null);
    setStep(1);
    setSubStep(1);
    setMixedSingleCount(1);
    setMixedDoubleCount(1);
    setForm({
      date: '',
      route: 'kadambrayar',
      slot: '',
      kayakType: 'single',
      guests: 2,
      name: '',
      email: '',
      phone: '',
    });
  };

  const handleDownload = () => {
    if (!createdBooking) return;
    // Navigate to the boarding pass page (full-page, static, with its own working Download Pass button)
    const boardingUrl = `/boarding-pass?id=${createdBooking.id}&token=${createdBooking.securityToken}&name=${encodeURIComponent(createdBooking.name)}&route=${createdBooking.route}&slot=${encodeURIComponent(createdBooking.slot)}&date=${createdBooking.date}&guests=${createdBooking.guests}&kayak=${createdBooking.kayakType}&amount=${createdBooking.amount}`;
    window.open(boardingUrl, '_blank');
  };

  const handleShare = () => {
    if (!createdBooking) return;
    const boardingUrl = `https://visitkadambrayar.com/boarding-pass?id=${createdBooking.id}&token=${createdBooking.securityToken}&name=${encodeURIComponent(createdBooking.name)}&route=${createdBooking.route}&slot=${encodeURIComponent(createdBooking.slot)}&date=${createdBooking.date}&guests=${createdBooking.guests}&kayak=${createdBooking.kayakType}&amount=${createdBooking.amount}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Hooked & Cooked Boarding Pass',
        text: `Boarding Pass for ${createdBooking.name} - Booking ID: ${createdBooking.id}`,
        url: boardingUrl,
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(boardingUrl);
      alert('Boarding pass link copied to clipboard!');
    }
  };

  const fieldInput = (
    name: 'name' | 'email' | 'phone',
    label: string,
    type: string,
    placeholder: string
  ) => (
    <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={name} style={{ fontSize: '9.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: gold }}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        placeholder={placeholder}
        value={form[name]}
        onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
        style={{
          padding: '14px 16px', border: '1px solid #EAE6DF', borderRadius: '12px',
          fontSize: '13px', color: ink, background: '#FFFFFF',
          width: '100%', boxSizing: 'border-box',
        }}
      />
    </div>
  );

  const isSlotClosed = (time: string, date: string) => {
    // 1. Check manual overrides
    const isManuallyClosed = closedSlots.some(cs => cs.date === date && cs.slot === time);
    if (isManuallyClosed) return true;

    // 2. Check time out limit (1 hour before slot start time)
    if (!date || !time) return false;
    try {
      const [year, month, day] = date.split('-').map(Number);
      const match = time.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
      if (match) {
        let hours = Number(match[1]);
        const minutes = Number(match[2]);
        const ampm = match[3].toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        
        const slotDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
        const cutoff = new Date(slotDate.getTime() - 60 * 60 * 1000);
        const now = new Date();
        if (now >= cutoff) {
          return true;
        }
      }
    } catch (e) {
      console.error('Error parsing slot date/time closure: ', e);
    }
    return false;
  };

  const getAvailabilityMessage = (dateStr: string) => {
    if (!dateStr) return 'Select a date to check availability';
    
    let totalRemaining = 0;
    let totalSlots = SLOTS.length;
    let soldOutCount = 0;

    SLOTS.forEach(slot => {
      const { remaining } = getSlotAvailability(dateStr, slot.time);
      if (remaining <= 0 || isSlotClosed(slot.time, dateStr)) soldOutCount++;
      else totalRemaining += remaining;
    });

    if (soldOutCount === totalSlots) return 'Sold Out today';
    if (totalRemaining <= 6) return 'Almost Full — Book soon!';
    if (totalRemaining <= 18) return 'Limited Availability';
    return 'Good Availability';
  };

  const accordionHeader = (
    num: number,
    title: string,
    value: string,
    isActive: boolean,
    isAccessible: boolean
  ) => {
    return (
      <div 
        onClick={() => {
          if (isAccessible && !submitted) {
            setSubStep(num as any);
            setStep(1); // Ensure we are in step 1 if clicking accordion
          }
        }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 24px',
          borderBottom: '1px solid #F4EBDB',
          cursor: (isAccessible && !submitted) ? 'pointer' : 'not-allowed',
          background: isActive ? 'rgba(74, 52, 40, 0.12)' : '#FFFFFF',
          transition: 'background 0.2s, color 0.2s',
        }}
        className="flex justify-between items-center select-none"
      >
        <div className="flex items-center gap-3.5">
          <div 
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: isActive ? '#4A3428' : '#F4EBDB',
              color: isActive ? '#E8E3D8' : '#8E8A80',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10.5px',
              fontWeight: 800,
            }}
          >
            {num}
          </div>
          <h3 
            style={{ 
              fontSize: '12px', 
              fontWeight: isActive ? 800 : 600, 
              color: isActive ? '#4A3428' : ink,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              margin: 0,
              display: 'inline',
            }}
          >
            {title}
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          {!isActive && value && (
            <span style={{ fontSize: '11px', fontWeight: 800, color: ink, textTransform: 'uppercase' }}>
              {value}
            </span>
          )}
          {isAccessible && !isActive && !submitted && (
            <span style={{ fontSize: '10px', color: gold, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Edit
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <section 
      id="booking-section" 
      style={{
        background: '#F4EBDB', // Sand / Light warm background
        padding: '80px 24px',
        color: ink,
      }} 
      className="relative z-10 select-none"
    >
      <style>{`
        #booking-section input,
        #booking-section select { outline: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{ maxWidth: 1120, margin: '0 auto' }}>

        {/* ── Header ── */}
        {!submitted && (
          <div className="text-center mb-8 md:mb-14">
            <h2 style={{
              fontSize: 'clamp(36px, 5.5vw, 68px)',
              fontWeight: 900,
              lineHeight: 1.0,
              textTransform: 'uppercase',
              color: ink,
              margin: '0 0 16px',
              letterSpacing: '-0.5px',
            }}>
              Reserve Your Paddle
            </h2>
            <p style={{ fontSize: '10.5px', letterSpacing: '2px', color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', fontWeight: 700, margin: 0, lineHeight: 1.4 }}>
              Real-time slot availability, dynamic pricing, and instant confirmation.
            </p>
          </div>
        )}

        {/* ── Two-column grid (Responsive stack on mobile) ── */}
        <div className={submitted ? "w-full flex justify-center" : "grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-8 items-stretch"}>

          {/* ──── LEFT CARD (Form flow - Step wizard) ──── */}
          <div 
            style={submitted ? {
              width: '100%',
              maxWidth: '384px',
              margin: '0 auto',
            } : {
              background: '#FFFFFF', borderRadius: '28px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.03), 0 2px 10px rgba(0, 0, 0, 0.01)',
              overflow: 'hidden',
            }}
            className={submitted ? "" : "flex flex-col"}
          >
            <AnimatePresence mode="wait">
              {/* SUCCESS SCREEN */}
              {submitted && createdBooking ? (
                <motion.div key="success"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="success-ticket-container w-full bg-[#FAF2F0] text-[#0A0915] flex flex-col items-center justify-start p-4 select-text font-sans antialiased rounded-[32px] shadow-[0_12px_40px_rgba(30,18,42,0.04)] relative border border-gray-100/30"
                >
                  <style dangerouslySetInnerHTML={{ __html: `
                    @media print {
                      html, body, #root, #root > div, #booking-section {
                        background: #FAF2F0 !important;
                        color: #0A0915 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        height: auto !important;
                        min-height: 0 !important;
                      }
                      #root > *:not(#booking-section),
                      #booking-section > *:not(.success-ticket-container),
                      .print\\:hidden,
                      button,
                      nav,
                      footer {
                        display: none !important;
                        visibility: hidden !important;
                      }
                      .success-ticket-container {
                        display: block !important;
                        background: #FAF2F0 !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        width: 100% !important;
                        box-shadow: none !important;
                        border: none !important;
                      }
                      #success-ticket-card {
                        border: none !important;
                        box-shadow: none !important;
                        background: #FFFFFF !important;
                        margin: 20px auto !important;
                        width: 100% !important;
                        max-width: 360px !important;
                        page-break-inside: avoid !important;
                      }
                      * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                      }
                    }
                  `}} />

                  {/* Immersive background decoration */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[32px] print:hidden">
                    <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[60%] rounded-full bg-radial from-[#FE5B63]/5 to-transparent blur-3xl opacity-60" />
                  </div>

                  <div className="w-full relative z-10 flex flex-col gap-4 pt-2 print:pt-0">
                    
                    {/* Header Banner */}
                    <div className="flex flex-col items-center text-center gap-1 print:hidden">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100/50 flex items-center justify-center font-bold text-base mb-0.5 shadow-xs">
                        ✓
                      </div>
                      <h3 className="font-extrabold text-[14px] tracking-wide text-[#0A0915] uppercase">Adventure Confirmed!</h3>
                      <p className="text-[9.5px] text-gray-500 max-w-[260px] leading-normal font-sans font-light">
                        Processed successfully. Ticket and boarding pass details sent to your WhatsApp number.
                      </p>
                    </div>

                    {/* Boarding Pass Card */}
                    <div id="success-ticket-card" className="bg-white rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgba(30,18,42,0.03)] border border-gray-100/50 flex flex-col print:shadow-none print:border-none">
                      
                      <div className="p-5 pb-1.5 flex flex-col gap-4">
                        <div className="flex justify-between items-start gap-4 text-left">
                          <div className="space-y-0.5">
                            <h4 className="text-[15px] font-black text-[#0A0915] leading-snug tracking-tight text-left">
                              {selectedRouteObj?.name || 'Kayak Expedition'}
                            </h4>
                            <span className="text-[10px] font-bold text-[#8A8996] block text-left">
                              {formatDateLabel(createdBooking.date)}
                            </span>
                          </div>
                          
                          <button 
                            type="button"
                            onClick={handleShare}
                            className="w-8 h-8 rounded-full bg-[#FFF0F0] hover:bg-[#FFE5E5] flex items-center justify-center text-[#FE5B63] hover:scale-105 active:scale-95 transition-all cursor-pointer print:hidden"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="border-b border-dashed border-gray-100" />

                        <div className="grid grid-cols-2 gap-x-3 gap-y-3.5 text-left">
                          <div>
                            <span className="text-[8.5px] font-bold text-[#8A8996] uppercase tracking-wider block">Primary Passenger</span>
                            <span className="text-xs font-black text-[#0A0915] block mt-0.5 truncate">{createdBooking.name}</span>
                          </div>
                          
                          <div>
                            <span className="text-[8.5px] font-bold text-[#8A8996] uppercase tracking-wider block">Kayak Platform</span>
                            <span className="text-xs font-black text-[#0A0915] block mt-0.5">{getKayakTypeDisplay(createdBooking.kayakType)}</span>
                          </div>
                          
                          <div>
                            <span className="text-[8.5px] font-bold text-[#8A8996] uppercase tracking-wider block">Ticket ID</span>
                            <span className="text-xs font-black font-mono text-[#0A0915] block mt-0.5">{createdBooking.id}</span>
                          </div>
                          
                          <div>
                            <span className="text-[8.5px] font-bold text-[#8A8996] uppercase tracking-wider block">Group Size</span>
                            <span className="text-xs font-black text-[#0A0915] block mt-0.5">{createdBooking.guests} Paddler{createdBooking.guests > 1 ? 's' : ''}</span>
                          </div>
                          
                          <div>
                            <span className="text-[8.5px] font-bold text-[#8A8996] uppercase tracking-wider block">Departure Time</span>
                            <span className="text-xs font-black text-[#0A0915] block mt-0.5">{createdBooking.slot}</span>
                          </div>
                          
                          <div>
                            <span className="text-[8.5px] font-bold text-[#8A8996] uppercase tracking-wider block">Booking Status</span>
                            <span className="text-[9.5px] font-extrabold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100/50 px-2 py-0.5 rounded-md inline-block mt-0.5 tracking-wide">
                              CONFIRMED
                            </span>
                          </div>
                        </div>

                        <div className="border-b border-dashed border-gray-100" />

                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-[11px] font-extrabold text-[#0A0915] uppercase tracking-wider">Total Amount</span>
                          <span className="text-[17px] font-black text-[#FE5B63] tracking-tight">
                            ₹{createdBooking.amount.toLocaleString('en-IN')}.00
                          </span>
                        </div>
                      </div>

                      <div className="relative my-1 select-none pointer-events-none print:hidden">
                        <div className="absolute left-[-10px] top-[-10px] w-5 h-5 rounded-full bg-[#FAF2F0]" />
                        <div className="absolute right-[-10px] top-[-10px] w-5 h-5 rounded-full bg-[#FAF2F0]" />
                        <div className="border-b-2 border-dashed border-gray-100 mx-5" />
                      </div>

                      <div className="p-5 pt-1.5 flex flex-col items-center">
                        <div className="w-full flex flex-col items-center py-3.5 bg-[#FAF9F6]/50 rounded-[20px] border border-gray-100/60 shadow-inner print:border-none print:bg-white">
                          <span className="text-[8px] font-bold uppercase text-[#8A8996] tracking-wider mb-3">
                            Gate Entry Check-in QR
                          </span>
                          
                          {qrCodeUrl ? (
                            <img 
                              src={qrCodeUrl} 
                              alt="Scannable QR" 
                              className="w-36 h-36 object-contain p-1.5 bg-white border border-gray-100 rounded-xl shadow-xs print:border-none print:shadow-none"
                            />
                          ) : (
                            <div className="w-36 h-36 flex items-center justify-center bg-gray-200 rounded-xl text-xs font-bold text-gray-400 animate-pulse">
                              Generating QR...
                            </div>
                          )}
                          
                          <span className="text-[8.5px] font-medium text-[#FE5B63] mt-3.5 tracking-wide text-center px-4 leading-normal">
                            Note: Just show your QR code while boarding the kayak.
                          </span>

                          <div className="mt-3.5 pt-3 border-t border-gray-100 w-[85%] text-center">
                            <a 
                              href="https://codexorastudio.vercel.app/" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-[8px] font-bold text-[#8A8996] hover:text-[#0052FF] transition-colors tracking-widest uppercase block"
                            >
                              Developed & Designed by <span className="font-black text-[#0A0915] hover:text-[#0052FF] hover:underline">CODEXORA</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Buttons */}
                    <div className="grid grid-cols-2 gap-3 mt-0.5 print:hidden">
                      <button
                        type="button"
                        onClick={resetAll}
                        className="border border-gray-200 bg-white rounded-xl py-3 text-xs font-black tracking-widest uppercase text-[#1E122A] hover:bg-gray-50 active:scale-98 transition-all cursor-pointer shadow-xs"
                      >
                        New Booking
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="bg-[#1E122A] text-white rounded-xl py-3 text-xs font-black tracking-widest uppercase hover:bg-[#2B1D38] active:scale-98 transition-all cursor-pointer shadow-md shadow-purple-950/15 flex items-center justify-center gap-2"
                      >
                        <span>Download Pass</span>
                      </button>
                    </div>

                  </div>
                </motion.div>
              ) : step === 1 ? (

                /* ── STEP 1: OPTIONS ACCORDION WIZARD ── */
                <div style={{ display: 'flex', flexDirection: 'column' }}>

                  {/* SUBSTEP 1: DATE CALENDAR */}
                  {accordionHeader(1, 'Choose Date', formatDateLabel(form.date), subStep === 1, true)}
                  <AnimatePresence>
                    {subStep === 1 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                        className="px-6 py-6 border-b border-[#F0EFEA]"
                      >
                        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                          {/* Luxury Minimal Calendar Month Header */}
                          <div className="flex items-center justify-between mb-4 px-2">
                            <button type="button" onClick={handlePrevMonth} aria-label="Previous month" className="text-gray-400 hover:text-ink text-xl cursor-pointer font-light">
                              ←
                            </button>
                            <span className="font-extrabold text-[12px] tracking-[0.2em] uppercase text-ink">
                              {months[currentMonth]} {currentYear}
                            </span>
                            <button type="button" onClick={handleNextMonth} aria-label="Next month" className="text-gray-400 hover:text-ink text-xl cursor-pointer font-light">
                              →
                            </button>
                          </div>

                          {/* Day Names */}
                          <div className="grid grid-cols-7 text-center mb-1">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                              <span key={day} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {day}
                              </span>
                            ))}
                          </div>

                          {/* Calendar Grid (Tighter spacing) */}
                          <div className="grid grid-cols-7 gap-y-1 gap-x-1 justify-items-center">
                            {renderCalendar()}
                          </div>
                        </div>

                        {/* Availability Details below calendar */}
                        <div className="mt-4 px-4 py-2.5 rounded-xl bg-[#F4EBDB] border border-[#EAE6DF] flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold tracking-wide uppercase text-ink">
                            {getAvailabilityMessage(form.date)}
                          </span>
                          {form.date && (
                            <div className="flex flex-wrap gap-x-3 gap-y-1 items-center">
                              <span className="flex items-center gap-1.5 text-[8.5px] font-bold text-gray-500 uppercase">
                                <span className="w-2 h-2 rounded-[3px]" style={{ backgroundColor: '#D2F7F2' }} /> Available
                              </span>
                              <span className="flex items-center gap-1.5 text-[8.5px] font-bold text-gray-500 uppercase">
                                <span className="w-2 h-2 rounded-[3px]" style={{ backgroundColor: '#FAF0D2' }} /> Limited
                              </span>
                              <span className="flex items-center gap-1.5 text-[8.5px] font-bold text-gray-500 uppercase">
                                <span className="w-2 h-2 rounded-[3px]" style={{ backgroundColor: '#FADED9' }} /> Almost Full
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* SUBSTEP 2: TIME SLOTS */}
                  {accordionHeader(2, 'Choose Departure Time', form.slot, subStep === 2, !!form.date)}
                  <AnimatePresence>
                    {subStep === 2 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                        className="px-6 py-6 border-b border-[#F0EFEA]"
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {SLOTS.map(slot => {
                            const isClosed   = isSlotClosed(slot.time, form.date);
                            const { remaining } = getSlotAvailability(form.date, slot.time);
                            
                            const isFull     = remaining <= 0 || isClosed;
                            const isSelected = form.slot === slot.time;
                            
                            let displayLabel = `${remaining} Seats Left`;
                            let statusColor  = grayMuted;
                            
                            if (isClosed) {
                              displayLabel = 'Booking Closed';
                              statusColor = coral;
                            } else if (remaining <= 0) {
                              displayLabel = 'Sold Out';
                              statusColor = coral;
                            } else if (remaining <= 2) {
                              displayLabel = `${remaining} Seats Left`;
                              statusColor = coral;
                            } else if (remaining <= 6) {
                              displayLabel = `${remaining} Seats Left`;
                              statusColor = gold;
                            } else {
                              displayLabel = `${remaining} Seats Available`;
                              statusColor = '#2c8a82';
                            }
                            
                            return (
                              <button
                                key={slot.time}
                                type="button"
                                disabled={isFull}
                                onClick={() => {
                                  if (!isFull) {
                                    setForm(p => ({ ...p, slot: slot.time }));
                                    setSubStep(3); // Auto advance to kayak type
                                  }
                                }}
                                style={{
                                  padding: '16px 10px',
                                  borderRadius: '14px',
                                  border: isSelected ? 'none' : `1px solid ${isFull ? '#FFE4E4' : '#EAE6DF'}`,
                                  background: isSelected ? ink : isFull ? '#FFF8F8' : '#FFFFFF',
                                  color: isSelected ? '#FFFFFF' : isFull ? '#FF7373' : ink,
                                  cursor: isFull ? 'not-allowed' : 'pointer',
                                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                  transition: 'all 0.2s ease',
                                  boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                                }}
                              >
                                <span className="text-[13.5px] font-bold">
                                  {slot.time}
                                </span>
                                <span style={{
                                  fontSize: '8.5px', fontWeight: 800,
                                  textTransform: 'uppercase', letterSpacing: '0.5px',
                                  color: isSelected ? aqua : statusColor,
                                }}>
                                  {displayLabel}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* SUBSTEP 3: KAYAK PLATFORM */}
                  {accordionHeader(3, 'Choose Kayak Platform', getKayakTypeDisplay(form.kayakType), subStep === 3, !!form.slot)}
                  <AnimatePresence>
                    {subStep === 3 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                        className="px-6 py-6 border-b border-[#F0EFEA]"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
                          {[
                            { type: 'single' as const, label: 'Single Kayak', sub: '₹450 / Person', icon: '/single_kayak.webp' },
                            { type: 'double' as const, label: 'Double Kayak', sub: '₹900 / Hull', icon: '/double_kayak.webp' },
                            { type: 'mixed' as const, label: 'Custom Group', sub: 'Mix Single & Double', icon: '/Custom group.png' },
                          ].map(item => {
                            const isSelected = item.type === 'mixed'
                              ? form.kayakType.startsWith('mixed:')
                              : form.kayakType === item.type;

                            const { remainingGuests, remainingSingle, remainingDouble } = getSlotInventory(form.date, form.slot);

                            let isDisabled = false;
                            let subText = item.sub;

                            if (item.type === 'single') {
                              if (remainingSingle <= 0 || remainingGuests <= 0) {
                                isDisabled = true;
                                subText = 'Sold Out';
                              } else {
                                subText = `${item.sub} (${remainingSingle} Left)`;
                              }
                            } else if (item.type === 'double') {
                              if (remainingDouble <= 0 || remainingGuests < 2) {
                                isDisabled = true;
                                subText = remainingGuests < 2 && remainingDouble > 0 ? 'Needs 2 Seats' : 'Sold Out';
                              } else {
                                subText = `${item.sub} (${remainingDouble} Left)`;
                              }
                            } else if (item.type === 'mixed') {
                              if (remainingGuests <= 0 || (remainingSingle === 0 && remainingDouble === 0)) {
                                isDisabled = true;
                                subText = 'Sold Out';
                              } else {
                                subText = `${item.sub} (S:${remainingSingle} / D:${remainingDouble})`;
                              }
                            }

                            return (
                              <button
                                key={item.type}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => {
                                  if (item.type === 'mixed') {
                                    handleSelectMixedPlatform();
                                  } else {
                                    const initialGuests = item.type === 'single' ? Math.min(2, remainingGuests, remainingSingle) : 2;
                                    setForm(p => ({ ...p, kayakType: item.type, guests: initialGuests }));
                                    setSubStep(4);
                                  }
                                }}
                                style={{
                                  padding: '14px 12px',
                                  border: isSelected ? `2px solid ${ink}` : '1px solid #EAE6DF',
                                  borderRadius: '16px',
                                  background: isDisabled ? '#F4F3EE' : '#FFFFFF',
                                  color: isDisabled ? '#C2BFB6' : ink,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: 4,
                                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                                  opacity: isDisabled ? 0.6 : 1,
                                  transition: 'all 0.2s',
                                  transform: isSelected && !isDisabled ? 'scale(1.02)' : 'none',
                                  boxShadow: isSelected && !isDisabled ? '0 4px 15px rgba(0,0,0,0.05)' : 'none',
                                }}
                              >
                                <img src={item.icon} alt={item.label} className="w-12 h-12 object-contain mb-1" />
                                <span className="text-[12.5px] font-black uppercase tracking-wide leading-none">{item.label}</span>
                                <span className="text-[10px] text-gray-500 font-medium mt-0.5">{subText}</span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* SUBSTEP 4: GUESTS COUNT */}
                  {accordionHeader(4, 'Active Paddlers Count', `${form.guests} Guests`, subStep === 4, !!form.slot)}
                  <AnimatePresence>
                    {subStep === 4 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                        className="px-6 py-6 border-b border-[#F0EFEA]"
                      >
                        {form.kayakType.startsWith('mixed:') ? (
                          <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
                            {/* Single Kayaks Row */}
                            <div className="flex items-center justify-between w-full border-b border-gray-100 pb-3">
                              <div className="flex flex-col text-left">
                                <span className="text-[13px] font-extrabold text-ink uppercase tracking-wide">Single Kayaks</span>
                                <span className="text-[10.5px] text-gray-500 font-medium">₹450 / Kayak (1 Person)</span>
                              </div>
                              <div style={{
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between',
                                border: '1px solid #EAE6DF', borderRadius: '12px',
                                padding: '8px 14px', background: '#FFFFFF',
                                width: '120px',
                              }}>
                                <button type="button"
                                  disabled={mixedSingleCount <= 0}
                                  onClick={() => handleMixedSingleChange(mixedSingleCount - 1)}
                                  aria-label="Decrease single kayak count"
                                  style={{ background: 'none', border: 'none', fontSize: 18, color: mixedSingleCount <= 0 ? '#C2BFB6' : gold, cursor: mixedSingleCount <= 0 ? 'not-allowed' : 'pointer', fontWeight: 600, padding: 0 }}
                                >−</button>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: ink }}>
                                  {mixedSingleCount}
                                </span>
                                <button type="button"
                                  disabled={
                                    (() => {
                                      const { remainingGuests, remainingSingle } = getSlotInventory(form.date, form.slot);
                                      const nextGuests = (mixedSingleCount + 1) + mixedDoubleCount * 2;
                                      return nextGuests > remainingGuests || (mixedSingleCount + 1) > remainingSingle;
                                    })()
                                  }
                                  onClick={() => handleMixedSingleChange(mixedSingleCount + 1)}
                                  aria-label="Increase single kayak count"
                                  style={{ background: 'none', border: 'none', fontSize: 18, color: gold, cursor: 'pointer', fontWeight: 600, padding: 0 }}
                                >+</button>
                              </div>
                            </div>

                            {/* Double Kayaks Row */}
                            <div className="flex items-center justify-between w-full border-b border-gray-100 pb-3">
                              <div className="flex flex-col text-left">
                                <span className="text-[13px] font-extrabold text-ink uppercase tracking-wide">Double Kayaks</span>
                                <span className="text-[10.5px] text-gray-500 font-medium">₹900 / Kayak (2 People)</span>
                              </div>
                              <div style={{
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between',
                                border: '1px solid #EAE6DF', borderRadius: '12px',
                                padding: '8px 14px', background: '#FFFFFF',
                                width: '120px',
                              }}>
                                <button type="button"
                                  disabled={mixedDoubleCount <= 0}
                                  onClick={() => handleMixedDoubleChange(mixedDoubleCount - 1)}
                                  aria-label="Decrease double kayak count"
                                  style={{ background: 'none', border: 'none', fontSize: 18, color: mixedDoubleCount <= 0 ? '#C2BFB6' : gold, cursor: mixedDoubleCount <= 0 ? 'not-allowed' : 'pointer', fontWeight: 600, padding: 0 }}
                                >−</button>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: ink }}>
                                  {mixedDoubleCount}
                                </span>
                                <button type="button"
                                  disabled={
                                    (() => {
                                      const { remainingGuests, remainingDouble } = getSlotInventory(form.date, form.slot);
                                      const nextGuests = mixedSingleCount + (mixedDoubleCount + 1) * 2;
                                      return nextGuests > remainingGuests || (mixedDoubleCount + 1) > remainingDouble;
                                    })()
                                  }
                                  onClick={() => handleMixedDoubleChange(mixedDoubleCount + 1)}
                                  aria-label="Increase double kayak count"
                                  style={{ background: 'none', border: 'none', fontSize: 18, color: gold, cursor: 'pointer', fontWeight: 600, padding: 0 }}
                                >+</button>
                              </div>
                            </div>

                            {/* Dynamic Summary Card */}
                            <div className="w-full bg-[#FAF9F6] p-4 rounded-2xl border border-[#EAE6DF] space-y-2 text-left font-sans shadow-inner">
                              <span className="text-[9.5px] font-black uppercase text-gray-400 block tracking-wider">Booking Breakdown</span>
                              <div className="flex flex-col gap-1.5 mt-2">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-500 font-medium">Single Kayaks ({mixedSingleCount}):</span>
                                  <span className="font-extrabold text-[#0D0D0D]">₹{mixedSingleCount * 450}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-500 font-medium">Double Kayaks ({mixedDoubleCount}):</span>
                                  <span className="font-extrabold text-[#0D0D0D]">₹{mixedDoubleCount * 900}</span>
                                </div>
                                <div className="border-t border-dashed border-gray-200 my-1"></div>
                                <div className="flex justify-between text-[11px] font-extrabold text-[#0D0D0D]">
                                  <span>Total Capacity:</span>
                                  <span>{form.guests} Guests</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-extrabold text-[#FE5B63]">
                                  <span>Total Fare:</span>
                                  <span>₹{totalPrice}</span>
                                </div>
                              </div>
                            </div>

                            {/* Real-time Inventory Status */}
                            {form.slot && (
                              <div className="w-full text-center mt-1">
                                <div className="flex justify-between w-full text-[9px] font-bold text-gray-400 uppercase tracking-wide px-2">
                                  <span>Single Left: {getSlotInventory(form.date, form.slot).remainingSingle} / 8</span>
                                  <span>Double Left: {getSlotInventory(form.date, form.slot).remainingDouble} / 2</span>
                                </div>
                                <div className="text-[10px] font-extrabold text-coral uppercase tracking-wide mt-1.5">
                                  * Overall Seats Left: {getSlotInventory(form.date, form.slot).remainingGuests} / 12
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3">
                            <div style={{
                              display: 'flex', alignItems: 'center',
                              justifyContent: 'space-between',
                              border: '1px solid #EAE6DF', borderRadius: '14px',
                              padding: '13px 18px', background: '#FFFFFF',
                              width: '100%', maxWidth: '240px',
                            }}>
                              <button type="button"
                                onClick={() => setForm(p => ({ ...p, guests: Math.max(1, p.guests - 1) }))}
                                aria-label="Decrease guest count"
                                style={{ background: 'none', border: 'none', fontSize: 22, color: gold, cursor: 'pointer', fontWeight: 600, lineHeight: 1, padding: 0 }}
                              >−</button>
                              <span style={{ fontSize: '14px', fontWeight: 700, color: ink }}>
                                {form.guests} Guests
                              </span>
                              <button type="button"
                                disabled={
                                  (() => {
                                    const { remainingGuests, remainingSingle, remainingDouble } = getSlotInventory(form.date, form.slot);
                                    if (form.kayakType === 'single') {
                                      return form.guests >= Math.min(remainingGuests, remainingSingle);
                                    } else {
                                      const nextGuests = form.guests + 1;
                                      const reqDouble = Math.ceil(nextGuests / 2);
                                      return nextGuests > remainingGuests || reqDouble > remainingDouble;
                                    }
                                  })()
                                }
                                onClick={() => {
                                  const { remainingGuests, remainingSingle, remainingDouble } = getSlotInventory(form.date, form.slot);
                                  if (form.kayakType === 'single') {
                                    const limit = Math.min(remainingGuests, remainingSingle);
                                    if (form.guests < limit) {
                                      setForm(p => ({ ...p, guests: p.guests + 1 }));
                                    } else {
                                      alert(`Single Kayak inventory limit (${remainingSingle} remaining) or slot capacity reached.`);
                                    }
                                  } else {
                                    const nextGuests = form.guests + 1;
                                    const reqDouble = Math.ceil(nextGuests / 2);
                                    if (nextGuests <= remainingGuests && reqDouble <= remainingDouble) {
                                      setForm(p => ({ ...p, guests: nextGuests }));
                                    } else {
                                      alert(`Double Kayak inventory limit (${remainingDouble} remaining) or slot capacity reached.`);
                                    }
                                  }
                                }}
                                aria-label="Increase guest count"
                                style={{ background: 'none', border: 'none', fontSize: 22, color: gold, cursor: 'pointer', fontWeight: 600, lineHeight: 1, padding: 0 }}
                              >+</button>
                            </div>
                            
                            {/* Real-time Inventory Status */}
                            {form.slot && (
                              <div className="flex flex-col gap-1 items-center mt-1 text-center">
                                <span className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wide">
                                  {form.kayakType === 'single'
                                    ? `Single Kayaks Left: ${getSlotInventory(form.date, form.slot).remainingSingle} / 8`
                                    : `Double Kayaks Left: ${getSlotInventory(form.date, form.slot).remainingDouble} / 2`
                                  }
                                </span>
                                <span className="text-[10px] font-extrabold text-coral uppercase tracking-wide">
                                  * Overall Seats Left: {getSlotInventory(form.date, form.slot).remainingGuests} / 12
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Continue Button */}
                  <div className="p-6">
                    <button type="button" onClick={goToStep2}
                      style={{
                        background: ink, color: '#fff', border: 'none',
                        width: '100%', padding: '18px',
                        borderRadius: '14px',
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '13px', fontWeight: 700,
                        letterSpacing: '3.5px', textTransform: 'uppercase',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s, transform 0.1s',
                      }}
                      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.99)'}
                      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      Continue Reservation
                    </button>
                  </div>

                </div>
              ) : (

                /* ── STEP 2: CONTACT INFORMATION ── */
                <motion.form key="step2"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleSubmit}
                  style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                  className="p-6 sm:p-10"
                >
                  <button type="button" onClick={() => setStep(1)} style={{
                    background: 'none', border: 'none', color: gold,
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', padding: 0, marginBottom: 4,
                  }}>
                    ← Back to Options
                  </button>

                  {fieldInput('name',  'Full Name',     'text',  'Your name')}
                  {fieldInput('email', 'Email Address', 'email', 'your@email.com')}
                   {fieldInput('phone', 'Phone Number',  'tel',   '98765 43210')}

                  <button type="submit" disabled={paying} style={{
                    background: paying ? '#8A8A80' : ink, color: '#fff', border: 'none',
                    width: '100%', padding: '18px', borderRadius: '14px',
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '13px', fontWeight: 750, letterSpacing: '3px',
                    textTransform: 'uppercase', cursor: paying ? 'not-allowed' : 'pointer', marginTop: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}>
                    {paying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Opening Payment Options...</span>
                      </>
                    ) : (
                      <span>Book Adventure Now →</span>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* ──── RIGHT RECEIPT CARD (Sticky summary) ──── */}
          {!submitted && (
            <div className="lg:sticky lg:top-28 self-start">
              <div 
                style={{
                  background: '#FFFFFF', borderRadius: '28px',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.03), 0 2px 10px rgba(0, 0, 0, 0.01)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  minHeight: 480,
                }}
                className="p-6 sm:p-8"
              >
                <div>
                  {/* Header */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: 24, borderBottom: '1px solid #F0EFEA', paddingBottom: 20,
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: 750, letterSpacing: '1.5px', textTransform: 'uppercase', color: ink }}>
                      Journey Summary
                    </span>
                    <span style={{
                      fontSize: '8.5px', fontWeight: 800, letterSpacing: '1px',
                      color: gold, background: '#FAF7F2', border: `1px solid ${gold}33`,
                      padding: '5px 10px', borderRadius: 6, textTransform: 'uppercase',
                    }}>
                      Instant Reserve
                    </span>
                  </div>

                  {/* Detail rows */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {[
                      { label: '📅 Date',    value: formatDateLabel(form.date) },
                      { label: '📍 Route',   value: selectedRouteObj ? selectedRouteObj.name : '—' },
                      { label: '🕒 Time',    value: form.slot || '—' },
                      {
                        label: '🚣 Kayak',
                        value: form.kayakType === 'single'
                          ? 'Single Kayak (₹450)'
                          : form.kayakType === 'double'
                            ? 'Double Kayak (₹900)'
                            : getKayakTypeDisplay(form.kayakType)
                      },
                      { label: '👥 Guests',  value: `${form.guests} People` },
                    ].map((row, i) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '14px 0', borderBottom: '1px dashed #EAE6DF',
                      }}>
                        <span style={{ fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: grayMuted }}>
                          {row.label}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: ink, textTransform: 'uppercase', textAlign: 'right', marginLeft: 8 }}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price + Footer */}
                <div style={{ marginTop: 24 }}>
                  <div style={{ borderTop: '1.5px solid #EAE6DF', paddingTop: 20, marginBottom: 20 }}>
                    <p style={{ fontSize: '9.5px', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '1px', color: grayMuted, marginBottom: 8 }}>
                      Total Expedition Fare
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 56, fontWeight: 900, color: ink, lineHeight: 1, letterSpacing: '-1px' }}>
                        ₹{totalPrice.toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 750, color: grayMuted, letterSpacing: '0.5px' }}>INR</span>
                    </div>
                  </div>

                  {/* Trust Indicators */}
                  <div style={{
                    borderTop: '1px solid #F0EFEA', paddingTop: 16,
                    display: 'flex', flexDirection: 'column', gap: 8,
                    textAlign: 'left'
                  }}>
                    <span className="text-[9.5px] font-extrabold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck size={13} color={gold} /> Secure Booking Process
                    </span>
                    <span className="text-[9.5px] font-extrabold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Zap size={13} color={gold} /> Instant Email Confirmation
                    </span>
                    <span className="text-[9.5px] font-extrabold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <CreditCard size={13} color={gold} /> Transparent Pricing (No Hidden Fees)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ── Bottom Horizontal Trust Banner ── */}
        <div 
          style={{
            marginTop: 48,
            borderTop: '1px solid rgba(142, 138, 128, 0.25)',
            paddingTop: 32,
          }}
          className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6"
        >
          {[
            { label: 'Certified Guides', icon: '✓' },
            { label: 'Premium Imported Kayaks', icon: '✓' },
            { label: 'Life Jackets Included', icon: '✓' },
            { label: 'Free Photos', icon: '✓' },
          ].map((trustItem, index) => (
            <div 
              key={index} 
              className="flex items-center gap-2 text-[9.5px] font-extrabold uppercase tracking-widest text-gray-400"
            >
              <span className="w-5 h-5 rounded-full bg-[#EAE6DF]/60 text-emerald-600 flex items-center justify-center text-xs font-bold font-sans">
                {trustItem.icon}
              </span>
              <span>{trustItem.label}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
