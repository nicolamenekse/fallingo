const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['premium', 'vip'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'past_due', 'trialing'],
      default: 'active',
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'TRY',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    nextBillingDate: {
      type: Date,
      default: null,
    },
    stripeSubscriptionId: {
      type: String,
      default: null,
    },
    stripePaymentIntentId: {
      type: String,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const PLAN_FEATURES = {
  free: {
    dailyLimit: 3,
    types: ['coffee', 'dream'],
    canShare: false,
    canFavorite: true,
    historyDays: 7,
    priority: 'normal',
  },
  premium: {
    dailyLimit: 20,
    types: ['coffee', 'palm', 'tarot', 'horoscope', 'dream'],
    canShare: true,
    canFavorite: true,
    historyDays: 90,
    priority: 'high',
  },
  vip: {
    dailyLimit: 999,
    types: ['coffee', 'palm', 'tarot', 'horoscope', 'dream'],
    canShare: true,
    canFavorite: true,
    historyDays: 365,
    priority: 'highest',
  },
};

subscriptionSchema.statics.getPlanFeatures = function (plan) {
  return PLAN_FEATURES[plan] || PLAN_FEATURES.free;
};

subscriptionSchema.statics.PLAN_FEATURES = PLAN_FEATURES;

module.exports = mongoose.model('Subscription', subscriptionSchema);
