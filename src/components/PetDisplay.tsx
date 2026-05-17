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
  egg: '#F0F0F0',
  baby: '#FFB3D9',
  teen: '#FF80C0',
  adult: '#FF2D8C',
  reborn_1: '#FF2D8C',
  reborn_2: '#FF2D8C',
};

const FORM_STROKE: Record<PetForm, string> = {
  egg: '#CCCCCC',
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

interface Offsets {
  head: { x: number; y: number };
  eyes: { x: number; y: number };
  neck: { x: number; y: number };
  chest: { x: number; y: number };
  back: { x: number; y: number };
}

function getOffsets(form: PetForm): Offsets {
  if (form === 'baby') {
    return {
      head: { x: 100, y: 55 },
      eyes: { x: 100, y: 90 },
      neck: { x: 100, y: 110 },
      chest: { x: 100, y: 122 },
      back: { x: 100, y: 98 },
    };
  }
  if (form === 'teen') {
    return {
      head: { x: 100, y: 48 },
      eyes: { x: 100, y: 78 },
      neck: { x: 100, y: 114 },
      chest: { x: 100, y: 122 },
      back: { x: 100, y: 95 },
    };
  }
  // default for adult, reborn_1, reborn_2
  return {
    head: { x: 100, y: 44 },
    eyes: { x: 100, y: 78 },
    neck: { x: 100, y: 114 },
    chest: { x: 100, y: 122 },
    back: { x: 100, y: 95 },
  };
}

function getHairClipOffset(form: PetForm, type: 'star' | 'daisy') {
  if (type === 'star') {
    if (form === 'baby') return { x: 122, y: 78 };
    if (form === 'teen') return { x: 128, y: 62 };
    return { x: 128, y: 60 };
  } else {
    if (form === 'baby') return { x: 75, y: 68 };
    if (form === 'teen') return { x: 70, y: 52 };
    return { x: 70, y: 50 };
  }
}

export function PetDisplay({
  form, mood, accessories = [], size = 'large',
  progressPoints = 0, roundCompleteThreshold = 60_000,
}: PetDisplayProps) {
  const [showMoodPopup, setShowMoodPopup] = useState(false);
  const dim = size === 'large' ? 320 : 130;

  const fillColor = FORM_COLOR[form];
  const strokeColor = FORM_STROKE[form];

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
          position: 'absolute', width: 380, height: 380,
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

          {/* Main body / Mascot Image */}
          {form === 'egg' ? (
            /* Render a smooth pulsing pink egg shape */
            <motion.ellipse
              cx="100" cy="110" rx="55" ry="70"
              fill="url(#petGrad-egg)" stroke="#CCCCCC" strokeWidth="2.5"
              animate={{ rotate: [-3, 3, -3], scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              style={{ transformOrigin: '100px 110px' }}
            />
          ) : (
            /* Render the beautiful new custom Gato mascot transparent PNG images */
            <image
              href={
                form === 'baby'
                  ? '/gato-baby.png'
                  : form === 'teen'
                  ? '/gato-teen.png'
                  : '/gato-adult.png' /* adult, reborn_1, reborn_2 */
              }
              x="20"
              y="20"
              width="160"
              height="160"
            />
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

          {/* ACCESSORIES RENDERING */}
          {accessories?.map(accId => {
            if (accId === 'pet_frame_gold') return (
              <g key={accId}>
                <rect x="10" y="10" width="180" height="180" rx="20" fill="none" stroke="#FFD700" strokeWidth="4" opacity="0.6">
                  <animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
                </rect>
                <circle cx="10" cy="10" r="5" fill="#FFD700" />
                <circle cx="190" cy="10" r="5" fill="#FFD700" />
                <circle cx="10" cy="190" r="5" fill="#FFD700" />
                <circle cx="190" cy="190" r="5" fill="#FFD700" />
              </g>
            );
            if (accId === 'cat_ears') return (
              <g key={accId}>
                <path d="M55 75 L70 38 L88 72 Z" fill="#FFB3D9" stroke="#FF2D8C" strokeWidth="2" />
                <path d="M112 72 L130 38 L145 75 Z" fill="#FFB3D9" stroke="#FF2D8C" strokeWidth="2" />
                <path d="M60 72 L70 48 L80 70 Z" fill="#FF2D8C" opacity="0.3" />
                <path d="M120 70 L130 48 L140 72 Z" fill="#FF2D8C" opacity="0.3" />
              </g>
            );
            if (accId === 'bow_pink' || accId === 'bow_pastel') {
              const color = accId === 'bow_pink' ? '#FF2D8C' : '#D1C4E9';
              const offsets = getOffsets(form);
              return (
                <g key={accId} transform={`translate(${offsets.neck.x}, ${offsets.neck.y}) scale(0.8)`}>
                  <circle cx="-15" cy="0" r="15" fill={color} stroke="#fff" strokeWidth="1" />
                  <circle cx="15" cy="0" r="15" fill={color} stroke="#fff" strokeWidth="1" />
                  <circle cx="0" cy="0" r="8" fill={color} stroke="#fff" strokeWidth="2" />
                </g>
              );
            }
            if (accId === 'heart_glasses') {
              const offsets = getOffsets(form);
              return (
                <g key={accId} transform={`translate(${offsets.eyes.x}, ${offsets.eyes.y})`}>
                  <path d="M-40 0 Q-20 -25 0 0 Q20 -25 40 0" fill="none" stroke="#FF2D8C" strokeWidth="3" />
                  <path d="M-35 0 A15 15 0 1 0 -5 0 A15 15 0 1 0 -35 0" fill="rgba(255,45,140,0.3)" stroke="#FF2D8C" strokeWidth="2" />
                  <path d="M5 0 A15 15 0 1 0 35 0 A15 15 0 1 0 5 0" fill="rgba(255,45,140,0.3)" stroke="#FF2D8C" strokeWidth="2" />
                </g>
              );
            }
            if (accId === 'angel_wings' || accId === 'wings_small') {
              const scale = accId === 'angel_wings' ? 1.2 : 0.8;
              const offsets = getOffsets(form);
              return (
                <g key={accId} transform={`translate(${offsets.back.x}, ${offsets.back.y}) scale(${scale})`} opacity="0.8">
                  <path d="M-40 -20 Q-70 -50 -100 0 Q-70 20 -40 10 Z" fill="#fff" stroke="#eee" strokeWidth="1" />
                  <path d="M40 -20 Q70 -50 100 0 Q70 20 40 10 Z" fill="#fff" stroke="#eee" strokeWidth="1" />
                </g>
              );
            }
            if (accId === 'princess_crown') {
              const offsets = getOffsets(form);
              return (
                <g key={accId} transform={`translate(${offsets.head.x}, ${offsets.head.y}) scale(0.7)`}>
                  <path d="M-40 0 L-30 -30 L-10 -10 L0 -40 L10 -10 L30 -30 L40 0 Z" fill="#FFD700" stroke="#B8860B" strokeWidth="2" />
                  <circle cx="0" cy="-40" r="4" fill="#FF2D8C" />
                </g>
              );
            }
            if (accId === 'pirate_hat') {
              const offsets = getOffsets(form);
              return (
                <g key={accId} transform={`translate(${offsets.head.x}, ${offsets.head.y})`}>
                  <path d="M-60 0 Q0 -50 60 0 L60 10 L-60 10 Z" fill="#222" />
                  <circle cx="0" cy="-15" r="8" fill="#fff" />
                  <path d="M-4 -19 L4 -11 M-4 -11 L4 -19" stroke="#000" strokeWidth="2" />
                </g>
              );
            }
            if (accId === 'golden_bell') {
              const offsets = getOffsets(form);
              return (
                <g key={accId} transform={`translate(${offsets.neck.x}, ${offsets.neck.y + 3}) scale(0.6)`}>
                  <path d="M-15 10 Q0 -30 15 10 Z" fill="#FFD700" stroke="#B8860B" strokeWidth="2" />
                  <circle cx="0" cy="12" r="5" fill="#FFD700" stroke="#B8860B" strokeWidth="2" />
                </g>
              );
            }
            if (accId === 'heart_badge') {
              const offsets = getOffsets(form);
              return (
                <g key={accId} transform={`translate(${offsets.chest.x}, ${offsets.chest.y}) scale(0.4)`}>
                  <path d="M0 20 Q-20 0 -20 -15 Q-20 -30 0 -30 Q20 -30 20 -15 Q20 0 0 20" fill="#FF4D4D" />
                </g>
              );
            }
            if (accId === 'toy_mouse') return (
              <g key={accId} transform="translate(160, 160) scale(0.8)">
                <circle cx="0" cy="0" r="10" fill="#AAA" />
                <circle cx="-8" cy="-8" r="6" fill="#AAA" />
                <path d="M10 0 L25 5" stroke="#AAA" strokeWidth="2" fill="none" />
              </g>
            );
            if (accId === 'gold_fish') return (
              <g key={accId} transform="translate(40, 160) scale(0.8)">
                <circle cx="0" cy="0" r="15" fill="rgba(100,200,255,0.4)" stroke="#fff" />
                <circle cx="2" cy="2" r="6" fill="#FFA500" />
              </g>
            );
            if (accId === 'feather_band') {
              const offsets = getOffsets(form);
              return (
                <g key={accId} transform={`translate(${offsets.head.x}, ${offsets.head.y + 14})`}>
                  <rect x="-45" y="-5" width="90" height="10" rx="5" fill="#FF80AB" />
                  <path d="M30 -5 Q40 -35 50 -10" fill="#FFF" opacity="0.8" />
                  <path d="M20 -5 Q25 -30 35 -5" fill="#FFF" opacity="0.6" />
                </g>
              );
            }
            if (accId === 'pearl_necklace') {
              const offsets = getOffsets(form);
              return (
                <g key={accId} transform={`translate(${offsets.neck.x}, ${offsets.neck.y - 1})`}>
                  <circle cx="-24" cy="5" r="4" fill="#FFF" />
                  <circle cx="-12" cy="12" r="5" fill="#FFF" />
                  <circle cx="0" cy="15" r="6" fill="#FFF" />
                  <circle cx="12" cy="12" r="5" fill="#FFF" />
                  <circle cx="24" cy="5" r="4" fill="#FFF" />
                </g>
              );
            }
            if (accId === 'daisy_flower') {
              const offset = getHairClipOffset(form, 'daisy');
              return (
                <g key={accId} transform={`translate(${offset.x}, ${offset.y}) scale(0.5)`}>
                  <circle cx="0" cy="0" r="8" fill="#FFD700" />
                  {[0, 60, 120, 180, 240, 300].map(deg => (
                    <ellipse key={deg} rx="15" ry="6" fill="#FFF" transform={`rotate(${deg}) translate(15, 0)`} />
                  ))}
                </g>
              );
            }
            if (accId === 'diamond_bracelet') return (
              <g key={accId} transform="translate(140, 150) rotate(20)">
                <rect x="-15" y="-3" width="30" height="6" rx="3" fill="#B0BEC5" />
                <rect x="-4" y="-4" width="8" height="8" rotate="45" fill="#E1F5FE" stroke="#81D4FA" />
              </g>
            );
            if (accId === 'rainbow_lollipop') return (
              <g key={accId} transform="translate(165, 130)">
                <rect x="-2" y="0" width="4" height="40" fill="#FFE0B2" />
                <circle cx="0" cy="0" r="15" fill="url(#rainbowGrad)" stroke="#fff" />
                <defs>
                  <radialGradient id="rainbowGrad">
                    <stop offset="0%" stopColor="#FF5252" />
                    <stop offset="33%" stopColor="#FFEB3B" />
                    <stop offset="66%" stopColor="#2196F3" />
                    <stop offset="100%" stopColor="#E040FB" />
                  </radialGradient>
                </defs>
              </g>
            );
            if (accId === 'sparkle_effect') return (
              <g key={accId}>
                <motion.text x="40" y="60" fontSize="20" animate={{ opacity: [0,1,0] }} transition={{ repeat: Infinity, duration: 1.5 }}>✨</motion.text>
                <motion.text x="160" y="80" fontSize="16" animate={{ opacity: [0,1,0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}>✨</motion.text>
                <motion.text x="140" y="170" fontSize="18" animate={{ opacity: [0,1,0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 1 }}>✨</motion.text>
              </g>
            );
            if (accId === 'little_bird') return (
              <g key={accId} transform="translate(35, 80) scale(0.7)">
                <path d="M0 0 Q10 -20 25 0 L25 10 L0 10 Z" fill="#90A4AE" />
                <circle cx="18" cy="-5" r="2" fill="#000" />
                <path d="M25 -2 L32 -2" stroke="#FFD54F" strokeWidth="2" />
              </g>
            );
            if (accId === 'chef_hat') {
              const offsets = getOffsets(form);
              return (
                <g key={accId} transform={`translate(${offsets.head.x}, ${offsets.head.y}) scale(0.8)`}>
                  <path d="M-30 0 L30 0 L30 -15 Q30 -45 0 -45 Q-30 -45 -30 -15 Z" fill="#FFF" stroke="#DDD" />
                  <rect x="-30" y="-5" width="60" height="10" fill="#FFF" stroke="#DDD" />
                </g>
              );
            }
            if (accId === 'star_clip') {
              const offset = getHairClipOffset(form, 'star');
              return (
                <g key={accId} transform={`translate(${offset.x}, ${offset.y}) scale(0.5)`}>
                  <path d="M0 -30 L8 -10 L30 -10 L12 5 L18 25 L0 12 L-18 25 L-12 5 L-30 -10 L-8 -10 Z" fill="#FFEB3B" stroke="#FBC02D" strokeWidth="2" />
                </g>
              );
            }
            if (accId === 'bunny_hug') return (
              <g key={accId} transform="translate(100, 165) scale(0.6)">
                <circle cx="0" cy="0" r="25" fill="#FFF" stroke="#EEE" />
                <circle cx="0" cy="-20" r="18" fill="#FFF" stroke="#EEE" />
                <ellipse cx="-8" cy="-45" rx="5" ry="15" fill="#FFF" stroke="#EEE" />
                <ellipse cx="8" cy="-45" rx="5" ry="15" fill="#FFF" stroke="#EEE" />
                <circle cx="-7" cy="-22" r="2" fill="#000" />
                <circle cx="7" cy="-22" r="2" fill="#000" />
              </g>
            );
            if (accId === 'hat_party') {
              const offsets = getOffsets(form);
              return (
                <g key={accId} transform={`translate(${offsets.head.x}, ${offsets.head.y}) scale(0.8)`}>
                  <polygon points="-20 0 0 -45 20 0" fill="#FF80C0" stroke="#FF2D8C" strokeWidth="1.5" />
                  <circle cx="-5" cy="-15" r="3" fill="#FFE082" />
                  <circle cx="5" cy="-25" r="2.5" fill="#80DEEA" />
                  <circle cx="0" cy="-5" r="3.5" fill="#C5CAE9" />
                  <circle cx="0" cy="-47" r="6" fill="#FFF" stroke="#FF2D8C" strokeWidth="1" />
                </g>
              );
            }
            if (accId === 'scarf_yellow') {
              const offsets = getOffsets(form);
              return (
                <g key={accId} transform={`translate(${offsets.neck.x}, ${offsets.neck.y}) scale(0.8)`}>
                  <rect x="-25" y="-6" width="50" height="12" rx="6" fill="#FFD54F" stroke="#F57F17" strokeWidth="1.5" />
                  <path d="M12 4 Q18 10 14 26 L4 24 Q6 8 12 4" fill="#FFD54F" stroke="#F57F17" strokeWidth="1.5" />
                  <path d="M4 4 Q-2 12 -2 24 L-10 22 Q-10 10 4 4" fill="#FFD54F" stroke="#F57F17" strokeWidth="1.5" />
                </g>
              );
            }
            return null;
          })}
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
