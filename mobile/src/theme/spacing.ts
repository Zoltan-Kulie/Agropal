/**
 * Spacing system using 4px base unit
 */

export const spacing = {
  // Base spacing
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,

  // Layout spacing
  section: 24,
  container: 16,
  card: 20,

  // Padding
  padding: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  },

  // Margin
  margin: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },

  // Border radius
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
  },

  // Border width
  border: {
    thin: 0.5,
    normal: 1,
    thick: 2,
  },
} as const;

export type SpacingKey = keyof typeof spacing;
