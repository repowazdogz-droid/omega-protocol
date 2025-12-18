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

export const TEXT_SIZES = {
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

export const MAX_LINE_WIDTH = '800px' // Optimal reading width
export const CHIP_ROWS_MAX = {
  calm: 1, // Only 1 row of chips in calm mode
  standard: 2,
  dense: 3
} as const

export const SPACING = {
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

export type ReadingMode = 'calm' | 'standard' | 'dense'




