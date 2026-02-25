const User = require('../models/User');
const Subscription = require('../models/Subscription');

let _stripe = null;
const getStripe = () => {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set');
    _stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
};

const PLANS = {
  premium_monthly: {
    priceId: 'price_premium_monthly',
    plan: 'premium',
    billingCycle: 'monthly',
    amount: 4999,
    currency: 'try',
    durationDays: 30,
    label: 'Premium Aylık',
  },
  premium_yearly: {
    priceId: 'price_premium_yearly',
    plan: 'premium',
    billingCycle: 'yearly',
    amount: 49990,
    currency: 'try',
    durationDays: 365,
    label: 'Premium Yıllık',
  },
  vip_monthly: {
    priceId: 'price_vip_monthly',
    plan: 'vip',
    billingCycle: 'monthly',
    amount: 9999,
    currency: 'try',
    durationDays: 30,
    label: 'VIP Aylık',
  },
  vip_yearly: {
    priceId: 'price_vip_yearly',
    plan: 'vip',
    billingCycle: 'yearly',
    amount: 99990,
    currency: 'try',
    durationDays: 365,
    label: 'VIP Yıllık',
  },
};

exports.getPlans = async (req, res, next) => {
  try {
    const currentPlan = req.user.subscription;

    const plans = [
      {
        id: 'free',
        label: 'Ücretsiz',
        price: 0,
        currency: 'TRY',
        features: Subscription.PLAN_FEATURES.free,
        isCurrent: currentPlan.plan === 'free',
      },
      {
        id: 'premium',
        label: 'Premium',
        monthlyPrice: PLANS.premium_monthly.amount / 100,
        yearlyPrice: PLANS.premium_yearly.amount / 100,
        currency: 'TRY',
        features: Subscription.PLAN_FEATURES.premium,
        isCurrent: currentPlan.plan === 'premium' && currentPlan.isActive,
        savings: `${Math.round((1 - PLANS.premium_yearly.amount / (PLANS.premium_monthly.amount * 12)) * 100)}%`,
      },
      {
        id: 'vip',
        label: 'VIP',
        monthlyPrice: PLANS.vip_monthly.amount / 100,
        yearlyPrice: PLANS.vip_yearly.amount / 100,
        currency: 'TRY',
        features: Subscription.PLAN_FEATURES.vip,
        isCurrent: currentPlan.plan === 'vip' && currentPlan.isActive,
        savings: `${Math.round((1 - PLANS.vip_yearly.amount / (PLANS.vip_monthly.amount * 12)) * 100)}%`,
      },
    ];

    res.json({ success: true, plans, currentSubscription: currentPlan });
  } catch (error) {
    next(error);
  }
};

exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { planId } = req.body;

    if (!PLANS[planId]) {
      return res.status(400).json({ success: false, message: 'Geçersiz plan seçimi.' });
    }

    const plan = PLANS[planId];

    let customerId = req.user.subscription.stripeCustomerId;
    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: { userId: req.user._id.toString() },
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(req.user._id, {
        'subscription.stripeCustomerId': customerId,
      });
    }

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: plan.amount,
      currency: plan.currency,
      customer: customerId,
      metadata: {
        userId: req.user._id.toString(),
        planId,
        plan: plan.plan,
        billingCycle: plan.billingCycle,
      },
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      plan: {
        id: planId,
        label: plan.label,
        amount: plan.amount / 100,
        currency: 'TRY',
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.confirmSubscription = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;

    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ success: false, message: 'Ödeme tamamlanmadı.' });
    }

    const { userId, planId, plan, billingCycle } = paymentIntent.metadata;

    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Yetki hatası.' });
    }

    const planConfig = PLANS[planId];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + planConfig.durationDays);

    const subscription = await Subscription.create({
      user: req.user._id,
      plan,
      status: 'active',
      billingCycle,
      amount: planConfig.amount / 100,
      currency: 'TRY',
      startDate,
      endDate,
      stripePaymentIntentId: paymentIntentId,
    });

    await User.findByIdAndUpdate(req.user._id, {
      'subscription.plan': plan,
      'subscription.startDate': startDate,
      'subscription.endDate': endDate,
      'subscription.isActive': true,
      'subscription.stripeSubscriptionId': subscription._id.toString(),
    });

    const updatedUser = await User.findById(req.user._id);

    res.json({
      success: true,
      message: `${plan === 'premium' ? 'Premium' : 'VIP'} üyeliğiniz aktifleştirildi!`,
      subscription: updatedUser.subscription,
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelSubscription = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = req.user;

    if (!user.isPremium()) {
      return res.status(400).json({ success: false, message: 'Aktif bir aboneliğiniz bulunmamaktadır.' });
    }

    await Subscription.findOneAndUpdate(
      { user: user._id, status: 'active' },
      {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: reason || null,
      }
    );

    await User.findByIdAndUpdate(user._id, {
      'subscription.isActive': false,
      'subscription.plan': 'free',
    });

    res.json({
      success: true,
      message: 'Aboneliğiniz iptal edildi. Dönem sonuna kadar premium özelliklerden yararlanmaya devam edebilirsiniz.',
    });
  } catch (error) {
    next(error);
  }
};

exports.getSubscriptionHistory = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, subscriptions });
  } catch (error) {
    next(error);
  }
};

exports.handleStripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'payment_intent.payment_failed': {
        const pi = event.data.object;
        const userId = pi.metadata?.userId;
        if (userId) {
          await Subscription.findOneAndUpdate(
            { user: userId, stripePaymentIntentId: pi.id },
            { status: 'past_due' }
          );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const user = await User.findOne({ 'subscription.stripeCustomerId': sub.customer });
        if (user) {
          await User.findByIdAndUpdate(user._id, {
            'subscription.plan': 'free',
            'subscription.isActive': false,
          });
        }
        break;
      }

      default:
        break;
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};
