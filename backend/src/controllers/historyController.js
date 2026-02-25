const FortuneReading = require('../models/FortuneReading');
const Subscription = require('../models/Subscription');

exports.getHistory = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      isFavorite,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const planFeatures = Subscription.getPlanFeatures(req.user.subscription.plan);
    const historyStartDate = new Date();
    historyStartDate.setDate(historyStartDate.getDate() - planFeatures.historyDays);

    const filter = {
      user: req.user._id,
      createdAt: { $gte: historyStartDate },
    };

    if (type && ['coffee', 'palm', 'tarot', 'horoscope'].includes(type)) {
      filter.type = type;
    }

    if (isFavorite === 'true') {
      filter.isFavorite = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortField = ['createdAt', 'type', 'userRating'].includes(sortBy) ? sortBy : 'createdAt';
    const sort = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

    const [readings, total] = await Promise.all([
      FortuneReading.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-reading.content -tarotCards.meaning -palmData'),
      FortuneReading.countDocuments(filter),
    ]);

    res.json({
      success: true,
      readings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
        hasNextPage: skip + readings.length < total,
        hasPrevPage: parseInt(page) > 1,
      },
      historyLimitDays: planFeatures.historyDays,
    });
  } catch (error) {
    next(error);
  }
};

exports.getFavorites = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [readings, total] = await Promise.all([
      FortuneReading.find({ user: req.user._id, isFavorite: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      FortuneReading.countDocuments({ user: req.user._id, isFavorite: true }),
    ]);

    res.json({
      success: true,
      readings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const stats = await FortuneReading.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgRating: { $avg: '$userRating' },
          favorites: { $sum: { $cond: ['$isFavorite', 1, 0] } },
        },
      },
    ]);

    const totalReadings = stats.reduce((acc, s) => acc + s.count, 0);
    const typeBreakdown = {};
    stats.forEach((s) => {
      typeBreakdown[s._id] = {
        count: s.count,
        avgRating: s.avgRating ? Math.round(s.avgRating * 10) / 10 : null,
        favorites: s.favorites,
        label: FortuneReading.getTypeLabel(s._id),
      };
    });

    const recentActivity = await FortuneReading.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('type title createdAt isFavorite reading.sentiment');

    res.json({
      success: true,
      stats: {
        totalReadings,
        typeBreakdown,
        recentActivity,
        dailyCount: req.user.dailyFortuneCount.count,
        plan: req.user.subscription.plan,
        dailyLimit: Subscription.getPlanFeatures(req.user.subscription.plan).dailyLimit,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteReading = async (req, res, next) => {
  try {
    const reading = await FortuneReading.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!reading) {
      return res.status(404).json({ success: false, message: 'Fal kaydı bulunamadı.' });
    }

    res.json({ success: true, message: 'Fal kaydı silindi.' });
  } catch (error) {
    next(error);
  }
};

exports.clearHistory = async (req, res, next) => {
  try {
    const { type } = req.query;
    const filter = { user: req.user._id };
    if (type) filter.type = type;

    const result = await FortuneReading.deleteMany(filter);

    res.json({
      success: true,
      message: `${result.deletedCount} fal kaydı silindi.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};
