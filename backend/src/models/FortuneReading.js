const mongoose = require('mongoose');

const fortuneReadingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['coffee', 'palm', 'tarot', 'horoscope', 'dream'],
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    image: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    userNote: {
      type: String,
      maxlength: [500, 'Not 500 karakterden uzun olamaz'],
      default: null,
    },
    reading: {
      content: {
        type: String,
        required: true,
      },
      sections: {
        general: { type: String, default: null },
        love: { type: String, default: null },
        career: { type: String, default: null },
        health: { type: String, default: null },
        finance: { type: String, default: null },
        advice: { type: String, default: null },
      },
      keywords: [String],
      sentiment: {
        type: String,
        enum: ['very_positive', 'positive', 'neutral', 'negative', 'very_negative'],
        default: 'neutral',
      },
      luckyNumbers: [Number],
      luckyColors: [String],
    },
    tarotCards: [
      {
        name: String,
        position: String,
        meaning: String,
        isReversed: { type: Boolean, default: false },
      },
    ],
    horoscopeData: {
      zodiacSign: { type: String, default: null },
      period: { type: String, default: null },
    },
    palmData: {
      lines: {
        heart: { type: String, default: null },
        head: { type: String, default: null },
        life: { type: String, default: null },
        fate: { type: String, default: null },
      },
    },
    dreamData: {
      dreamText: { type: String, default: null },
      symbols: { type: [String], default: [] },
      symbolMeanings: [{ symbol: String, meaning: String }],
      subconscious: { type: String, default: null },
      isGoodDream: { type: Boolean, default: true },
    },
    userRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    userFeedback: {
      type: String,
      maxlength: [300, 'Geri bildirim 300 karakterden uzun olamaz'],
      default: null,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isShared: {
      type: Boolean,
      default: false,
    },
    shareToken: {
      type: String,
      default: null,
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },
    processingTime: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

fortuneReadingSchema.index({ user: 1, createdAt: -1 });
fortuneReadingSchema.index({ user: 1, type: 1 });
fortuneReadingSchema.index({ user: 1, isFavorite: 1 });
fortuneReadingSchema.index({ shareToken: 1 }, { sparse: true });

fortuneReadingSchema.statics.getTypeLabel = function (type) {
  const labels = {
    coffee: 'Kahve Falı',
    palm: 'El Falı',
    tarot: 'Tarot Falı',
    horoscope: 'Yıldız Falı',
    dream: 'Rüya Tabiri',
  };
  return labels[type] || type;
};

module.exports = mongoose.model('FortuneReading', fortuneReadingSchema);
