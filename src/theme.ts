/**
 * CAKE PET SAVINGS — Design Tokens
 * Source: spec section C1 — DESIGN SYSTEM — CAKE VIBE
 * Đây là file config màu sắc duy nhất. Không hardcode màu ở nơi khác.
 */

export const colors = {
  // ── Backgrounds ───────────────────────────────────────────
  bgApp:          '#0D0B1F',   // nền tổng thể — tím đêm rất đậm
  bgCard:         '#1A1635',   // nền card / panel
  bgCardBorder:   '#2D2850',   // viền nhẹ của card

  // ── Brand Pink ────────────────────────────────────────────
  primaryPink:    '#FF2D8C',   // CTA button chính, highlight
  secondaryPink:  '#FF80C0',   // hover state, secondary elements

  // ── Text ──────────────────────────────────────────────────
  textPrimary:    '#FFFFFF',   // white
  textSecondary:  '#9B96C8',   // tím nhạt — label phụ, caption
  textAccentGreen:'#4ECDA4',   // xanh mint — lãi, điểm dương
  textAccentBlue: '#5BC8F5',   // xanh sky — link, interactive text

  // ── Button States ─────────────────────────────────────────
  btnDisabled:    '#3D3870',   // nút disabled / chưa active

  // ── Bottom Nav ────────────────────────────────────────────
  navActive:      '#FF2D8C',   // tab active
  navInactive:    '#9B96C8',   // tab inactive
  navBarBg:       '#1A1635',   // tab bar background
} as const;

/** Gradient dùng cho button chính (active) */
export const gradients = {
  btnPrimary:   'linear-gradient(135deg, #FF2D8C, #C21A7A)',
  petGlow:      'radial-gradient(circle, rgba(255,45,140,0.25) 0%, rgba(255,45,140,0) 70%)',
} as const;

/** Border radius */
export const radius = {
  btnLarge: '24px',  // pill shape
  card:     '16px',
  chip:     '12px',
} as const;

/** Spacing grid: 8px base */
export const spacing = {
  xs:  '4px',
  sm:  '8px',
  md:  '16px',
  lg:  '24px',
  xl:  '32px',
  xxl: '48px',
} as const;

export type ColorKey = keyof typeof colors;
