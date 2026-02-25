const express = require('express');
const router = express.Router();
const {
  createCoffeeReading,
  createPalmReading,
  createTarotReading,
  createHoroscopeReading,
  getReadingById,
  rateReading,
  toggleFavorite,
  shareReading,
  getSharedReading,
} = require('../controllers/fortuneController');
const { protect, requirePremium, checkDailyLimit } = require('../middleware/auth');
const { fortuneLimiter } = require('../middleware/rateLimiter');
const { upload } = require('../config/cloudinary');

router.get('/shared/:token', getSharedReading);

router.use(protect);

router.post(
  '/coffee',
  fortuneLimiter,
  checkDailyLimit,
  upload.single('image'),
  createCoffeeReading
);

router.post(
  '/palm',
  fortuneLimiter,
  checkDailyLimit,
  requirePremium,
  upload.single('image'),
  createPalmReading
);

router.post(
  '/tarot',
  fortuneLimiter,
  checkDailyLimit,
  requirePremium,
  createTarotReading
);

router.post(
  '/horoscope',
  fortuneLimiter,
  checkDailyLimit,
  requirePremium,
  createHoroscopeReading
);

router.get('/:id', getReadingById);
router.post('/:id/rate', rateReading);
router.post('/:id/favorite', toggleFavorite);
router.post('/:id/share', shareReading);

module.exports = router;
