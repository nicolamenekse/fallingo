const express = require('express');
const router = express.Router();
const {
  getPlans,
  createPaymentIntent,
  confirmSubscription,
  cancelSubscription,
  getSubscriptionHistory,
  handleStripeWebhook,
} = require('../controllers/premiumController');
const { protect } = require('../middleware/auth');

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

router.use(protect);

router.get('/plans', getPlans);
router.post('/payment-intent', createPaymentIntent);
router.post('/confirm', confirmSubscription);
router.post('/cancel', cancelSubscription);
router.get('/history', getSubscriptionHistory);

module.exports = router;
