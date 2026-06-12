import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, ShieldCheck, Share2, ArrowLeft } from 'lucide-react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { generateSecurityToken } from '../utils/security';

const ROUTES = [
  { id: 'kadambrayar', name: 'Kadambrayar River Expedition' },
  { id: 'vembanad', name: 'Vembanad Backwater Odyssey' },
  { id: 'kadamakudy', name: 'Kadamakudy Village Explorer' }
];

export default function BoardingPass() {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  
  // Parse URL search parameters
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || 'HC-XXXX-XXXX';
  const token = params.get('token') || '';
  const name = params.get('name') || 'Guest Client';
  const routeId = params.get('route') || 'kadambrayar';
  const slot = params.get('slot') || '8:00 AM';
  const dateStr = params.get('date') || '2026-06-04';
  const guests = parseInt(params.get('guests') || '1', 10);
  
  // Custom calculated parameter fallbacks
  const kayakType = params.get('kayak') || 'single';
  const rawAmount = params.get('amount');

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

  let calculatedAmount = guests * 450;
  if (kayakType === 'double') {
    calculatedAmount = Math.ceil(guests / 2) * 900;
  } else if (typeof kayakType === 'string' && kayakType.startsWith('mixed:')) {
    const parts = kayakType.split(':');
    const s = parseInt(parts[1], 10) || 0;
    const d = parseInt(parts[2], 10) || 0;
    calculatedAmount = s * 450 + d * 900;
  }
  const amount = rawAmount ? parseInt(rawAmount, 10) : calculatedAmount;

  const routeObj = ROUTES.find(r => r.id === routeId) || ROUTES[0];

  // Verify signature cryptographically to prevent guessing or URL parameter manipulation
  const expectedToken = generateSecurityToken(id, name, routeId, slot, dateStr, guests);
  const isValid = token && token === expectedToken;

  useEffect(() => {
    if (!isValid) return;

    // Trigger Google Ads conversion event
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'conversion', {
        'send_to': 'AW-16910032872/EPV3CLnErr0cEOi_qv8-'
      });
    }

    // Generate QR code locally offline using the qrcode library
    const qrPayload = JSON.stringify({
      bookingId: id,
      token: token,
      guests: guests
    });

    QRCode.toDataURL(qrPayload, {
      margin: 1,
      width: 250,
      color: {
        dark: '#040E0F',
        light: '#FFFFFF'
      }
    })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('Error generating QR locally: ', err));
  }, [id, token, guests, isValid]);

  const formattedDate = new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    const ticketElement = document.getElementById('ticket-card');
    if (!ticketElement) return;

    setDownloading(true);
    // Wrap in setTimeout to allow React to finish state re-rendering before capturing DOM
    setTimeout(() => {
      html2canvas(ticketElement, {
        scale: 3, // High quality resolution image
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#FFFFFF', // Keep the ticket background white
        logging: false,
        onclone: (clonedDoc) => {
          const card = clonedDoc.getElementById('ticket-card');
          if (card) {
            card.style.transform = 'none';
            card.style.opacity = '1';
            
            // Remove crossorigin attributes from base64 data URLs to prevent CORS blockages
            const imgs = card.getElementsByTagName('img');
            for (let i = 0; i < imgs.length; i++) {
              if (imgs[i].src && imgs[i].src.startsWith('data:')) {
                imgs[i].removeAttribute('crossorigin');
              }
            }

            let parent = card.parentElement;
            while (parent) {
              parent.style.transform = 'none';
              parent.style.opacity = '1';
              parent = parent.parentElement;
            }
          }
        }
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `Hooked_Cooked_Ticket_${id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloading(false);
      }).catch(err => {
        console.error('Error downloading ticket: ', err);
        setDownloading(false);
        // Fallback
        window.print();
      });
    }, 150);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Hooked & Cooked Boarding Pass',
        text: `Boarding Pass for ${name} - Booking ID: ${id}`,
        url: window.location.href,
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Boarding pass link copied to clipboard!');
    }
  };

  // ──── INVALID ACCESS VIEW (TAMPER WARNING) ────
  if (!isValid) {
    return (
      <div className="min-h-screen bg-[#FAF2F0] text-[#0A0915] flex flex-col items-center justify-center p-4 selection:bg-[#FE5B63] selection:text-white relative font-sans antialiased">
        
        {/* Immersive background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[60%] rounded-full bg-radial from-[#FE5B63]/10 to-transparent blur-3xl opacity-60" />
        </div>

        <div className="w-full max-w-sm relative z-10 flex flex-col gap-6">
          
          {/* Logo and Brand */}
          <div className="flex flex-col items-center text-center gap-1.5">
            <img src="/logo.webp" alt="Hooked & Cooked Logo" className="w-16 h-16 object-contain mb-1.5 filter drop-shadow-[0_2px_8px_rgba(254,91,99,0.15)]" />
            <h1 className="font-extrabold text-lg tracking-tight text-[#0A0915]">Hooked & Cooked</h1>
            <span className="text-[9.5px] uppercase tracking-widest text-[#FE5B63] font-black">Security Verification Failed</span>
          </div>

          {/* Boarding Card Ticket Container */}
          <div className="bg-white text-[#0A0915] rounded-[32px] overflow-hidden shadow-[0_12px_40px_rgba(30,18,42,0.04)] relative border border-gray-100 p-6 text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 text-2xl font-bold border border-red-100 animate-bounce">
              ⚠️
            </div>
            
            <div className="space-y-2">
              <h3 className="text-base font-black text-[#0A0915] uppercase tracking-wide">Invalid Boarding Pass</h3>
              <p className="text-xs text-[#8A8996] leading-relaxed">
                The security signature for this boarding pass does not match our records. This could be because the ticket details (such as Booking ID, route, slot, or guest count) have been altered.
              </p>
            </div>

            <div className="bg-red-50/50 rounded-2xl p-4 border border-dashed border-red-100 text-[10.5px] text-red-900 font-bold text-left space-y-1 font-mono">
              <div>TICKET ID: {id}</div>
              <div>STATUS: ACCESS DENIED / TAMPERED</div>
            </div>
          </div>

          {/* Directions Footer */}
          <div className="text-center px-6">
            <p className="text-[10.5px] text-[#8A8996] leading-relaxed">
              If you believe this is an error, please contact the Hooked & Cooked support team directly.
            </p>
          </div>

        </div>
      </div>
    );
  }

  // ──── STANDARD BEAUTIFUL TICKET VIEW ────
  return (
    <div className="min-h-screen bg-[#FAF2F0] text-[#0A0915] flex flex-col items-center justify-start p-4 select-text font-sans antialiased print:bg-white print:p-0">
      
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          html, body, #root, #root > div {
            background: #FAF2F0 !important;
            color: #0A0915 !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          #ticket-card {
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
      <div className="absolute inset-0 pointer-events-none overflow-hidden print:hidden">
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[60%] rounded-full bg-radial from-[#FE5B63]/5 to-transparent blur-3xl opacity-60" />
      </div>

      <div className="w-full max-w-sm relative z-10 flex flex-col gap-5 pt-4 print:pt-0 print:max-w-full">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between px-2 mb-1 print:hidden">
          <button 
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = '/';
              }
            }}
            aria-label="Go back"
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:bg-gray-50 border border-gray-100 transition-all cursor-pointer text-[#0A0915]"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="font-extrabold text-[11px] tracking-[0.15em] text-[#0A0915] uppercase">Reservation Details</h2>
          <div className="w-10" /> {/* Spacer to center the title */}
        </div>

        {/* Boarding Card Ticket Container */}
        <div id="ticket-card" className="bg-white rounded-[32px] overflow-hidden shadow-[0_12px_40px_rgba(30,18,42,0.04)] border border-gray-100/50 flex flex-col print:shadow-none print:border-none">
          
          {/* Card Upper Section */}
          <div className="p-6 pb-2 flex flex-col gap-5">
            
            {/* Destination/Route Header & Share */}
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <h3 className="text-[17px] font-black text-[#0A0915] leading-snug tracking-tight">
                  {routeObj.name}
                </h3>
                <span className="text-[11px] font-bold text-[#8A8996]">
                  {formattedDate}
                </span>
              </div>
              
              <button 
                type="button"
                onClick={handleShare}
                aria-label="Share boarding pass"
                className="w-9 h-9 rounded-full bg-[#FFF0F0] hover:bg-[#FFE5E5] flex items-center justify-center text-[#FE5B63] hover:scale-105 active:scale-95 transition-all cursor-pointer print:hidden"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Dotted Line Separator */}
            <div className="border-b border-dashed border-gray-100" />

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-left">
              <div>
                <span className="text-[9px] font-bold text-[#8A8996] uppercase tracking-wider block">Primary Passenger</span>
                <span className="text-xs font-black text-[#0A0915] block mt-0.5 truncate">{name}</span>
              </div>
              
              <div>
                <span className="text-[9px] font-bold text-[#8A8996] uppercase tracking-wider block">Kayak Platform</span>
                <span className="text-xs font-black text-[#0A0915] block mt-0.5">{getKayakTypeDisplay(kayakType)}</span>
              </div>
              
              <div>
                <span className="text-[9px] font-bold text-[#8A8996] uppercase tracking-wider block">Ticket ID</span>
                <span className="text-xs font-black font-mono text-[#0A0915] block mt-0.5">{id}</span>
              </div>
              
              <div>
                <span className="text-[9px] font-bold text-[#8A8996] uppercase tracking-wider block">Group Size</span>
                <span className="text-xs font-black text-[#0A0915] block mt-0.5">{guests} Paddler{guests > 1 ? 's' : ''}</span>
              </div>
              
              <div>
                <span className="text-[9px] font-bold text-[#8A8996] uppercase tracking-wider block">Departure Time</span>
                <span className="text-xs font-black text-[#0A0915] block mt-0.5">{slot}</span>
              </div>
              
              <div>
                <span className="text-[9px] font-bold text-[#8A8996] uppercase tracking-wider block">Booking Status</span>
                <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100/50 px-2.5 py-0.5 rounded-md inline-block mt-0.5 tracking-wide">
                  CONFIRMED
                </span>
              </div>
            </div>

            {/* Dotted Line Separator */}
            <div className="border-b border-dashed border-gray-100" />

            {/* Total Fare block */}
            <div className="flex justify-between items-center py-1">
              <span className="text-[12px] font-extrabold text-[#0A0915] uppercase tracking-wider">Total Amount</span>
              <span className="text-[19px] font-black text-[#FE5B63] tracking-tight">
                ₹{amount.toLocaleString('en-IN')}.00
              </span>
            </div>

          </div>

          {/* Scalloped ticket edges left & right */}
          <div className="relative my-2 select-none pointer-events-none print:hidden">
            <div className="absolute left-[-10px] top-[-10px] w-5 h-5 rounded-full bg-[#FAF2F0]" />
            <div className="absolute right-[-10px] top-[-10px] w-5 h-5 rounded-full bg-[#FAF2F0]" />
            <div className="border-b-2 border-dashed border-gray-100 mx-5" />
          </div>

          {/* Card Lower QR code Section */}
          <div className="p-6 pt-2 flex flex-col items-center">
            
            {/* QR Wrapper matching mockup */}
            <div className="w-full flex flex-col items-center py-4 bg-[#FAF9F6]/50 rounded-[24px] border border-gray-100/60 shadow-inner print:border-none print:bg-white">
              <span className="text-[8.5px] font-bold uppercase text-[#8A8996] tracking-wider mb-4">
                Gate Entry Check-in QR
              </span>
              
              {qrCodeDataUrl ? (
                <img 
                  src={qrCodeDataUrl} 
                  alt="Scannable QR" 
                  className="w-44 h-44 object-contain p-2 bg-white border border-gray-100 rounded-2xl shadow-xs print:border-none print:shadow-none"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center bg-gray-200 rounded-2xl text-xs font-bold text-gray-400 animate-pulse">
                  Generating QR...
                </div>
              )}
              
              <span className="text-[9.5px] font-medium text-[#FE5B63] mt-4 tracking-wide text-center px-4 leading-normal">
                Note: Just show your QR code while boarding the kayak.
              </span>
            </div>

          </div>

        </div>

        {/* Buttons at the bottom */}
        <div className="grid grid-cols-2 gap-3 mt-1 pb-8 print:hidden">
          <button
            type="button"
            onClick={() => window.location.href = '/'}
            className="border border-gray-200 bg-white rounded-2xl py-3.5 text-xs font-black tracking-widest uppercase text-[#1E122A] hover:bg-gray-50 active:scale-98 transition-all cursor-pointer shadow-xs"
          >
            Go Back
          </button>
          
          <button
            type="button"
            disabled={downloading}
            onClick={handleDownload}
            className="bg-[#1E122A] text-white rounded-2xl py-3.5 text-xs font-black tracking-widest uppercase hover:bg-[#2B1D38] active:scale-98 transition-all cursor-pointer shadow-md shadow-purple-950/15 disabled:bg-[#1E122A]/60 flex items-center justify-center gap-2"
          >
            {downloading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Download Pass</span>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}
