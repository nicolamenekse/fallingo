export const COLORS = {
  primary: '#7C3AED',
  primaryLight: '#A78BFA',
  primaryDark: '#5B21B6',

  secondary: '#EC4899',
  secondaryLight: '#F9A8D4',

  accent: '#F59E0B',
  accentLight: '#FCD34D',

  background: '#0D0D1A',
  surface: '#16162A',
  surfaceLight: '#1E1E35',
  card: '#1A1A2E',
  cardBorder: '#2D2D4E',

  text: '#F1F0FF',
  textSecondary: '#A09DC0',
  textMuted: '#6B6890',

  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Fortune type colors
  coffee: '#92400E',
  coffeeLight: '#D97706',
  palm: '#065F46',
  palmLight: '#10B981',
  tarot: '#4C1D95',
  tarotLight: '#8B5CF6',
  horoscope: '#1E3A5F',
  horoscopeLight: '#60A5FA',

  // Gradients (used as array pairs)
  gradientPrimary: ['#7C3AED', '#EC4899'] as const,
  gradientGold: ['#F59E0B', '#D97706'] as const,
  gradientDark: ['#0D0D1A', '#1A1A2E'] as const,
  gradientCoffee: ['#92400E', '#D97706'] as const,
  gradientPalm: ['#065F46', '#10B981'] as const,
  gradientTarot: ['#4C1D95', '#7C3AED'] as const,
  gradientHoroscope: ['#1E3A5F', '#2563EB'] as const,
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    display: 38,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  large: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
};

export const FORTUNE_TYPES = [
  {
    id: 'coffee',
    title: 'Kahve Falı',
    subtitle: 'Fincanındaki sırları keşfet',
    emoji: '☕',
    gradient: COLORS.gradientCoffee,
    requiresImage: true,
    isPremium: false,
  },
  {
    id: 'palm',
    title: 'El Falı',
    subtitle: 'Elinin çizgilerini yorumla',
    emoji: '✋',
    gradient: COLORS.gradientPalm,
    requiresImage: true,
    isPremium: true,
  },
  {
    id: 'tarot',
    title: 'Tarot Falı',
    subtitle: 'Kartlar geleceğini anlatıyor',
    emoji: '🃏',
    gradient: COLORS.gradientTarot,
    requiresImage: false,
    isPremium: true,
  },
  {
    id: 'horoscope',
    title: 'Yıldız Falı',
    subtitle: 'Burçların söylediklerine kulak ver',
    emoji: '⭐',
    gradient: COLORS.gradientHoroscope,
    requiresImage: false,
    isPremium: true,
  },
] as const;

export const ZODIAC_SIGNS = [
  { id: 'Koç', emoji: '♈', en: 'Aries' },
  { id: 'Boğa', emoji: '♉', en: 'Taurus' },
  { id: 'İkizler', emoji: '♊', en: 'Gemini' },
  { id: 'Yengeç', emoji: '♋', en: 'Cancer' },
  { id: 'Aslan', emoji: '♌', en: 'Leo' },
  { id: 'Başak', emoji: '♍', en: 'Virgo' },
  { id: 'Terazi', emoji: '♎', en: 'Libra' },
  { id: 'Akrep', emoji: '♏', en: 'Scorpio' },
  { id: 'Yay', emoji: '♐', en: 'Sagittarius' },
  { id: 'Oğlak', emoji: '♑', en: 'Capricorn' },
  { id: 'Kova', emoji: '♒', en: 'Aquarius' },
  { id: 'Balık', emoji: '♓', en: 'Pisces' },
];
