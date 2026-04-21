/**
 * Upstox Mobile Design System
 * Source: Figma spec for My Lists (watchlist) screen, 360px canvas.
 * This file is the single source of truth for tokens used across the
 * mobile custom-scanner flow. All new mobile screens MUST consume these tokens.
 */

export const mobileColors = {
  // Brand
  brandPurple: "#542087",        // Primary action / link
  brandPurpleLogo: "#5A298B",    // Logo background, secondary link
  brandPurpleDark: "#41246E",
  brandPurpleDeep: "#280B45",
  plusPurple: "#5C2FA3",
  plusPurpleLight: "#AF91D1",
  plusPurpleChip: "#F5EFFB",

  // Text
  textPrimary: "#262626",
  textSecondary: "#6A6A6A",
  textTertiary: "#777777",
  textAlt: "#929292",
  textGold: "#A09568",           // Newsfeed "TOP STORIES" label

  // Surface / background
  bgDefault: "#FFFFFF",
  bgMuted: "#F9F9F9",
  bgTan: "#EEEBE6",              // Pledge / F&O activation card
  bgPurpleGradientEnd: "#E8E7FF",// Watchlist top-gradient bottom color
  bgPlusBannerStart: "#000000",
  bgPlusChipBg: "#FBF8FD",

  // UI / borders / dividers
  ui1: "#F2F2F2",
  ui2: "#F1F1F1",
  ui3: "#E1E1E1",
  ui4: "#D0D0D0",
  ui5: "#C6C6C6",
  iconMuted: "#525252",

  // Semantic — tags & deltas
  posText: "#008858",
  posBg: "#DEF5ED",
  negText: "#D53627",
  negBg: "#FCEBE9",
} as const;

export const mobileTypography = {
  // font families
  fontProduct: "'Inter', system-ui, -apple-system, sans-serif",
  fontMessina: "'Messina Sans', 'Inter', system-ui, sans-serif",

  // sizes (px)
  size2xs: 10,   // tag / meta
  sizeXs: 12,    // body xs
  sizeSm: 14,    // body s
  sizeMd: 16,    // body md
  sizeLg: 20,
} as const;

export const mobileSpacing = {
  s0: 0,
  s1: 2,
  s2: 4,
  s3: 8,
  s4: 12,
  s5: 16,
  s6: 24,
  s7: 32,
} as const;

export const mobileRadius = {
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  pill: 9999,
} as const;

// Tile width is the fixed mobile canvas from the spec. The replica is centered
// in a desktop viewport and scrolls internally.
export const MOBILE_CANVAS_WIDTH = 360;

/**
 * Button tokens — single source of truth for all mobile buttons.
 * Source: Figma DS spec (Inter, 6px radius, no pill shapes).
 */
export const mobileButton = {
  // Primary CTA: solid purple, 48px tall, 6px radius
  primary: {
    height: 48,
    padding: "12px",
    gap: 4,
    background: "#542087",
    color: "#FFFFFF",
    border: "none",
    borderRadius: 6,
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 16,
    lineHeight: "24px",
    fontWeight: 600,
  },
  // Secondary outline: 28px tall, 1px purple border, 6px radius
  secondary: {
    height: 28,
    padding: "6px 8px",
    gap: 2,
    background: "#FFFFFF",
    color: "#542087",
    border: "1px solid #542087",
    borderRadius: 6,
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 12,
    lineHeight: "16px",
    fontWeight: 600,
  },
} as const;
