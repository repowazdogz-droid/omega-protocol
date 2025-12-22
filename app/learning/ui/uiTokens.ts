/**
 * UI Tokens
 * 
 * Design system constants for Vision Pro-ready UI.
 * Large tap targets, generous spacing, readable text.
 * 
 * Version: 0.1
 */

export const TAP_MIN_PX = 44 // Minimum tap target size (Apple HIG)
export const CARD_PADDING = {
  calm: '1rem',
  standard: '1.25rem',
  dense: '1.5rem'
} as const

// Internal nested structure
const TEXT_SIZES_NESTED = {
  calm: {
    h1: '1.3rem',
    h2: '1.1rem',
    h3: '1rem',
    body: '0.95rem',
    small: '0.85rem'
  },
  standard: {
    h1: '1.5rem',
    h2: '1.2rem',
    h3: '1.1rem',
    body: '1rem',
    small: '0.9rem'
  },
  dense: {
    h1: '1.8rem',
    h2: '1.4rem',
    h3: '1.2rem',
    body: '1rem',
    small: '0.85rem'
  }
} as const

// Flat accessors (defaults to 'standard' mode)
const TEXT_SIZES_FLAT = {
  heading: TEXT_SIZES_NESTED.standard.h1,
  subheading: TEXT_SIZES_NESTED.standard.h2,
  h1: TEXT_SIZES_NESTED.standard.h1,
  h2: TEXT_SIZES_NESTED.standard.h2,
  h3: TEXT_SIZES_NESTED.standard.h3,
  body: TEXT_SIZES_NESTED.standard.body,
  small: TEXT_SIZES_NESTED.standard.small,
  large: TEXT_SIZES_NESTED.standard.h1, // Use h1 for large
} as const

// Merged export: provides both nested (TEXT_SIZES.standard.h1) and flat (TEXT_SIZES.heading) access
export const TEXT_SIZES = {
  ...TEXT_SIZES_NESTED,
  ...TEXT_SIZES_FLAT,
} as typeof TEXT_SIZES_NESTED & typeof TEXT_SIZES_FLAT

export const MAX_LINE_WIDTH = '800px' // Optimal reading width
export const CHIP_ROWS_MAX = {
  calm: 1, // Only 1 row of chips in calm mode
  standard: 2,
  dense: 3
} as const

// Internal nested structure
const SPACING_NESTED = {
  calm: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  standard: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.25rem',
    lg: '2rem',
    xl: '2.5rem'
  },
  dense: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  }
} as const

// Flat accessors (defaults to 'standard' mode)
const SPACING_FLAT = {
  xs: SPACING_NESTED.standard.xs,
  sm: SPACING_NESTED.standard.sm,
  small: SPACING_NESTED.standard.sm, // Alias for sm
  md: SPACING_NESTED.standard.md,
  lg: SPACING_NESTED.standard.lg,
  large: SPACING_NESTED.standard.lg, // Alias for lg
  xl: SPACING_NESTED.standard.xl,
  standard: SPACING_NESTED.standard.md, // Alias for md
} as const

// Merged export: provides both nested (SPACING.standard.md) and flat (SPACING.large) access
export const SPACING = {
  ...SPACING_NESTED,
  ...SPACING_FLAT,
} as typeof SPACING_NESTED & typeof SPACING_FLAT

export type ReadingMode = 'calm' | 'standard' | 'dense'

// Type helpers for spacing/padding props - accept both token objects and raw values
export type SpacingValue = 
  | typeof SPACING_NESTED.standard[keyof typeof SPACING_NESTED.standard] 
  | typeof SPACING_FLAT[keyof typeof SPACING_FLAT]
  | string 
  | number

export type TypographySize = 
  | typeof TEXT_SIZES_NESTED.standard[keyof typeof TEXT_SIZES_NESTED.standard]
  | typeof TEXT_SIZES_FLAT[keyof typeof TEXT_SIZES_FLAT]
  | string 
  | number

