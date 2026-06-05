import { useState, useEffect, useCallback, useRef } from 'react';
import { Lock, Delete, CheckCircle } from 'lucide-react';

const CORRECT_PIN = '5555';
const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;
const SESSION_KEY = 'hc_admin_unlocked';
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

interface PinLockProps {
  onUnlock: () => void;
}

export default function PinLock({ onUnlock }: PinLockProps) {
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [attempts, setAttempts] = useState(0);
  const [lockedOut, setLockedOut] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Check existing session
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const { timestamp } = JSON.parse(stored);
        if (Date.now() - timestamp < SESSION_DURATION_MS) {
          onUnlock();
          return;
        }
      } catch { /* ignore */ }
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, [onUnlock]);

  // Focus hidden input on mount for keyboard support
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Lockout countdown
  useEffect(() => {
    if (!lockedOut) return;
    const interval = setInterval(() => {
      setLockoutRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setLockedOut(false);
          setAttempts(0);
          setPin('');
          setErrorMsg('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedOut]);

  const submitPin = useCallback((currentPin: string) => {
    if (currentPin === CORRECT_PIN) {
      setStatus('success');
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ timestamp: Date.now() }));
      setTimeout(() => onUnlock(), 900);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setStatus('error');
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setStatus('idle');
        setPin('');
        inputRef.current?.focus();
      }, 600);

      if (newAttempts >= MAX_ATTEMPTS) {
        setLockedOut(true);
        setLockoutRemaining(LOCKOUT_SECONDS);
        setErrorMsg('');
      } else {
        const rem = MAX_ATTEMPTS - newAttempts;
        setErrorMsg(`Incorrect PIN — ${rem} attempt${rem !== 1 ? 's' : ''} left`);
      }
    }
  }, [attempts, onUnlock]);

  const handleDigit = useCallback((digit: string) => {
    if (lockedOut || status === 'success') return;
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setErrorMsg('');
    if (newPin.length === 4) {
      setTimeout(() => submitPin(newPin), 80);
    }
  }, [pin, lockedOut, status, submitPin]);

  const handleDelete = useCallback(() => {
    if (lockedOut || status === 'success') return;
    setPin(p => p.slice(0, -1));
    setErrorMsg('');
  }, [lockedOut, status]);

  const handleUnlockClick = () => {
    if (pin.length === 4) submitPin(pin);
    else inputRef.current?.focus();
  };

  // Physical keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
      else if (e.key === 'Backspace') handleDelete();
      else if (e.key === 'Enter' && pin.length === 4) submitPin(pin);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleDigit, handleDelete, pin, submitPin]);

  // Dot visual states
  const getDotStyle = (i: number) => {
    const filled = i < pin.length;
    if (status === 'success') return { bg: '#5BAD8F', border: '#5BAD8F', glow: '0 0 12px rgba(91,173,143,0.7)' };
    if (status === 'error' && filled) return { bg: '#C0392B', border: '#C0392B', glow: '0 0 10px rgba(192,57,43,0.6)' };
    if (filled) return { bg: '#B5903A', border: '#B5903A', glow: '0 0 10px rgba(181,144,58,0.5)' };
    return { bg: 'transparent', border: '#C8B88A', glow: 'none' };
  };

  const digits = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden select-none font-sans antialiased"
      style={{ background: 'linear-gradient(135deg, #F5EDD8 0%, #EDE0C4 40%, #E8D8B8 100%)' }}
    >
      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: 'url(/bg-grain.webp)', backgroundRepeat: 'repeat', backgroundSize: 'auto' }}
      />

      {/* Warm glow blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(181,144,58,0.08) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(181,144,58,0.06) 0%, transparent 70%)' }} />

      {/* Hidden input for mobile keyboard */}
      <input
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        maxLength={4}
        value={pin}
        onChange={e => {
          const val = e.target.value.replace(/\D/g, '').slice(0, 4);
          setPin(val);
          setErrorMsg('');
          if (val.length === 4) setTimeout(() => submitPin(val), 80);
        }}
        className="absolute opacity-0 pointer-events-none w-0 h-0"
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* ── CARD ── */}
      <div
        className="relative z-10 w-full"
        style={{
          maxWidth: 480,
          background: '#FDFAF3',
          borderRadius: 28,
          boxShadow: '0 24px 80px rgba(100,75,20,0.12), 0 4px 16px rgba(100,75,20,0.06)',
          padding: '48px 40px 44px',
          animation: shake ? 'hc-shake 0.45s ease-in-out' : undefined,
        }}
      >
        {/* Lock icon circle */}
        <div className="flex flex-col items-center gap-5 mb-8">
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: '#F5EDD8',
            border: '1.5px solid #C8B88A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(181,144,58,0.15)',
          }}>
            {status === 'success' ? (
              <CheckCircle style={{ width: 32, height: 32, color: '#5BAD8F' }} />
            ) : (
              <Lock style={{ width: 30, height: 30, color: '#B5903A' }} strokeWidth={1.8} />
            )}
          </div>

          <div className="text-center space-y-1.5">
            <p style={{ color: '#B5903A', fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
              Hooked &amp; Cooked
            </p>
            <h1 style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: 'clamp(28px, 6vw, 38px)',
              fontWeight: 400,
              color: '#1C1711',
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
            }}>
              {lockedOut ? 'Access Locked' : 'Admin Access'}
            </h1>
            <p style={{ color: '#8A7B5E', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              {lockedOut
                ? `Try again in ${lockoutRemaining}s`
                : status === 'success'
                ? 'Unlocking dashboard…'
                : 'Authorized Personnel Only'}
            </p>
          </div>
        </div>

        {/* ── PIN Dots Row ── */}
        <div
          style={{
            border: status === 'error' ? '1.5px solid #C0392B'
              : status === 'success' ? '1.5px solid #5BAD8F'
              : '1.5px solid #C8B88A',
            borderRadius: 14,
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 28,
            background: '#FDFAF3',
            transition: 'border-color 0.2s',
            marginBottom: errorMsg || lockedOut ? 12 : 24,
            cursor: 'text',
          }}
          onClick={() => inputRef.current?.focus()}
        >
          {[0, 1, 2, 3].map(i => {
            const ds = getDotStyle(i);
            return (
              <div key={i} style={{
                width: i < pin.length ? 14 : 10,
                height: i < pin.length ? 14 : 10,
                borderRadius: '50%',
                background: ds.bg,
                border: `1.5px solid ${ds.border}`,
                boxShadow: ds.glow,
                transition: 'all 0.18s ease',
              }} />
            );
          })}
        </div>

        {/* Error / lockout message */}
        {(errorMsg || lockedOut) && (
          <p style={{
            textAlign: 'center',
            fontSize: 11,
            fontWeight: 600,
            color: lockedOut ? '#C0392B' : '#9B4C2E',
            marginBottom: 20,
            letterSpacing: '0.02em',
          }}>
            {lockedOut ? `⛔  Too many attempts — locked for ${lockoutRemaining}s` : errorMsg}
          </p>
        )}

        {/* ── Number Pad ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
            marginBottom: 20,
            opacity: lockedOut ? 0.35 : 1,
            pointerEvents: lockedOut ? 'none' : 'auto',
            transition: 'opacity 0.3s',
          }}
        >
          {digits.map((d, idx) => {
            if (d === '') return <div key={idx} />;
            const isDel = d === '⌫';
            return (
              <button
                key={idx}
                type="button"
                onClick={() => isDel ? handleDelete() : handleDigit(d)}
                style={{
                  height: 58,
                  borderRadius: 12,
                  background: isDel ? 'transparent' : '#F5EDD8',
                  border: isDel ? '1px solid transparent' : '1px solid #DDD0B3',
                  color: isDel ? '#A09070' : '#1C1711',
                  fontSize: isDel ? 18 : 22,
                  fontWeight: isDel ? 400 : 700,
                  cursor: 'pointer',
                  transition: 'all 0.13s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isDel ? 'none' : '0 1px 4px rgba(100,75,20,0.08)',
                  fontFamily: isDel ? 'inherit' : 'inherit',
                  WebkitTapHighlightColor: 'transparent',
                }}
                onMouseDown={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.94)';
                  (e.currentTarget as HTMLButtonElement).style.background = isDel ? '#F5EDD8' : '#EDE0C4';
                }}
                onMouseUp={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                  (e.currentTarget as HTMLButtonElement).style.background = isDel ? 'transparent' : '#F5EDD8';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                  (e.currentTarget as HTMLButtonElement).style.background = isDel ? 'transparent' : '#F5EDD8';
                }}
                onTouchStart={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.94)';
                  (e.currentTarget as HTMLButtonElement).style.background = '#EDE0C4';
                }}
                onTouchEnd={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                  (e.currentTarget as HTMLButtonElement).style.background = isDel ? 'transparent' : '#F5EDD8';
                }}
              >
                {isDel ? <Delete style={{ width: 18, height: 18 }} /> : d}
              </button>
            );
          })}
        </div>

        {/* ── Unlock Button ── */}
        <button
          type="button"
          onClick={handleUnlockClick}
          disabled={lockedOut || status === 'success'}
          style={{
            width: '100%',
            height: 56,
            borderRadius: 14,
            background: status === 'success' ? '#5BAD8F'
              : lockedOut ? '#BDB09A'
              : '#1C1711',
            color: '#FDFAF3',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            border: 'none',
            cursor: lockedOut || status === 'success' ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: lockedOut ? 'none' : '0 6px 24px rgba(28,23,17,0.25)',
          }}
        >
          {status === 'success' ? '✓ Access Granted' : lockedOut ? `Locked (${lockoutRemaining}s)` : 'Unlock Workspace'}
        </button>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          fontSize: 9,
          color: '#B0A48A',
          fontWeight: 600,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginTop: 20,
        }}>
          Secured Admin Portal · Session expires in 8h
        </p>
      </div>

      {/* Shake keyframe */}
      <style>{`
        @keyframes hc-shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          15% { transform: translateX(-9px) rotate(-0.4deg); }
          30% { transform: translateX(9px) rotate(0.4deg); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
}
