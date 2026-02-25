const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Bu işlem için giriş yapmanız gerekmektedir.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('+refreshTokens');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı bulunamadı veya hesap devre dışı.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Geçersiz token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.', code: 'TOKEN_EXPIRED' });
    }
    next(error);
  }
};

const requirePremium = (req, res, next) => {
  if (!req.user.isPremium()) {
    return res.status(403).json({
      success: false,
      message: 'Bu özellik sadece Premium üyeler için kullanılabilir.',
      code: 'PREMIUM_REQUIRED',
      upgradeUrl: '/premium',
    });
  }
  next();
};

const requireVip = (req, res, next) => {
  if (req.user.subscription.plan !== 'vip') {
    return res.status(403).json({
      success: false,
      message: 'Bu özellik sadece VIP üyeler için kullanılabilir.',
      code: 'VIP_REQUIRED',
    });
  }
  next();
};

const checkDailyLimit = async (req, res, next) => {
  try {
    if (!req.user.canMakeReading()) {
      const plans = { free: 3, premium: 20, vip: 999 };
      const limit = plans[req.user.subscription.plan] || 3;
      return res.status(429).json({
        success: false,
        message: `Günlük fal limitinize (${limit}) ulaştınız. Yarın tekrar deneyebilirsiniz.`,
        code: 'DAILY_LIMIT_REACHED',
        limit,
        plan: req.user.subscription.plan,
        upgradeUrl: '/premium',
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect, requirePremium, requireVip, checkDailyLimit };
