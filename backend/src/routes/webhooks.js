const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const Payment = require('../models/Payment');
const Project = require('../models/Project');

// Expects raw body; stripe signing enforced in index.js when mounting this route
router.post('/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      const amount = session.amount_total / 100;
      const projectId = session.metadata?.projectId;
      const userId = session.metadata?.userId;
      if (projectId) {
        const proj = await Project.findById(projectId);
        if (proj) {
          proj.collected += amount;
          if (proj.collected >= proj.goal) proj.isFunded = true;
          await proj.save();
        }
      }
      await Payment.create({ project: projectId, user: userId, amount, currency: session.currency, stripeSessionId: session.id, status: 'completed' });
    } catch (err) {
      console.error('Error recording payment', err);
    }
  }
  res.json({ received: true });
});

module.exports = router;
