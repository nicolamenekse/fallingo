export type FortuneType = 'coffee' | 'palm' | 'tarot' | 'horoscope';
export type SubscriptionPlan = 'free' | 'premium' | 'vip';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  birthDate: string | null;
  zodiacSign: string | null;
  subscription: {
    plan: SubscriptionPlan;
    startDate: string | null;
    endDate: string | null;
    isActive: boolean;
  };
  totalReadings: number;
  dailyFortuneCount: {
    count: number;
    resetDate: string;
  };
  notificationSettings: {
    dailyHoroscope: boolean;
    specialOffers: boolean;
    readingReminder: boolean;
  };
}

export interface ReadingSection {
  general: string | null;
  love: string | null;
  career: string | null;
  health: string | null;
  finance: string | null;
  advice: string | null;
}

export interface TarotCard {
  name: string;
  position: string;
  meaning: string;
  isReversed: boolean;
}

export interface FortuneReading {
  _id: string;
  user: string;
  type: FortuneType;
  title: string;
  image?: { url: string; publicId: string };
  userNote: string | null;
  reading: {
    content: string;
    sections: ReadingSection;
    keywords: string[];
    sentiment: string;
    luckyNumbers: number[];
    luckyColors: string[];
  };
  tarotCards?: TarotCard[];
  palmData?: {
    lines: { heart: string | null; head: string | null; life: string | null; fate: string | null };
  };
  horoscopeData?: { zodiacSign: string; period: string };
  userRating: number | null;
  isFavorite: boolean;
  isShared: boolean;
  shareToken: string | null;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
