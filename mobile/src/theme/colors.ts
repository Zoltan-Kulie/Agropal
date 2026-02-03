/**
 * Liquid Glass Design System - Palette B: Olive Horizon
 * Dark mode first-class with glassmorphism components
 */

export const colors = {
  // Primary Colors
  primary: '#8BCF9B',
  primaryDark: '#6FBC8A',

  // Secondary Colors
  secondary: '#5E7C5B',
  secondaryDark: '#4A6347',

  // Accent Color
  accent: '#E6A95C',
  accentDark: '#D49A4A',

  // Background Colors
  background: '#0E120F',
  backgroundLight: '#1A1F1B',

  // Surface Colors
  surface: '#151B16',
  surfaceLight: '#1E2620',

  // Glass Effects
  glassTint: 'rgba(255, 255, 255, 0.12)',
  glassTintDark: 'rgba(255, 255, 255, 0.08)',
  borderHighlight: 'rgba(255, 255, 255, 0.16)',
  borderHighlightDark: 'rgba(255, 255, 255, 0.10)',

  // Text Colors
  textPrimary: '#EAF3EC',
  textSecondary: '#A3B1A6',
  textTertiary: '#6B7A6E',
  textDisabled: '#4A554D',

  // Semantic Colors
  success: '#7CB342',
  warning: '#FFB74D',
  error: '#E57373',
  info: '#64B5F6',

  // Gradients
  gradient: {
    primary: ['#8BCF9B', '#6FBC8A'],
    accent: ['#E6A95C', '#D49A4A'],
    surface: ['#151B16', '#1E2620'],
  },

  // Opacity Variants
  opacity: {
    10: 'rgba(139, 207, 155, 0.1)',
    20: 'rgba(139, 207, 155, 0.2)',
    30: 'rgba(139, 207, 155, 0.3)',
    40: 'rgba(139, 207, 155, 0.4)',
    50: 'rgba(139, 207, 155, 0.5)',
    60: 'rgba(139, 207, 155, 0.6)',
    70: 'rgba(139, 207, 155, 0.7)',
    80: 'rgba(139, 207, 155, 0.8)',
    90: 'rgba(139, 207, 155, 0.9)',
  },
} as const;

export type ColorKey = keyof typeof colors;
