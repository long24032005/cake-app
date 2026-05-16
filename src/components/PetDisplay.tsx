/**
 * PetDisplay — SVG placeholder
 * Spec C2: size large ~200x200px, size small ~80x80px
 * Placeholder: circle #FF2D8C với form-specific variants
 */
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { PetForm, PetMood } from '../types';

interface PetDisplayProps {
  form: PetForm;
  mood: PetMood;
  accessories?: string[];
  size?: 'small' | 'large';
  progressPoints?: number;         // dùng cho egg countdown
  roundCompleteThreshold?: number; // = 60_000
}

// Màu fill theo form (spec B5 stage description)
const FORM_COLOR: Record<PetForm, string> = {
  baby: '#FFB3D9',
  teen: '#FF80C0',
  adult: '#FF2D8C',
  reborn_1: '#FF2D8C',
  reborn_2: '#FF2D8C',
};

const FORM_STROKE: Record<PetForm, string> = {
  baby: '#FF2D8C',
  teen: '#FF2D8C',
  adult: '#C21A7A',
  reborn_1: '#C21A7A',
  reborn_2: '#C21A7A',
};

// Sparkle positions around pet (happy mood)
const SPARKLES = [
  { x: -28, y: -32, delay: 0 },
  { x: 30, y: -28, delay: 0.2 },
  { x: -34, y: 10, delay: 0.4 },
  { x: 32, y: 12, delay: 0.6 },
  { x: 0, y: -38, delay: 0.8 },
];

function SparkStar({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.text
      x={100 + x} y={100 + y}
      fontSize="10" textAnchor="middle" dominantBaseline="middle"
      fill="#FF80C0"
      animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
      transition={{ duration: 1.4, repeat: Infinity, delay, ease: 'easeInOut' }}
      style={{ transformOrigin: `${100 + x}px ${100 + y}px` }}
    >✦</motion.text>
  );
}

export function PetDisplay({
  form, mood, size = 'large',
  progressPoints = 0, roundCompleteThreshold = 60_000,
}: PetDisplayProps) {
  const [showMoodPopup, setShowMoodPopup] = useState(false);
  const dim = size === 'large' ? 200 : 80;
  const scale = dim / 200;

  const fillColor = FORM_COLOR[form];
  const strokeColor = FORM_STROKE[form];
  const ptsLeft = Math.max(0, roundCompleteThreshold - progressPoints);

  // Idle animation: mood sleeping → breathe, else → float
  const idleAnim =
    mood === 'sleeping'
      ? { scale: [1, 1.04, 1] }
      : { y: [0, -8, 0] };
  const idleTrans = { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const };

  const moodText =
    mood === 'happy' ? 'Gato đang vui lắm! 🌟' :
      mood === 'sleeping' ? 'Gato đang ngủ... 💤' :
        'Gato đang ổn 😊';

  return (
    <div className="pet-display-root" style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      {/* Glow background — spec C2 */}
      {size === 'large' && (
        <div className="pet-glow" style={{
          position: 'absolute', width: 260, height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,45,140,0.22) 0%, rgba(255,45,140,0) 70%)',
          top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
      )}

      {/* LV label above pet (spec E Screen 1) */}
      {size === 'large' && (
        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 600, letterSpacing: '0.05em', zIndex: 1 }}>
          {form.toUpperCase().replace('_', ' ')} • Gato
        </div>
      )}

      {/* Pet SVG */}
      <motion.div
        animate={idleAnim}
        transition={idleTrans}
        style={{ cursor: 'pointer', position: 'relative', zIndex: 1 }}
        onClick={() => { setShowMoodPopup(true); setTimeout(() => setShowMoodPopup(false), 2000); }}
        whileTap={{ scale: 0.93 }}
      >
        <svg width={dim} height={dim} viewBox="0 0 200 200">
          <defs>
            <radialGradient id={`petGrad-${form}`} cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor={fillColor} stopOpacity="1" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="1" />
            </radialGradient>
            {/* reborn glow filter */}
            {(form === 'reborn_1' || form === 'reborn_2') && (
              <filter id="petGlow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            )}
          </defs>

          {/* Reborn aura ring */}
          {(form === 'reborn_1' || form === 'reborn_2') && (
            <motion.circle cx="100" cy="100" r="88"
              fill="none" stroke="#FF2D8C" strokeWidth="3" strokeOpacity="0.35"
              animate={{ strokeOpacity: [0.2, 0.5, 0.2], r: [84, 90, 84] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          {/* Cat ears — teen / adult / reborn */}
          {form !== 'baby' && (
            <>
              <polygon points="55,75 70,38 88,72" fill={strokeColor} />
              <polygon points="112,72 130,38 145,75" fill={strokeColor} />
              <polygon points="60,72 70,48 84,70" fill={fillColor} />
              <polygon points="116,70 130,48 140,72" fill={fillColor} />
            </>
          )}

          {/* Main body */}
          <circle cx="100" cy="105" r="72"
            fill={`url(#petGrad-${form})`} stroke={strokeColor} strokeWidth="2"
            filter={form.startsWith('reborn') ? 'url(#petGlow)' : undefined}
          />

          {/* Eyes */}
          <>
            {mood === 'sleeping' ? (
              // Closed eyes — arc lines
              <>
                <path d="M74 100 Q82 93 90 100" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M110 100 Q118 93 126 100" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
              </>
            ) : (
              // Open eyes
              <>
                <circle cx="82" cy="100" r={form === 'baby' ? 11 : 8} fill="white" />
                <circle cx="118" cy="100" r={form === 'baby' ? 11 : 8} fill="white" />
                <circle cx="84" cy="101" r={form === 'baby' ? 6 : 4.5} fill="#1A1635" />
                <circle cx="120" cy="101" r={form === 'baby' ? 6 : 4.5} fill="#1A1635" />
                {/* Shine */}
                <circle cx="86" cy="98" r="1.5" fill="white" />
                <circle cx="122" cy="98" r="1.5" fill="white" />
              </>
            )}
          </>

          {/* Nose + mouth */}
          {form !== 'baby' && (
            <>
              <ellipse cx="100" cy="113" rx="3" ry="2" fill={strokeColor} />
              {mood === 'happy'
                ? <path d="M90 120 Q100 130 110 120" fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
                : <path d="M92 120 Q100 125 108 120" fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
              }
            </>
          )}

          {/* reborn_2 crown */}
          {form === 'reborn_2' && (
            <g>
              <polygon points="100,18 107,32 122,28 114,40 125,50 100,44 75,50 86,40 78,28 93,32" fill="#FFD700" stroke="#FFA500" strokeWidth="1" />
            </g>
          )}

          {/* Sleeping Zzz */}
          {mood === 'sleeping' && (
            <motion.text x="138" y="68" fontSize="14" fill="#9B96C8" fontWeight="700"
              animate={{ y: [68, 60, 68], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >💤</motion.text>
          )}

          {/* Happy sparkles */}
          {mood === 'happy' && SPARKLES.map((s, i) => <SparkStar key={i} {...s} />)}
        </svg>
      </motion.div>

      {/* Mood popup — spec E Screen 1 "tap vào pet" */}
      <AnimatePresence>
        {showMoodPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            style={{
              position: 'absolute', top: size === 'large' ? 20 : 0,
              left: '50%', transform: 'translateX(-50%)',
              background: 'var(--color-bg-card)', border: '1px solid var(--color-bg-card-border)',
              borderRadius: 12, padding: '6px 12px', fontSize: 12,
              color: 'var(--color-text-primary)', whiteSpace: 'nowrap', zIndex: 10,
              boxShadow: '0 4px 20px rgba(255,45,140,0.3)',
            }}
          >{moodText}</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
