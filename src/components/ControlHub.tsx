import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  CreditCard, 
  QrCode, 
  Home, 
  Search, 
  Plus, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  CalendarRange, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles 
} from 'lucide-react';
import type { Booking, ClosedSlot, Customer } from '../types';
import QRCode from 'qrcode';

interface ControlHubProps {
  bookings: Booking[];
  blockedDates: string[];
  closedSlots: ClosedSlot[];
  onAddBooking: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'securityToken'>) => Booking | Promise<Booking>;
  onUpdateBooking: (updatedBooking: Booking) => void;
  onBlockDate: (date: string) => void;
  onUnblockDate: (date: string) => void;
  onCloseSlot: (date: string, slot: string) => void;
  onReopenSlot: (date: string, slot: string) => void;
  onConfirmCheckIn: (bookingId: string, token?: string, isAdminOverride?: boolean) => {
    success: boolean;
    message: string;
    booking?: Booking;
    time?: string;
    date?: string;
  };
  onNavigate: (path: string) => void;
}

const SLOTS = ['6:00 AM', '8:00 AM', '10:00 AM', '1:00 PM', '3:00 PM', '5:00 PM'];
const CAPACITY = 12;

const ROUTES = [
  { id: 'kadambrayar', name: 'Kadambrayar River Expedition' },
  { id: 'vembanad', name: 'Vembanad Backwater Odyssey' },
  { id: 'kadamakudy', name: 'Kadamakudy Village Explorer' }
];

export default function ControlHub({
  bookings,
  blockedDates,
  closedSlots,
  onAddBooking,
  onUpdateBooking,
  onBlockDate,
  onUnblockDate,
  onCloseSlot,
  onReopenSlot,
  onConfirmCheckIn,
  onNavigate
}: ControlHubProps) {
  // Navigation active tab: 'dashboard', 'bookings', 'customers', 'payments', 'overrides', 'scanner'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'customers' | 'payments' | 'overrides' | 'scanner'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Modals state
  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
  const [showBlockDateModal, setShowBlockDateModal] = useState(false);
  const [showCloseSlotModal, setShowCloseSlotModal] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  // Search & Filters state
  const [bookingsSearch, setBookingsSearch] = useState('');
  const [bookingsFilterStatus, setBookingsFilterStatus] = useState<string>('All');
  const [bookingsFilterDate, setBookingsFilterDate] = useState<string>('');
  const [bookingsPage, setBookingsPage] = useState(1);
  const bookingsPerPage = 8;

  const [customersSearch, setCustomersSearch] = useState('');
  const [customersPage, setCustomersPage] = useState(1);
  const customersPerPage = 8;

  const [paymentsSearch, setPaymentsSearch] = useState('');
  const [paymentsPage, setPaymentsPage] = useState(1);
  const paymentsPerPage = 8;

  // Selected details panel state
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const selectedBooking = bookings.find(b => b.id === selectedBookingId);
  const [selectedQrUrl, setSelectedQrUrl] = useState('');

  // QR Camera Scanner state
  const [scannerLoaded, setScannerLoaded] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannerInst, setScannerInst] = useState<any>(null);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    booking?: Booking;
    alreadyCheckedIn?: boolean;
    checkInTime?: string;
    checkInDate?: string;
  } | null>(null);
  const [manualScanInput, setManualScanInput] = useState('');

  // Forms state
  const [bookingForm, setBookingForm] = useState({
    date: new Date().toISOString().split('T')[0],
    route: 'kadambrayar',
    slot: '8:00 AM',
    kayakType: 'single' as 'single' | 'double',
    guests: 2,
    name: '',
    email: '',
    phone: '',
    status: 'Confirmed' as 'Pending' | 'Confirmed' | 'Cancelled' | 'Checked In',
    paymentStatus: 'Paid' as 'Paid' | 'Unpaid' | 'Refunded',
    source: 'WhatsApp' as 'Online' | 'WhatsApp' | 'Phone Call' | 'Walk-in',
    amount: 900
  });

  const [blockDateForm, setBlockDateForm] = useState({
    date: '',
    reason: ''
  });

  const [closeSlotForm, setCloseSlotForm] = useState({
    date: '',
    slot: '8:00 AM',
    reason: ''
  });

  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'Phone Call' as 'Online' | 'WhatsApp' | 'Phone Call' | 'Walk-in'
  });

  // Calculate pricing in manual booking form when parameters change
  useEffect(() => {
    const calculatedPrice = bookingForm.kayakType === 'single'
      ? bookingForm.guests * 450
      : Math.ceil(bookingForm.guests / 2) * 900;
    setBookingForm(prev => ({ ...prev, amount: calculatedPrice }));
  }, [bookingForm.kayakType, bookingForm.guests]);

  // Load HTML5 QR Code script from CDN dynamically
  useEffect(() => {
    if (activeTab === 'scanner') {
      if (typeof (window as any).Html5Qrcode === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/html5-qrcode';
        script.async = true;
        script.onload = () => setScannerLoaded(true);
        document.body.appendChild(script);
      } else {
        setScannerLoaded(true);
      }
    } else {
      // Clean up scanning if we change tabs
      if (scannerInst) {
        scannerInst.stop().then(() => {
          setScanning(false);
          setScannerInst(null);
        }).catch((err: any) => console.log(err));
      }
    }

    return () => {
      if (scannerInst) {
        scannerInst.stop().catch((err: any) => console.log(err));
      }
    };
  }, [activeTab]);

  useEffect(() => {
    if (selectedBooking) {
      const qrPayload = JSON.stringify({
        bookingId: selectedBooking.id,
        token: selectedBooking.securityToken,
        guests: selectedBooking.guests
      });
      QRCode.toDataURL(qrPayload, { margin: 1, width: 180 })
        .then(url => setSelectedQrUrl(url))
        .catch(err => console.error('Error generating selected QR: ', err));
    } else {
      setSelectedQrUrl('');
    }
  }, [selectedBookingId, selectedBooking]);

  // Operational Date Setup
  const todayStr = '2026-06-04'; // Dynamic date matching simulated bookings baseline

  // 1. Dashboard calculations
  const todayBookings = bookings.filter(b => b.date === todayStr && b.status !== 'Cancelled');
  
  // Total Revenue calculation
  const totalRevenue = bookings
    .filter(b => b.paymentStatus === 'Paid')
    .reduce((sum, b) => sum + b.amount, 0);

  // Today's revenue calculation
  const todayRevenue = bookings
    .filter(b => b.date === todayStr && b.paymentStatus === 'Paid')
    .reduce((sum, b) => sum + b.amount, 0);

  // Month revenue calculation (For June 2026)
  const monthRevenue = bookings
    .filter(b => b.date.startsWith('2026-06') && b.paymentStatus === 'Paid')
    .reduce((sum, b) => sum + b.amount, 0);

  // Derive slots stats for today
  const getSlotGuestsCount = (slot: string) => {
    // 1. Simulated default occupancy
    const [, monthStr, dayStr] = todayStr.split('-');
    const day = parseInt(dayStr, 10) || 4;
    const month = parseInt(monthStr, 10) || 6;
    const hash = (day * 3 + month * 7 + slot.length * 11) % 13;
    const baseOccupancy = Math.min(hash, CAPACITY);

    // 2. Real bookings for today
    const realBookingsCount = bookings
      .filter(b => b.date === todayStr && b.slot === slot && b.status !== 'Cancelled')
      .reduce((sum, b) => sum + b.guests, 0);

    return Math.min(CAPACITY, baseOccupancy + realBookingsCount);
  };

  // Customer Map derivation
  const getCustomers = (): Customer[] => {
    const map = new Map<string, Customer>();
    
    // Seed from real bookings
    bookings.forEach(b => {
      const emailKey = b.email ? b.email.toLowerCase().trim() : '';
      const phoneKey = b.phone ? b.phone.trim() : '';
      const key = emailKey || phoneKey || b.name;
      
      const existing = map.get(key);
      if (existing) {
        existing.totalBookings += 1;
        if (b.paymentStatus === 'Paid') {
          existing.totalSpent += b.amount;
        }
      } else {
        map.set(key, {
          name: b.name,
          email: b.email || 'N/A',
          phone: b.phone,
          totalBookings: 1,
          totalSpent: b.paymentStatus === 'Paid' ? b.amount : 0,
          source: b.source
        });
      }
    });

    // Add manually added customer templates in local storage if any
    const savedManualCustomers = localStorage.getItem('hc_manual_customers');
    if (savedManualCustomers) {
      const parsed: Customer[] = JSON.parse(savedManualCustomers);
      parsed.forEach(c => {
        const key = c.email.toLowerCase().trim() || c.phone.trim() || c.name;
        if (!map.has(key)) {
          map.set(key, c);
        }
      });
    }

    return Array.from(map.values());
  };

  const customersList = getCustomers();

  // Handle forms submissions
  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      date: bookingForm.date,
      route: bookingForm.route,
      slot: bookingForm.slot,
      kayakType: bookingForm.kayakType,
      guests: bookingForm.guests,
      name: bookingForm.name,
      email: bookingForm.email,
      phone: bookingForm.phone,
      status: bookingForm.status,
      paymentStatus: bookingForm.paymentStatus,
      source: bookingForm.source,
      amount: bookingForm.amount
    };
    onAddBooking(data);
    setShowAddBookingModal(false);
    // Reset form
    setBookingForm({
      date: new Date().toISOString().split('T')[0],
      route: 'kadambrayar',
      slot: '8:00 AM',
      kayakType: 'single',
      guests: 2,
      name: '',
      email: '',
      phone: '',
      status: 'Confirmed',
      paymentStatus: 'Paid',
      source: 'WhatsApp',
      amount: 900
    });
  };

  const handleBlockDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (blockDateForm.date) {
      onBlockDate(blockDateForm.date);
      setShowBlockDateModal(false);
      setBlockDateForm({ date: '', reason: '' });
    }
  };

  const handleCloseSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (closeSlotForm.date && closeSlotForm.slot) {
      onCloseSlot(closeSlotForm.date, closeSlotForm.slot);
      setShowCloseSlotModal(false);
      setCloseSlotForm({ date: '', slot: '8:00 AM', reason: '' });
    }
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomer: Customer = {
      name: customerForm.name,
      email: customerForm.email || 'N/A',
      phone: customerForm.phone,
      totalBookings: 0,
      totalSpent: 0,
      source: customerForm.source
    };
    
    const saved = localStorage.getItem('hc_manual_customers');
    const list = saved ? JSON.parse(saved) : [];
    localStorage.setItem('hc_manual_customers', JSON.stringify([...list, newCustomer]));
    
    setShowAddCustomerModal(false);
    setCustomerForm({ name: '', email: '', phone: '', source: 'Phone Call' });
  };

  // QR Scanning Validation execution
  const processScanData = (payload: string, isManualInput: boolean = false) => {
    try {
      // QR payload could be direct Booking ID: "HC-2026-0001" or a JSON payload
      let bookingId = '';
      let token = '';
      if (payload.startsWith('HC-2026-')) {
        bookingId = payload.trim();
      } else {
        const parsed = JSON.parse(payload);
        bookingId = parsed.bookingId;
        token = parsed.token;
      }

      if (!bookingId) {
        setScanResult({
          success: false,
          message: 'Malformed QR Code format. Booking ID not detected.'
        });
        return;
      }

      // Confirm Check-In call
      const res = onConfirmCheckIn(bookingId, token, isManualInput);
      if (res.success && res.booking) {
        setScanResult({
          success: true,
          message: 'Access Granted! Ticket verified and checked-in.',
          booking: res.booking
        });
      } else if (res.message === 'Already Checked In') {
        const b = bookings.find(x => x.id === bookingId);
        setScanResult({
          success: false,
          message: `Duplicate Ticket Warning! Already Checked In.`,
          booking: b,
          alreadyCheckedIn: true,
          checkInTime: res.time || b?.checkInTime,
          checkInDate: res.date || b?.checkInDate
        });
      } else {
        setScanResult({
          success: false,
          message: `Scan Error: ${res.message}`
        });
      }
    } catch (e) {
      // Fallback if payload isn't JSON and not standard code format
      const trimmed = payload.trim();
      if (trimmed) {
        let bookingId = trimmed;
        let token = '';
        if (trimmed.includes(':')) {
          const parts = trimmed.split(':');
          bookingId = parts[0].trim();
          token = parts[1].trim();
        }

        const res = onConfirmCheckIn(bookingId, token, isManualInput);
        if (res.success && res.booking) {
          setScanResult({
            success: true,
            message: 'Access Granted! Booking ID verified and checked-in.',
            booking: res.booking
          });
        } else if (res.message === 'Already Checked In') {
          const b = bookings.find(x => x.id === bookingId);
          setScanResult({
            success: false,
            message: `Duplicate Ticket Warning! Already Checked In.`,
            booking: b,
            alreadyCheckedIn: true,
            checkInTime: res.time || b?.checkInTime,
            checkInDate: res.date || b?.checkInDate
          });
        } else {
          setScanResult({
            success: false,
            message: `Invalid Ticket: ${res.message || 'Verification failed.'}`
          });
        }
      } else {
        setScanResult({
          success: false,
          message: 'Empty scan data payload.'
        });
      }
    }
  };

  const handleStartCamera = () => {
    if (typeof (window as any).Html5Qrcode === 'undefined') return;
    setScanResult(null);
    setScanning(true);

    setTimeout(() => {
      try {
        const html5Qrcode = new (window as any).Html5Qrcode("scanner-view");
        setScannerInst(html5Qrcode);
        html5Qrcode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (width: number, height: number) => {
              const min = Math.min(width, height);
              const box = Math.floor(min * 0.7);
              return { width: box, height: box };
            }
          },
          (decodedText: string) => {
            // Stop and process
            html5Qrcode.stop().then(() => {
              setScanning(false);
              setScannerInst(null);
              processScanData(decodedText, false);
            }).catch((err: any) => console.log(err));
          },
          () => {
            // Quietly poll frames
          }
        ).catch((err: any) => {
          console.error("Camera error: ", err);
          setScanResult({
            success: false,
            message: `Failed to open camera: ${err.message || err}`
          });
          setScanning(false);
          setScannerInst(null);
        });
      } catch (err: any) {
        console.error("Scanner exception: ", err);
        setScanning(false);
      }
    }, 100);
  };

  const handleStopCamera = () => {
    if (scannerInst) {
      scannerInst.stop().then(() => {
        setScanning(false);
        setScannerInst(null);
      }).catch((err: any) => console.log(err));
    } else {
      setScanning(false);
    }
  };

  const handleManualScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualScanInput) {
      processScanData(manualScanInput, true);
      setManualScanInput('');
    }
  };

  const handleSimulateSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val) {
      const b = bookings.find(x => x.id === val);
      if (b) {
        const payload = JSON.stringify({
          bookingId: b.id,
          token: b.securityToken,
          guests: b.guests
        });
        processScanData(payload, false);
      }
      e.target.value = '';
    }
  };

  // Filter Bookings Log
  const filteredBookings = bookings.filter(b => {
    const matchSearch = 
      b.id.toLowerCase().includes(bookingsSearch.toLowerCase()) ||
      b.name.toLowerCase().includes(bookingsSearch.toLowerCase()) ||
      (b.phone && b.phone.includes(bookingsSearch));
    
    const matchStatus = bookingsFilterStatus === 'All' || b.status === bookingsFilterStatus;
    const matchDate = !bookingsFilterDate || b.date === bookingsFilterDate;

    return matchSearch && matchStatus && matchDate;
  });

  const paginatedBookings = filteredBookings.slice(
    (bookingsPage - 1) * bookingsPerPage,
    bookingsPage * bookingsPerPage
  );

  const bookingsTotalPages = Math.ceil(filteredBookings.length / bookingsPerPage) || 1;

  // Filter Customers
  const filteredCustomers = customersList.filter(c => {
    return c.name.toLowerCase().includes(customersSearch.toLowerCase()) ||
      (c.phone && c.phone.includes(customersSearch)) ||
      (c.email && c.email.toLowerCase().includes(customersSearch.toLowerCase()));
  });

  const paginatedCustomers = filteredCustomers.slice(
    (customersPage - 1) * customersPerPage,
    customersPage * customersPerPage
  );

  const customersTotalPages = Math.ceil(filteredCustomers.length / customersPerPage) || 1;

  // Filter Payments
  const filteredPayments = bookings.filter(b => {
    const matchSearch = 
      b.id.toLowerCase().includes(paymentsSearch.toLowerCase()) ||
      b.name.toLowerCase().includes(paymentsSearch.toLowerCase());
    return matchSearch && b.paymentStatus === 'Paid';
  });

  const paginatedPayments = filteredPayments.slice(
    (paymentsPage - 1) * paymentsPerPage,
    paymentsPage * paymentsPerPage
  );

  const paymentsTotalPages = Math.ceil(filteredPayments.length / paymentsPerPage) || 1;

  // Selected Booking expanded object

  const handleSendWhatsApp = (b: Booking) => {
    const routeNames: Record<string, string> = {
      kadambrayar: 'Kadambrayar River Expedition',
      vembanad: 'Vembanad Backwater Odyssey',
      kadamakudy: 'Kadamakudy Village Explorer'
    };
    
    const formattedDate = new Date(b.date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const boardingUrl = `https://visitkadambrayar.com/boarding-pass?id=${b.id}&token=${b.securityToken}&name=${encodeURIComponent(b.name)}&route=${b.route}&slot=${encodeURIComponent(b.slot)}&date=${b.date}&guests=${b.guests}&kayak=${b.kayakType}&amount=${b.amount}`;

    const message = `Hi ${b.name} 👋\n\nYour kayaking adventure has been confirmed.\n\nBooking ID:\n${b.id}\n\nRoute:\n${routeNames[b.route] || b.route}\n\nDate:\n${formattedDate}\n\nTime:\n${b.slot}\n\nGuests:\n${b.guests}\n\nPlease show the QR code at check-in.\n\nOpen Boarding Pass & QR Ticket Link:\n${boardingUrl}\n\nSee you on the water! 🚣`;

    let cleaned = b.phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    
    window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Helper for route name formatting
  const getRouteName = (routeId: string) => {
    const found = ROUTES.find(r => r.id === routeId);
    return found ? found.name : routeId;
  };

  return (
    <div className="flex min-h-screen bg-[#E8E3D8] text-[#0D0D0D] font-sans antialiased overflow-x-hidden relative">
      
      {/* Mobile Sidebar Backdrop Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* ──── SIDEBAR ──── */}
      <aside className={`w-72 bg-premium-dark-grain text-[#E8E3D8] flex flex-col justify-between flex-shrink-0 z-40 transition-transform duration-300 fixed inset-y-0 left-0 lg:static lg:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Top Logo and Title */}
        <div>
          <div className="p-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md">
              <span className="text-xl font-black tracking-tighter text-white">HC</span>
            </div>
            <div>
              <h1 className="font-extrabold tracking-tight text-lg leading-tight text-white">Hooked & Cooked</h1>
              <span className="text-[10px] uppercase tracking-widest text-[#73E6D8] font-bold">Control Hub</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-4 pl-6 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'bookings', label: 'Bookings Log', icon: Calendar },
              { id: 'customers', label: 'Customers', icon: Users },
              { id: 'payments', label: 'Payments View', icon: CreditCard },
              { id: 'overrides', label: 'Slot Overrides', icon: CalendarRange },
              { id: 'scanner', label: 'Ticket Scanner', icon: QrCode },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setSelectedBookingId(null);
                    setScanResult(null);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full py-4 px-6 flex items-center gap-4 text-sm font-semibold transition-all duration-300 rounded-l-3xl relative cursor-pointer outline-none group ${
                    isActive 
                      ? 'bg-[#E8E3D8] text-[#0D2B35] shadow-[-10px_0_0_#E8E3D8] sidebar-active-tab' 
                      : 'text-white/80 hover:text-white hover:bg-white/5'
                  }`}
                  style={isActive ? {
                    borderTopRightRadius: '0px',
                    borderBottomRightRadius: '0px'
                  } : {}}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                  <span>{tab.label}</span>
                  
                  {/* Notch styling helpers applied via absolute classes for reliability in Tailwind CSS v4 */}
                  {isActive && (
                    <>
                      <div className="absolute -top-[20px] right-0 w-5 h-5 bg-[#E8E3D8] rounded-br-2xl pointer-events-none after:content-['']" />
                      <div className="absolute -bottom-[20px] right-0 w-5 h-5 bg-[#E8E3D8] rounded-tr-2xl pointer-events-none" />
                    </>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer and Back home button */}
        <div className="p-8 space-y-6">
          {/* Quick Actions List Widget inside sidebar */}
          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-white/50 block mb-3">Quick Actions</span>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setShowAddBookingModal(true)} 
                className="w-full text-left py-2 px-3 rounded-lg text-xs font-semibold hover:bg-white/10 flex items-center justify-between transition cursor-pointer"
              >
                <span>+ Manual Booking</span>
                <span className="opacity-40">→</span>
              </button>
              <button 
                onClick={() => setShowBlockDateModal(true)} 
                className="w-full text-left py-2 px-3 rounded-lg text-xs font-semibold hover:bg-white/10 flex items-center justify-between transition cursor-pointer"
              >
                <span>+ Block Date</span>
                <span className="opacity-40">→</span>
              </button>
              <button 
                onClick={() => setShowCloseSlotModal(true)} 
                className="w-full text-left py-2 px-3 rounded-lg text-xs font-semibold hover:bg-white/10 flex items-center justify-between transition cursor-pointer"
              >
                <span>+ Close Slot</span>
                <span className="opacity-40">→</span>
              </button>
              <button 
                onClick={() => setShowAddCustomerModal(true)} 
                className="w-full text-left py-2 px-3 rounded-lg text-xs font-semibold hover:bg-white/10 flex items-center justify-between transition cursor-pointer"
              >
                <span>+ Add Customer</span>
                <span className="opacity-40">→</span>
              </button>
            </div>
          </div>

          <button 
            onClick={() => onNavigate('/')}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white text-[#0D2B35] text-xs font-extrabold hover:bg-white/90 shadow-md transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Go to Public Site</span>
          </button>
          
          <div className="flex items-center justify-center gap-4 text-white/50 text-[10px] font-semibold border-t border-white/10 pt-4">
            <a href="#facebook" className="hover:text-white transition">Facebook</a>
            <span>•</span>
            <a href="#twitter" className="hover:text-white transition">Twitter</a>
            <span>•</span>
            <a href="#google" className="hover:text-white transition">Google</a>
          </div>
        </div>
      </aside>

      {/* ──── MAIN CONTENT AREA ──── */}
      <main className="flex-1 min-h-screen flex flex-col relative z-20 w-full overflow-x-hidden">
        
        {/* Top Header */}
        <header className="px-4 py-4 md:px-10 md:py-6 border-b border-gray-200/50 flex justify-between items-center bg-white/20 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-1 text-gray-700 hover:text-[#0D2B35] lg:hidden cursor-pointer rounded-xl bg-white border border-gray-200/50 shadow-sm outline-none"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-[#0D0D0D] capitalize">
                {activeTab === 'overrides' ? 'Slot Overrides' : activeTab === 'scanner' ? 'Ticket Scanner' : activeTab}
              </h2>
              <p className="text-[10px] md:text-xs text-gray-500 font-medium mt-0.5">
                Hooked & Cooked Backoffice Ops Panel
              </p>
            </div>
          </div>
          
          {/* Realtime clock status */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex bg-[#C8A86B]/10 border border-[#C8A86B]/20 rounded-xl px-4 py-2 items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#C8A86B] animate-pulse" />
              <span className="text-xs font-bold text-[#C8A86B] font-mono">Operations Day: June 4, 2026</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs font-bold text-gray-800 block">Operator Admin</span>
                <span className="text-[10px] text-gray-400 block font-medium">Duty Desk</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#0D2B35] flex items-center justify-center text-white font-extrabold text-sm border-2 border-white shadow-md">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Tab Pages content frame */}
        <div className="p-4 sm:p-10 flex-1 overflow-y-auto max-w-[1600px] w-full mx-auto">
          
          {/* ───────────────── OVERVIEW / DASHBOARD TAB ───────────────── */}
          {activeTab === 'dashboard' && (
            <div className="space-y-10">
              
              {/* Financial/Volume Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Card: Today Revenue */}
                <div className="bg-white rounded-3xl p-6 border border-gray-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] transition group">
                  <div className="flex justify-between items-start">
                    <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-wider">
                      Today
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm font-semibold text-gray-400 block">Today's Revenue</span>
                    <span className="text-3xl font-black text-gray-900 mt-1 block">
                      ₹{todayRevenue.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Live Operations Tracking
                    </span>
                  </div>
                </div>

                {/* Card: Month Revenue */}
                <div className="bg-white rounded-3xl p-6 border border-gray-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] transition">
                  <div className="flex justify-between items-start">
                    <div className="bg-[#0D2B35]/5 p-3 rounded-2xl text-[#0D2B35]">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold text-[#0D2B35] bg-[#0D2B35]/5 px-2 py-1 rounded-full uppercase tracking-wider">
                      This Month
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm font-semibold text-gray-400 block">This Month</span>
                    <span className="text-3xl font-black text-gray-900 mt-1 block">
                      ₹{monthRevenue.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold block mt-2">
                      Operations month of June 2026
                    </span>
                  </div>
                </div>

                {/* Card: Lifetime Revenue */}
                <div className="bg-white rounded-3xl p-6 border border-gray-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] transition">
                  <div className="flex justify-between items-start">
                    <div className="bg-[#C8A86B]/10 p-3 rounded-2xl text-[#C8A86B]">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold text-[#C8A86B] bg-[#C8A86B]/10 px-2 py-1 rounded-full uppercase tracking-wider">
                      Cumulative
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm font-semibold text-gray-400 block">Total Revenue</span>
                    <span className="text-3xl font-black text-gray-900 mt-1 block">
                      ₹{totalRevenue.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold block mt-2">
                      Total historical sales record
                    </span>
                  </div>
                </div>

              </div>

              {/* Operations Visualizations and Occupancy Block Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Operations Load column */}
                <div className="xl:col-span-2 bg-white rounded-3xl p-8 border border-gray-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-black text-gray-900">Today's Operations Panel</h3>
                      <p className="text-xs text-gray-400 font-semibold mt-0.5">Schedule occupancy for June 4, 2026</p>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setActiveTab('scanner');
                        handleStartCamera();
                      }}
                      className="flex items-center gap-2 bg-[#0D2B35] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#0D2B35]/90 transition"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Start QR Boarding Feed</span>
                    </button>
                  </div>

                  {/* List of Today's Slots with Occupancy visual bar indicator */}
                  <div className="space-y-4">
                    {SLOTS.map((time) => {
                      const occupancy = getSlotGuestsCount(time);
                      const isFull = occupancy >= CAPACITY;
                      const percent = (occupancy / CAPACITY) * 100;
                      
                      return (
                        <div key={time} className="p-5 rounded-2xl bg-[#E8E3D8]/60 border border-gray-200/40 hover:border-gray-200 transition">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#0D2B35]/10 flex items-center justify-center text-[#0D2B35]">
                                <Clock className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-extrabold text-sm text-gray-900">{time}</span>
                                <span className="text-[10px] text-gray-400 block font-bold">Standard Run Route Capacity</span>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              {isFull ? (
                                <span className="text-[10px] font-black tracking-wider uppercase text-rose-500 bg-rose-50 px-2.5 py-1 rounded-md">
                                  RUN COMPLETELY FULL
                                </span>
                              ) : (
                                <span className="text-xs font-extrabold text-gray-800">
                                  {occupancy} / {CAPACITY} Paddlers Filled
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Interactive seat visualization blocks - 12 segments grid */}
                          <div className="flex items-center justify-between gap-4 mt-2">
                            <div className="flex-1 flex gap-0.5 sm:gap-1.5">
                              {Array.from({ length: CAPACITY }).map((_, idx) => {
                                const isFilled = idx < occupancy;
                                return (
                                  <div 
                                    key={idx}
                                    className={`h-4 flex-1 rounded-[4px] transition-all duration-300 ${
                                      isFilled 
                                        ? isFull 
                                          ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]' 
                                          : 'bg-[#0D2B35]' 
                                        : 'bg-gray-200/80'
                                    }`}
                                    title={isFilled ? `Seat ${idx+1} Occupied` : `Seat ${idx+1} Available`}
                                  />
                                );
                              })}
                            </div>
                            
                            <div className="w-12 text-right">
                              <span className={`text-xs font-black font-mono ${isFull ? 'text-rose-500' : 'text-[#0D2B35]'}`}>
                                {Math.round(percent)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Operations side panel: Today's Log summary list */}
                <div className="bg-white rounded-3xl p-8 border border-gray-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Today's Scheduled Runs</h3>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5">Guide dashboard tracker overview</p>
                  </div>

                  {todayBookings.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-xs">
                      No active bookings registered for today.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                      {todayBookings.map((b) => (
                        <div 
                          key={b.id} 
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            b.status === 'Checked In' 
                              ? 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-200' 
                              : 'bg-blue-50/20 border-blue-50/50 hover:border-blue-100'
                          }`}
                          onClick={() => {
                            setSelectedBookingId(b.id);
                            setActiveTab('bookings');
                          }}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-mono font-black text-[#0D2B35]">
                              {b.id}
                            </span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              b.status === 'Checked In' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {b.status}
                            </span>
                          </div>
                          
                          <div className="text-xs">
                            <span className="font-extrabold text-gray-900 block">{b.name}</span>
                            <span className="text-[10px] text-gray-500 mt-1 block flex items-center justify-between">
                              <span>{getRouteName(b.route)} ({b.slot})</span>
                              <span className="font-extrabold text-gray-700">{b.guests} Guests</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="border-t border-gray-100 pt-4 text-center">
                    <button 
                      onClick={() => setShowAddBookingModal(true)}
                      className="w-full text-center text-xs font-bold text-[#0D2B35] hover:underline"
                    >
                      + Register Manual Booking Override
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ───────────────── BOOKINGS LOG TAB ───────────────── */}
          {activeTab === 'bookings' && (
            <div className="space-y-8">
              
              {/* Controls bar */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-6 rounded-3xl border border-gray-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full md:w-auto">
                  
                  {/* Search box */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Search ID, Customer, Phone..."
                      value={bookingsSearch}
                      onChange={(e) => {
                        setBookingsSearch(e.target.value);
                        setBookingsPage(1);
                      }}
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs w-full focus:outline-none focus:border-[#0D2B35] bg-[#E8E3D8]/40"
                    />
                  </div>

                  {/* Status filter */}
                  <select 
                    value={bookingsFilterStatus} 
                    onChange={(e) => {
                      setBookingsFilterStatus(e.target.value);
                      setBookingsPage(1);
                    }}
                    className="border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#0D2B35] bg-white cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Checked In">Checked In</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  {/* Date Picker */}
                  <input 
                    type="date"
                    value={bookingsFilterDate}
                    onChange={(e) => {
                      setBookingsFilterDate(e.target.value);
                      setBookingsPage(1);
                    }}
                    className="border border-gray-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#0D2B35] bg-white"
                  />
                  
                  {bookingsFilterDate && (
                    <button 
                      onClick={() => setBookingsFilterDate('')}
                      className="text-xs text-rose-500 hover:underline font-bold"
                    >
                      Clear Date
                    </button>
                  )}

                </div>

                <button 
                  onClick={() => setShowAddBookingModal(true)}
                  className="flex items-center gap-2 bg-[#0D2B35] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#0D2B35]/90 transition w-full md:w-auto justify-center cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Manual Booking</span>
                </button>

              </div>

              {/* Two Column Layout if details open */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Bookings table list */}
                <div className={`${selectedBookingId ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white rounded-3xl border border-gray-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-300`}>
                  
                  {/* Mobile Card-based List (block md:hidden) */}
                  <div className="block md:hidden divide-y divide-gray-100">
                    {paginatedBookings.length === 0 ? (
                      <div className="text-center py-12 text-gray-400 font-semibold">
                        No bookings found matching filter queries.
                      </div>
                    ) : (
                      paginatedBookings.map((b) => {
                        const isSelected = selectedBookingId === b.id;
                        return (
                          <div 
                            key={b.id} 
                            onClick={() => setSelectedBookingId(b.id)}
                            className={`p-4 hover:bg-gray-50/50 transition-colors cursor-pointer space-y-2.5 ${
                              isSelected ? 'bg-blue-50/30' : ''
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-mono font-black text-[#0D2B35] text-[11px]">{b.id}</span>
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                b.status === 'Checked In' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : b.status === 'Confirmed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : b.status === 'Pending'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-rose-100 text-rose-800'
                              }`}>
                                {b.status}
                              </span>
                            </div>
                            <div className="text-xs text-gray-800">
                              <span className="font-extrabold text-gray-900 text-sm block">{b.name}</span>
                              <div className="text-gray-500 font-medium mt-1 truncate max-w-[280px]">
                                {getRouteName(b.route)}
                              </div>
                              <div className="text-gray-400 mt-0.5">
                                {b.slot} • {b.kayakType} • {new Date(b.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </div>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t border-gray-50">
                              <span className="font-extrabold text-gray-900">₹{b.amount.toLocaleString('en-IN')}</span>
                              <button className="text-xs font-bold text-[#0D2B35] hover:underline">
                                Inspect →
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Desktop Table view (hidden md:block) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-wider">
                          <th className="py-4 px-6">ID</th>
                          <th className="py-4 px-6">Customer</th>
                          <th className="py-4 px-6">Route & Slot</th>
                          <th className="py-4 px-6">Date</th>
                          <th className="py-4 px-6">Price</th>
                          <th className="py-4 px-6">Status</th>
                          <th className="py-4 px-6">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs">
                        {paginatedBookings.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-16 text-gray-400 font-semibold">
                              No bookings found matching filter queries.
                            </td>
                          </tr>
                        ) : (
                          paginatedBookings.map((b) => {
                            const isSelected = selectedBookingId === b.id;
                            return (
                              <tr 
                                key={b.id} 
                                className={`hover:bg-gray-50/80 transition-colors cursor-pointer group ${
                                  isSelected ? 'bg-blue-50/30' : ''
                                }`}
                                onClick={() => setSelectedBookingId(b.id)}
                              >
                                <td className="py-4 px-6 font-mono font-black text-[#0D2B35]">
                                  {b.id}
                                </td>
                                <td className="py-4 px-6">
                                  <span className="font-extrabold text-gray-900 block">{b.name}</span>
                                  <span className="text-[10px] text-gray-400 block mt-0.5">{b.phone}</span>
                                </td>
                                <td className="py-4 px-6">
                                  <span className="font-bold text-gray-800 block truncate max-w-[200px]">
                                    {getRouteName(b.route)}
                                  </span>
                                  <span className="text-[10px] text-gray-500 block mt-0.5 font-semibold">
                                    {b.slot} • {b.kayakType}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-gray-600 font-medium">
                                  {new Date(b.date).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </td>
                                <td className="py-4 px-6 font-extrabold text-gray-900">
                                  ₹{b.amount.toLocaleString('en-IN')}
                                </td>
                                <td className="py-4 px-6">
                                  <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md inline-block ${
                                    b.status === 'Checked In' 
                                      ? 'bg-emerald-100 text-emerald-800' 
                                      : b.status === 'Confirmed'
                                        ? 'bg-blue-100 text-blue-800'
                                        : b.status === 'Pending'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-rose-100 text-rose-800'
                                  }`}>
                                    {b.status}
                                  </span>
                                </td>
                                <td className="py-4 px-6">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedBookingId(b.id);
                                    }}
                                    className="text-xs font-bold text-[#0D2B35] hover:underline"
                                  >
                                    Inspect
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination footer */}
                  {filteredBookings.length > 0 && (
                    <div className="bg-gray-50/50 border-t border-gray-100 px-6 py-4 flex justify-between items-center">
                      <span className="text-xs text-gray-400 font-semibold">
                        Showing {Math.min(filteredBookings.length, (bookingsPage - 1) * bookingsPerPage + 1)}–
                        {Math.min(filteredBookings.length, bookingsPage * bookingsPerPage)} of {filteredBookings.length} bookings
                      </span>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setBookingsPage(p => Math.max(1, p - 1))}
                          disabled={bookingsPage === 1}
                          className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-900 disabled:opacity-30 hover:bg-white transition cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        {Array.from({ length: bookingsTotalPages }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setBookingsPage(i + 1)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                              bookingsPage === i + 1 
                                ? 'bg-[#0D2B35] text-white' 
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}

                        <button 
                          onClick={() => setBookingsPage(p => Math.min(bookingsTotalPages, p + 1))}
                          disabled={bookingsPage === bookingsTotalPages}
                          className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-900 disabled:opacity-30 hover:bg-white transition cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                </div>

                {/* Inspect Details panel */}
                {selectedBookingId && selectedBooking && (
                  <>
                    <div 
                      className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
                      onClick={() => setSelectedBookingId(null)}
                    />
                    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-lg max-h-[85vh] overflow-y-auto lg:sticky lg:top-24 lg:left-auto lg:translate-x-0 lg:translate-y-0 lg:z-0 lg:max-h-[calc(100vh-120px)] lg:w-auto bg-white rounded-3xl border border-gray-200/50 shadow-2xl lg:shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-6 space-y-6 lg:self-start relative animate-scale-up lg:animate-none">
                      <button 
                      onClick={() => setSelectedBookingId(null)}
                      className="absolute top-6 right-6 p-1 rounded-full text-gray-400 hover:bg-gray-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div>
                      <span className="text-[10px] font-mono font-black text-[#0D2B35] block mb-1">
                        {selectedBooking.id}
                      </span>
                      <h4 className="text-lg font-black text-gray-900 leading-tight">
                        {selectedBooking.name}
                      </h4>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mt-1 tracking-wider">
                        Registered Booking Dossier
                      </span>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Booking QR Code display */}
                    <div className="flex flex-col items-center p-4 bg-[#E8E3D8]/40 border border-gray-100 rounded-2xl">
                      <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-3">
                        Dynamic Check-In Ticket Code
                      </span>
                      
                      {selectedQrUrl ? (
                        <img 
                          src={selectedQrUrl}
                          alt="Check In QR"
                          className="w-36 h-36 bg-white p-1 rounded-lg border shadow-sm"
                        />
                      ) : (
                        <div className="w-36 h-36 flex items-center justify-center bg-white rounded-lg border shadow-sm text-xs font-bold text-gray-400 animate-pulse">
                          Generating QR...
                        </div>
                      )}
                      
                      <span className="text-[9px] font-mono text-gray-400 mt-2">
                        Code generates live scannable payload
                      </span>
                    </div>

                    {/* Particulars details info grid */}
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between py-1 border-b border-gray-100/50">
                        <span className="text-gray-400 font-medium">Selected Route:</span>
                        <span className="font-extrabold text-gray-800">{getRouteName(selectedBooking.route)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100/50">
                        <span className="text-gray-400 font-medium">Session Slot:</span>
                        <span className="font-extrabold text-gray-800">{selectedBooking.slot}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100/50">
                        <span className="text-gray-400 font-medium">Date & Type:</span>
                        <span className="font-extrabold text-gray-800">{selectedBooking.date} ({selectedBooking.kayakType})</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100/50">
                        <span className="text-gray-400 font-medium">Passenger Guests:</span>
                        <span className="font-extrabold text-gray-800">{selectedBooking.guests} Paddlers</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100/50">
                        <span className="text-gray-400 font-medium">Contact Phone:</span>
                        <span className="font-extrabold text-gray-800">{selectedBooking.phone}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100/50">
                        <span className="text-gray-400 font-medium">Email Log:</span>
                        <span className="font-extrabold text-gray-800 truncate max-w-[150px]">{selectedBooking.email}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100/50">
                        <span className="text-gray-400 font-medium">Operational Source:</span>
                        <span className="font-extrabold text-[#0D2B35] bg-blue-50 px-2 py-0.5 rounded-full text-[9px] uppercase font-black">
                          {selectedBooking.source}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100/50">
                        <span className="text-gray-400 font-medium">Amount Paid:</span>
                        <span className="font-black text-gray-900">₹{selectedBooking.amount}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100/50 items-center">
                        <span className="text-gray-400 font-medium">Payment State:</span>
                        <select 
                          value={selectedBooking.paymentStatus}
                          onChange={(e) => {
                            const updated = { ...selectedBooking, paymentStatus: e.target.value as any };
                            onUpdateBooking(updated);
                          }}
                          className="bg-gray-50 border border-gray-200 rounded px-2 py-1 font-bold text-gray-800 focus:outline-none"
                        >
                          <option value="Paid">Paid</option>
                          <option value="Unpaid">Unpaid</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      </div>
                      
                      {selectedBooking.status === 'Checked In' && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 mt-4 text-[11px] text-emerald-800 leading-relaxed">
                          <div className="font-extrabold flex items-center gap-1.5 mb-1 text-emerald-900">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Check-In Verified
                          </div>
                          Boarded at {selectedBooking.checkInTime} on {selectedBooking.checkInDate}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 space-y-2">
                      {selectedBooking.status !== 'Checked In' && selectedBooking.status !== 'Cancelled' && (
                        <button 
                          onClick={() => {
                            const res = onConfirmCheckIn(selectedBooking.id, undefined, true);
                            if (res.success) {
                              setScanResult({
                                success: true,
                                message: 'Check-In recorded successfully!',
                                booking: res.booking
                              });
                            }
                          }}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer"
                        >
                          Confirm Boat Check-In
                        </button>
                      )}

                      {selectedBooking.status !== 'Cancelled' && (
                        <button 
                          onClick={() => handleSendWhatsApp(selectedBooking)}
                          className="w-full py-2.5 bg-[#00a884] hover:bg-[#00a884]/95 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          Send WhatsApp Confirmation
                        </button>
                      )}

                      {selectedBooking.status !== 'Cancelled' ? (
                        <button 
                          onClick={() => {
                            const updated = { ...selectedBooking, status: 'Cancelled' as const };
                            onUpdateBooking(updated);
                          }}
                          className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-extrabold transition cursor-pointer"
                        >
                          Cancel Booking Order
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            const updated = { ...selectedBooking, status: 'Confirmed' as const };
                            onUpdateBooking(updated);
                          }}
                          className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-extrabold transition cursor-pointer"
                        >
                          Restore Booking Order
                        </button>
                      )}
                    </div>

                    </div>
                  </>
                )}

              </div>

            </div>
          )}

          {/* ───────────────── CUSTOMERS TAB ───────────────── */}
          {activeTab === 'customers' && (
            <div className="space-y-8">
              
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-6 rounded-3xl border border-gray-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search Customers Directory..."
                    value={customersSearch}
                    onChange={(e) => {
                      setCustomersSearch(e.target.value);
                      setCustomersPage(1);
                    }}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs w-full focus:outline-none focus:border-[#0D2B35] bg-[#E8E3D8]/40"
                  />
                </div>
                
                <button 
                  onClick={() => setShowAddCustomerModal(true)}
                  className="flex items-center gap-2 bg-[#0D2B35] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#0D2B35]/90 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Customer Directory Profile</span>
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-gray-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
                
                {/* Mobile Card-based List (block md:hidden) */}
                <div className="block md:hidden divide-y divide-gray-100">
                  {paginatedCustomers.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 font-semibold">
                      No customer entries recorded.
                    </div>
                  ) : (
                    paginatedCustomers.map((c, idx) => (
                      <div key={idx} className="p-4 space-y-2 hover:bg-gray-50/50 transition">
                        <div className="flex justify-between items-start">
                          <span className="font-extrabold text-gray-900 text-sm">{c.name}</span>
                          <span className="bg-[#C8A86B]/10 text-[#C8A86B] px-2 py-0.5 rounded-full text-[9px] uppercase font-black tracking-wide">
                            {c.source}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 font-medium space-y-1">
                          <div>Phone: <span className="text-gray-800 font-semibold">{c.phone}</span></div>
                          {c.email && c.email !== 'N/A' && <div>Email: <span className="text-gray-800 font-semibold break-all">{c.email}</span></div>}
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-50 text-xs">
                          <span className="text-gray-400 font-medium">Bookings: <strong className="text-gray-900 font-bold">{c.totalBookings}</strong></span>
                          <span className="text-gray-400 font-medium">Spent: <strong className="text-gray-900 font-black">₹{c.totalSpent.toLocaleString('en-IN')}</strong></span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop Table view (hidden md:block) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-wider">
                        <th className="py-4 px-6">Customer Name</th>
                        <th className="py-4 px-6">Phone Number</th>
                        <th className="py-4 px-6">Email Address</th>
                        <th className="py-4 px-6 text-center">Total Bookings</th>
                        <th className="py-4 px-6 text-right">Aggregate Spent</th>
                        <th className="py-4 px-6">Original Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs text-gray-800">
                      {paginatedCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-16 text-gray-400 font-semibold">
                            No customer entries recorded.
                          </td>
                        </tr>
                      ) : (
                        paginatedCustomers.map((c, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50 transition">
                            <td className="py-4 px-6 font-extrabold text-gray-900">
                              {c.name}
                            </td>
                            <td className="py-4 px-6 font-semibold">
                              {c.phone}
                            </td>
                            <td className="py-4 px-6 text-gray-600 font-medium">
                              {c.email}
                            </td>
                            <td className="py-4 px-6 text-center font-bold text-gray-900">
                              {c.totalBookings}
                            </td>
                            <td className="py-4 px-6 text-right font-black text-gray-900">
                              ₹{c.totalSpent.toLocaleString('en-IN')}
                            </td>
                            <td className="py-4 px-6">
                              <span className="bg-[#C8A86B]/10 text-[#C8A86B] px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black tracking-wide">
                                {c.source}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredCustomers.length > 0 && (
                  <div className="bg-gray-50/50 border-t border-gray-100 px-6 py-4 flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-semibold">
                      Showing {Math.min(filteredCustomers.length, (customersPage - 1) * customersPerPage + 1)}–
                      {Math.min(filteredCustomers.length, customersPage * customersPerPage)} of {filteredCustomers.length} profiles
                    </span>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setCustomersPage(p => Math.max(1, p - 1))}
                        disabled={customersPage === 1}
                        className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-900 disabled:opacity-30 hover:bg-white transition cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      {Array.from({ length: customersTotalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCustomersPage(i + 1)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                            customersPage === i + 1 
                              ? 'bg-[#0D2B35] text-white' 
                              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button 
                        onClick={() => setCustomersPage(p => Math.min(customersTotalPages, p + 1))}
                        disabled={customersPage === customersTotalPages}
                        className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-900 disabled:opacity-30 hover:bg-white transition cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ───────────────── PAYMENTS VIEW TAB ───────────────── */}
          {activeTab === 'payments' && (
            <div className="space-y-8">
              
              <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                <div className="relative w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search Payments Ledger..."
                    value={paymentsSearch}
                    onChange={(e) => {
                      setPaymentsSearch(e.target.value);
                      setPaymentsPage(1);
                    }}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs w-full focus:outline-none focus:border-[#0D2B35] bg-[#E8E3D8]/40"
                  />
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block">Operational Ledger Value</span>
                  <span className="text-lg font-black text-emerald-600 mt-0.5 block">
                    ₹{totalRevenue.toLocaleString('en-IN')} Total Paid
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
                
                {/* Mobile Card-based List (block md:hidden) */}
                <div className="block md:hidden divide-y divide-gray-100">
                  {paginatedPayments.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 font-semibold">
                      No paid transactions matching search logs.
                    </div>
                  ) : (
                    paginatedPayments.map((b) => (
                      <div key={b.id} className="p-4 space-y-2 hover:bg-gray-50/50 transition">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-black text-[#0D2B35] text-xs">{b.id}</span>
                          <span className="text-emerald-800 bg-emerald-100 font-black uppercase tracking-wider text-[9px] px-2 py-0.5 rounded">
                            {b.paymentStatus}
                          </span>
                        </div>
                        <div className="text-xs text-gray-800">
                          <span className="font-extrabold text-gray-900 text-sm block">{b.name}</span>
                          <div className="text-gray-400 font-semibold mt-1">
                            Date: {new Date(b.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="mt-1">
                            <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">
                              {b.source === 'Online' ? 'Razorpay Sandbox' : `${b.source} Override`}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-50 text-xs">
                          <span className="text-gray-400 font-medium">Paid Amount:</span>
                          <span className="font-black text-gray-900">₹{b.amount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop Table view (hidden md:block) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-wider">
                        <th className="py-4 px-6">Booking Transaction ID</th>
                        <th className="py-4 px-6">Paddler Client</th>
                        <th className="py-4 px-6">Booking Date</th>
                        <th className="py-4 px-6">Channel Gateway</th>
                        <th className="py-4 px-6">Payment Status</th>
                        <th className="py-4 px-6 text-right">Paid Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs text-gray-800">
                      {paginatedPayments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-16 text-gray-400 font-semibold">
                            No paid transactions matching search logs.
                          </td>
                        </tr>
                      ) : (
                        paginatedPayments.map((b) => (
                          <tr key={b.id} className="hover:bg-gray-50/50 transition">
                            <td className="py-4 px-6 font-mono font-black text-[#0D2B35]">
                              {b.id}
                            </td>
                            <td className="py-4 px-6 font-extrabold text-gray-900">
                              {b.name}
                            </td>
                            <td className="py-4 px-6 font-medium text-gray-500">
                              {new Date(b.date).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </td>
                            <td className="py-4 px-6">
                              <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">
                                {b.source === 'Online' ? 'Razorpay Sandbox' : `${b.source} Override`}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-emerald-800 bg-emerald-100 font-black uppercase tracking-wider text-[9px] px-2 py-0.5 rounded">
                                {b.paymentStatus}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right font-black text-gray-900">
                              ₹{b.amount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredPayments.length > 0 && (
                  <div className="bg-gray-50/50 border-t border-gray-100 px-6 py-4 flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-semibold">
                      Showing {Math.min(filteredPayments.length, (paymentsPage - 1) * paymentsPerPage + 1)}–
                      {Math.min(filteredPayments.length, paymentsPage * paymentsPerPage)} of {filteredPayments.length} records
                    </span>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setPaymentsPage(p => Math.max(1, p - 1))}
                        disabled={paymentsPage === 1}
                        className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-900 disabled:opacity-30 hover:bg-white transition cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      {Array.from({ length: paymentsTotalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPaymentsPage(i + 1)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                            paymentsPage === i + 1 
                              ? 'bg-[#0D2B35] text-white' 
                              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button 
                        onClick={() => setPaymentsPage(p => Math.min(paymentsTotalPages, p + 1))}
                        disabled={paymentsPage === paymentsTotalPages}
                        className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-900 disabled:opacity-30 hover:bg-white transition cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ───────────────── OVERRIDES & SLOT CONFIG TAB ───────────────── */}
          {activeTab === 'overrides' && (
            <div className="space-y-10">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Section: Block Entire Dates */}
                <div className="bg-white rounded-3xl p-8 border border-gray-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Date Block Override Console</h3>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5">Completely block bookings on selected dates</p>
                  </div>

                  <form onSubmit={handleBlockDate} className="flex gap-3">
                    <input 
                      type="date"
                      required
                      value={blockDateForm.date}
                      onChange={(e) => setBlockDateForm(prev => ({ ...prev, date: e.target.value }))}
                      className="border border-gray-200 rounded-xl px-4 py-2.5 text-xs flex-1 focus:outline-none focus:border-[#0D2B35]"
                    />
                    <button 
                      type="submit"
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
                    >
                      Block Selected Date
                    </button>
                  </form>

                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block">Blocked Dates Ledger</span>
                    {blockedDates.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50/50 rounded-xl border border-dashed border-gray-100 text-gray-400 text-xs font-semibold">
                        No active date blocks registered.
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {blockedDates.map((date) => (
                          <div key={date} className="py-3 flex justify-between items-center text-xs">
                            <span className="font-extrabold text-gray-800">
                              {new Date(date).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                            
                            <button 
                              onClick={() => onUnblockDate(date)}
                              className="text-xs text-emerald-600 font-bold hover:underline"
                            >
                              Unblock Date
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section: Close Specific Slots */}
                <div className="bg-white rounded-3xl p-8 border border-gray-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Slot-Specific Shut Down</h3>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5">Shut down specific slots for groups or guides availability</p>
                  </div>

                  <form onSubmit={handleCloseSlot} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="date"
                        required
                        value={closeSlotForm.date}
                        onChange={(e) => setCloseSlotForm(prev => ({ ...prev, date: e.target.value }))}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#0D2B35]"
                      />
                      
                      <select
                        value={closeSlotForm.slot}
                        onChange={(e) => setCloseSlotForm(prev => ({ ...prev, slot: e.target.value }))}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-xs bg-white focus:outline-none focus:border-[#0D2B35]"
                      >
                        {SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-[#0D2B35] hover:bg-[#0D2B35]/95 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
                    >
                      Shut Down Slot Session
                    </button>
                  </form>

                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block">Closed Slots Ledger</span>
                    {closedSlots.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50/50 rounded-xl border border-dashed border-gray-100 text-gray-400 text-xs font-semibold">
                        No closed slot sessions.
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {closedSlots.map((cs, idx) => (
                          <div key={idx} className="py-3 flex justify-between items-center text-xs">
                            <div>
                              <span className="font-extrabold text-gray-800">
                                {new Date(cs.date).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                              <span className="ml-2 font-black text-rose-500 font-mono">({cs.slot})</span>
                            </div>
                            
                            <button 
                              onClick={() => onReopenSlot(cs.date, cs.slot)}
                              className="text-xs text-emerald-600 font-bold hover:underline"
                            >
                              Reopen Session
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ───────────────── TICKET QR SCANNER TAB ───────────────── */}
          {activeTab === 'scanner' && (
            <div className="space-y-8 max-w-4xl mx-auto">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                
                {/* Live Feed Container */}
                <div className="bg-white rounded-3xl p-6 border border-gray-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-black text-gray-900">Boat Club Gate Scan</h3>
                      <p className="text-xs text-gray-400 font-semibold mt-0.5">Place QR inside viewfinder to check-in</p>
                    </div>

                    {scanning && (
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    )}
                  </div>

                  {/* QR view box viewport */}
                  <div className="relative aspect-square w-full max-w-sm mx-auto bg-gray-900 rounded-2xl overflow-hidden border-2 border-gray-800 flex items-center justify-center">
                    
                    {/* Overlay viewport guide markers */}
                    {scanning && (
                      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-between p-12">
                        <div className="flex justify-between w-full">
                          <div className="w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl" />
                          <div className="w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr" />
                        </div>
                        <div className="w-full border-t border-cyan-400/40 animate-[pulse_1s_infinite]" />
                        <div className="flex justify-between w-full">
                          <div className="w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl" />
                          <div className="w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br" />
                        </div>
                      </div>
                    )}

                    {/* Camera stream block container */}
                    <div id="scanner-view" className="w-full h-full object-cover"></div>

                    {/* Fallback display */}
                    {!scanning && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-gray-500 z-0">
                        <QrCode className="w-16 h-16 text-gray-700 stroke-[1.5] mb-4" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                          {!scannerLoaded ? 'Loading Camera Module...' : 'Camera Feed Offline'}
                        </span>
                        <p className="text-[10px] text-gray-600 mt-2 max-w-[200px] leading-relaxed">
                          Initialize scan mode to allocate hardware camera input.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    {!scanning ? (
                      <button 
                        onClick={handleStartCamera}
                        className="flex-1 py-3 bg-[#0D2B35] hover:bg-[#0D2B35]/90 text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer"
                      >
                        Launch Camera Viewer
                      </button>
                    ) : (
                      <button 
                        onClick={handleStopCamera}
                        className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer"
                      >
                        Shutdown Camera
                      </button>
                    )}
                  </div>
                </div>

                {/* Validation Response Panel & Manual Overrides */}
                <div className="space-y-6">
                  
                  {/* Visual Response Banners */}
                  {scanResult ? (
                    <div className={`rounded-3xl p-6 border transition-all ${
                      scanResult.success 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-900' 
                        : scanResult.alreadyCheckedIn
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-rose-50 border-rose-100 text-rose-900'
                    }`}>
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-2xl ${
                          scanResult.success 
                            ? 'bg-emerald-100 text-emerald-600' 
                            : scanResult.alreadyCheckedIn
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-rose-100 text-rose-600'
                        }`}>
                          {scanResult.success ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : (
                            <AlertTriangle className="w-6 h-6" />
                          )}
                        </div>

                        <div className="flex-1 text-xs space-y-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-widest block opacity-75">
                              Scan Validation Status
                            </span>
                            <h4 className="text-sm font-black leading-tight mt-1">
                              {scanResult.message}
                            </h4>
                          </div>

                          {scanResult.booking && (
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 space-y-2">
                              <span className="text-[9px] font-mono font-black text-[#0D2B35] block">
                                Booking Reference: {scanResult.booking.id}
                              </span>
                              <div className="text-[11px] font-extrabold text-gray-800">
                                Customer: {scanResult.booking.name}
                              </div>
                              <div className="text-[10px] text-gray-500 font-semibold space-y-1">
                                <div>Route: {getRouteName(scanResult.booking.route)}</div>
                                <div>Slot Session: {scanResult.booking.slot}</div>
                                <div>Guests: {scanResult.booking.guests} paddlers</div>
                                <div>Phone contact: {scanResult.booking.phone}</div>
                              </div>
                            </div>
                          )}

                          {scanResult.alreadyCheckedIn && (
                            <div className="bg-amber-100/50 rounded-xl p-3 border border-amber-200 text-[10px] leading-relaxed">
                              Verified boarding card consumed on <strong>{scanResult.checkInDate}</strong> at <strong>{scanResult.checkInTime}</strong>. Duplicate entry blocked.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl p-6 border border-gray-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] text-center py-16 text-gray-400 text-xs">
                      Awaiting scannable ticket or manual payload entry.
                    </div>
                  )}

                  {/* Scan Simulation Sandbox - Dropdown Selector */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-4">
                    <div>
                      <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                        Scan Simulation Sandbox
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Simulate scanning without hardware camera device permissions
                      </p>
                    </div>

                    <select
                      onChange={handleSimulateSelectChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs bg-[#E8E3D8]/40 focus:outline-none focus:border-[#0D2B35]"
                      defaultValue=""
                    >
                      <option value="" disabled>-- Choose Booking to Simulate Scan --</option>
                      {bookings.filter(b => b.status !== 'Cancelled').map(b => (
                        <option key={b.id} value={b.id}>
                          {b.id} - {b.name} ({b.date} • {b.slot} • Status: {b.status})
                        </option>
                      ))}
                    </select>

                    <div className="text-[9px] text-[#C8A86B] font-bold">
                      💡 Select any booking from the dropdown list to immediately trigger validation, duplicate warning, and Sandbox WhatsApp messages!
                    </div>
                  </div>

                  {/* Manual Code Input Form */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-4">
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                      Manual ID Gate Check
                    </h4>
                    
                    <form onSubmit={handleManualScanSubmit} className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Type ID (e.g. HC-2026-0001)"
                        required
                        value={manualScanInput}
                        onChange={(e) => setManualScanInput(e.target.value)}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-xs flex-1 focus:outline-none focus:border-[#0D2B35] bg-[#E8E3D8]/40 font-mono"
                      />
                      <button 
                        type="submit"
                        className="bg-[#0D2B35] hover:bg-[#0D2B35]/95 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                      >
                        Verify Code
                      </button>
                    </form>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      </main>

      {/* ──── POPUPS & MODALS DIALOGS LAYER ──── */}
      
      {/* Modal: Manual Add Booking */}
      {showAddBookingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowAddBookingModal(false)}
              className="absolute top-6 right-6 p-1 rounded-full text-gray-400 hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-black text-gray-900">Manual Booking Override Entry</h3>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Register direct customer details into slots schedules</p>
            </div>

            <form onSubmit={handleAddBooking} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Customer Name *</label>
                  <input 
                    type="text" 
                    required
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Alwin Jose"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#0D2B35]"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Phone Number *</label>
                  <input 
                    type="text" 
                    required
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 94470 12345"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#0D2B35]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Email Address</label>
                  <input 
                    type="email" 
                    value={bookingForm.email}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="alwin@example.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#0D2B35]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Booking Date *</label>
                  <input 
                    type="date" 
                    required
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#0D2B35]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Select Route *</label>
                  <select 
                    value={bookingForm.route}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, route: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs bg-white focus:outline-none"
                  >
                    {ROUTES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Schedule Run *</label>
                  <select 
                    value={bookingForm.slot}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, slot: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs bg-white focus:outline-none"
                  >
                    {SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Kayak Class *</label>
                  <select 
                    value={bookingForm.kayakType}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, kayakType: e.target.value as any }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs bg-white focus:outline-none"
                  >
                    <option value="single">Single Kayak (₹450/head)</option>
                    <option value="double">Double Kayak (₹900/kayak)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Guests *</label>
                  <input 
                    type="number" 
                    required
                    min={1}
                    max={12}
                    value={bookingForm.guests}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, guests: parseInt(e.target.value, 10) || 1 }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#0D2B35]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Source *</label>
                  <select 
                    value={bookingForm.source}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, source: e.target.value as any }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs bg-white focus:outline-none"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Phone Call">Phone Call</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Online">Online Widget</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Booking Status</label>
                  <select 
                    value={bookingForm.status}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs bg-white focus:outline-none"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Checked In">Checked In</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Payment Status</label>
                  <select 
                    value={bookingForm.paymentStatus}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, paymentStatus: e.target.value as any }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs bg-white focus:outline-none"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
              </div>

              <div className="bg-[#E8E3D8]/40 border border-gray-100 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 block uppercase">Auto Calculated Bill Total</span>
                  <span className="text-lg font-black text-gray-900 block mt-0.5">₹{bookingForm.amount.toLocaleString('en-IN')}</span>
                </div>
                
                <button 
                  type="submit"
                  className="bg-[#0D2B35] hover:bg-[#0D2B35]/95 text-white font-bold text-xs px-6 py-3 rounded-xl transition cursor-pointer shadow-md"
                >
                  Generate Manual Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Block Date */}
      {showBlockDateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-8 space-y-6 shadow-2xl relative">
            <button 
              onClick={() => setShowBlockDateModal(false)}
              className="absolute top-6 right-6 p-1 rounded-full text-gray-400 hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-black text-gray-900">Block Calendar Date</h3>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Prevent any bookings on selected dates</p>
            </div>

            <form onSubmit={handleBlockDate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Select Date *</label>
                <input 
                  type="date"
                  required
                  value={blockDateForm.date}
                  onChange={(e) => setBlockDateForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#0D2B35]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Reason for Block</label>
                <input 
                  type="text"
                  placeholder="e.g. Heavy rainfall hazard warning"
                  value={blockDateForm.reason}
                  onChange={(e) => setBlockDateForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#0D2B35]"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer"
              >
                Apply Date Block
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Close Slot */}
      {showCloseSlotModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-8 space-y-6 shadow-2xl relative">
            <button 
              onClick={() => setShowCloseSlotModal(false)}
              className="absolute top-6 right-6 p-1 rounded-full text-gray-400 hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-black text-gray-900">Close Specific Session Slot</h3>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Shut down a session slot for a specific date</p>
            </div>

            <form onSubmit={handleCloseSlot} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Select Date *</label>
                  <input 
                    type="date"
                    required
                    value={closeSlotForm.date}
                    onChange={(e) => setCloseSlotForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#0D2B35]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Select Slot *</label>
                  <select 
                    value={closeSlotForm.slot}
                    onChange={(e) => setCloseSlotForm(prev => ({ ...prev, slot: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs bg-white focus:outline-none"
                  >
                    {SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Reason for Closure</label>
                <input 
                  type="text"
                  placeholder="e.g. Group tour booking override"
                  value={closeSlotForm.reason}
                  onChange={(e) => setCloseSlotForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#0D2B35]"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-[#0D2B35] hover:bg-[#0D2B35]/95 text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer"
              >
                Shut Down Slot Session
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Customer */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-8 space-y-6 shadow-2xl relative">
            <button 
              onClick={() => setShowAddCustomerModal(false)}
              className="absolute top-6 right-6 p-1 rounded-full text-gray-400 hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-black text-gray-900">Add Customer Directory Profile</h3>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Register direct customer details into directory list</p>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Full Name *</label>
                <input 
                  type="text"
                  required
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Rahul Sharma"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#0D2B35]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Phone Number *</label>
                <input 
                  type="text"
                  required
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#0D2B35]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Email Address</label>
                <input 
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="rahul@example.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#0D2B35]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Register Source *</label>
                <select 
                  value={customerForm.source}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, source: e.target.value as any }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs bg-white focus:outline-none"
                >
                  <option value="Phone Call">Phone Call</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Online">Online Widget</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-[#0D2B35] hover:bg-[#0D2B35]/95 text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer"
              >
                Create Customer Profile
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

