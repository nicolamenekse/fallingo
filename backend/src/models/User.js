const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'İsim zorunludur'],
      trim: true,
      maxlength: [50, 'İsim 50 karakterden uzun olamaz'],
    },
    email: {
      type: String,
      required: [true, 'E-posta zorunludur'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Geçerli bir e-posta adresi giriniz'],
    },
    password: {
      type: String,
      required: [true, 'Şifre zorunludur'],
      minlength: [6, 'Şifre en az 6 karakter olmalıdır'],
      select: false,
    },
    avatar: {
      type: String,
      default: null,
    },
    birthDate: {
      type: Date,
      default: null,
    },
    zodiacSign: {
      type: String,
      enum: [
        'Koç', 'Boğa', 'İkizler', 'Yengeç', 'Aslan', 'Başak',
        'Terazi', 'Akrep', 'Yay', 'Oğlak', 'Kova', 'Balık',
      ],
      default: null,
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'premium', 'vip'],
        default: 'free',
      },
      startDate: { type: Date, default: null },
      endDate: { type: Date, default: null },
      stripeCustomerId: { type: String, default: null },
      stripeSubscriptionId: { type: String, default: null },
      isActive: { type: Boolean, default: false },
    },
    dailyFortuneCount: {
      count: { type: Number, default: 0 },
      resetDate: { type: Date, default: Date.now },
    },
    totalReadings: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    refreshTokens: {
      type: [String],
      select: false,
      default: [],
    },
    notificationSettings: {
      dailyHoroscope: { type: Boolean, default: true },
      specialOffers: { type: Boolean, default: true },
      readingReminder: { type: Boolean, default: false },
    },
    fcmToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, plan: this.subscription.plan },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '90d' }
  );
};

userSchema.methods.isPremium = function () {
  if (this.subscription.plan === 'free') return false;
  if (!this.subscription.isActive) return false;
  if (this.subscription.endDate && new Date() > this.subscription.endDate) return false;
  return true;
};

userSchema.methods.canMakeReading = function () {
  const limits = { free: 3, premium: 20, vip: 999 };
  const dailyLimit = limits[this.subscription.plan] || 3;

  const now = new Date();
  const resetDate = new Date(this.dailyFortuneCount.resetDate);
  if (
    now.getDate() !== resetDate.getDate() ||
    now.getMonth() !== resetDate.getMonth() ||
    now.getFullYear() !== resetDate.getFullYear()
  ) {
    this.dailyFortuneCount.count = 0;
    this.dailyFortuneCount.resetDate = now;
  }

  return this.dailyFortuneCount.count < dailyLimit;
};

userSchema.methods.incrementReadingCount = async function () {
  this.dailyFortuneCount.count += 1;
  this.totalReadings += 1;
  await this.save();
};

userSchema.virtual('isPremiumActive').get(function () {
  return this.isPremium();
});

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.refreshTokens;
    delete ret.emailVerificationToken;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
