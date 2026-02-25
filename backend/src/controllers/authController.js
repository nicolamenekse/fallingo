const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshTokens.push(refreshToken);
  user.lastLogin = new Date();
  user.save({ validateBeforeSave: false });

  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      subscription: user.subscription,
      totalReadings: user.totalReadings,
      dailyFortuneCount: user.dailyFortuneCount,
      notificationSettings: user.notificationSettings,
      zodiacSign: user.zodiacSign,
      birthDate: user.birthDate,
    },
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, birthDate, zodiacSign } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Bu e-posta adresi zaten kayıtlı.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      birthDate: birthDate || null,
      zodiacSign: zodiacSign || null,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'E-posta ve şifre zorunludur.' });
    }

    const user = await User.findOne({ email }).select('+password +refreshTokens');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Geçersiz e-posta veya şifre.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Hesabınız devre dışı bırakılmış.' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Geçersiz e-posta veya şifre.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token gereklidir.' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshTokens');

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ success: false, message: 'Geçersiz refresh token.' });
    }

    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();
    user.refreshTokens.push(newRefreshToken);
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Refresh token geçersiz veya süresi dolmuş.' });
    }
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const user = await User.findById(req.user._id).select('+refreshTokens');

    if (refreshToken) {
      user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    } else {
      user.refreshTokens = [];
    }

    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Başarıyla çıkış yapıldı.' });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'birthDate', 'zodiacSign', 'notificationSettings', 'fcmToken'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isValid = await user.comparePassword(currentPassword);

    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Mevcut şifreniz hatalı.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Şifreniz başarıyla güncellendi.' });
  } catch (error) {
    next(error);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    res.json({ success: true, message: 'Hesabınız başarıyla devre dışı bırakıldı.' });
  } catch (error) {
    next(error);
  }
};
