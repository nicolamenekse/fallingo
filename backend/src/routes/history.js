const express = require('express');
const router = express.Router();
const {
  getHistory,
  getFavorites,
  getStats,
  deleteReading,
  clearHistory,
} = require('../controllers/historyController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getHistory);
router.get('/favorites', getFavorites);
router.get('/stats', getStats);
router.delete('/clear', clearHistory);
router.delete('/:id', deleteReading);

module.exports = router;
