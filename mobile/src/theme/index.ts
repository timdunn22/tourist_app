// LocalLink Theme Configuration
// Design system for consistent styling across the app

export const colors = {
  // Primary palette
  primary: '#E07A5F',
  primaryDark: '#C4553D',
  primaryLight: '#F4A990',
  
  // Secondary palette
  secondary: '#3D405B',
  secondaryLight: '#4A4E6D',
  
  // Accent colors
  accent: '#81B29A',
  accentLight: '#A8D5BA',
  accentDark: '#5A9178',
  
  // Warm tones
  warm: '#F2CC8F',
  warmLight: '#FFF8E7',
  warmDark: '#D4A84B',
  
  // Backgrounds
  background: '#FFFCF7',
  backgroundAlt: '#F5F2ED',
  
  // Text
  text: '#2D3142',
  textLight: '#6B7280',
  textLighter: '#9CA3AF',
  
  // Utility
  white: '#FFFFFF',
  black: '#1A1A2E',
  border: '#E8E4DE',
  borderLight: '#F0EDE8',
  
  // Semantic
  success: '#10B981',
  successLight: '#D1FAE5',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  
  // Shadows
  shadow: 'rgba(45, 49, 66, 0.08)',
  shadowLg: 'rgba(45, 49, 66, 0.15)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  full: 100,
};

export const typography = {
  // Font families (need to be linked in native projects)
  fontFamily: {
    display: 'Fraunces',
    displayBold: 'Fraunces-Bold',
    body: 'DMSans-Regular',
    bodyMedium: 'DMSans-Medium',
    bodySemiBold: 'DMSans-SemiBold',
    bodyBold: 'DMSans-Bold',
  },
  
  // Font sizes
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    display: 32,
    hero: 42,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  },
};

export const shadows = {
  sm: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  xl: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
};

// Trust score colors based on value
export const getTrustScoreColor = (score: number) => {
  if (score >= 95) return colors.success;
  if (score >= 85) return colors.accent;
  if (score >= 70) return colors.warning;
  return colors.danger;
};

// Guide level colors
export const guideLevelColors = {
  0: colors.textLight,    // Community Local
  1: colors.success,      // Platform Trained
  2: colors.primary,      // Professional
  3: colors.warm,         // Master Guide
};

export const guideLevelNames = {
  0: 'Community Local',
  1: 'Platform Trained',
  2: 'Professional Guide',
  3: 'Master Guide',
};

// Badge configurations
export const badgeConfig = {
  'GPS-Verified': { icon: '📍', color: colors.success },
  'Female-Safe': { icon: '👩', color: colors.accent },
  'First Aid Ready': { icon: '🏥', color: colors.danger },
  'Platform Trained': { icon: '✓', color: colors.primary },
  'Master Guide': { icon: '🏆', color: colors.warm },
  'Heritage Expert': { icon: '🏛️', color: colors.secondary },
  'Mentor': { icon: '👥', color: colors.accentDark },
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  getTrustScoreColor,
  guideLevelColors,
  guideLevelNames,
  badgeConfig,
};
