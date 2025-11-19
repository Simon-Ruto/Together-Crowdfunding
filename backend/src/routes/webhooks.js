const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const Payment = require('../models/Payment');
const Project = require('../models/Project');
const { catchAsync, AppError } = require('../middleware/errorHandler');

// Expects raw body; stripe signing enforced in index.js when mounting this route
router.post('/stripe', catchAsync(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('⚠️  STRIPE_WEBHOOK_SECRET not configured');
    return res.status(400).json({
      error: {
        message: 'Webhook not configured',
        code: 'CONFIG_ERROR'
      }
    });
  }

  // Verify Stripe signature
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).json({
      error: {
        message: 'Webhook signature verification failed',
        code: 'SIGNATURE_ERROR'
      }
    });
  }

  // Handle payment success event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      const amount = session.amount_total / 100; // Convert from cents
      const projectId = session.metadata?.projectId;
      const userId = session.metadata?.userId;

      if (!projectId) {
        console.warn('⚠️  Payment webhook missing projectId');
        return res.json({ received: true });
      }

      // Update project with collected amount
      const proj = await Project.findById(projectId);
      if (proj) {
        proj.collected += amount;
        if (proj.collected >= proj.goal) {
          proj.isFunded = true;
        }
        await proj.save();
        console.log(`✓ Project ${projectId} updated: +$${amount}`);
      } else {
        console.warn(`⚠️  Project ${projectId} not found`);
      }

      // Record payment
      await Payment.create({
        project: projectId,
        user: userId,
        amount,
        currency: session.currency,
        stripeSessionId: session.id,
        status: 'completed'
      });

      console.log(`✓ Payment recorded: $${amount} for project ${projectId}`);
    } catch (err) {
      console.error('❌ Error processing payment webhook:', err);
      // Still return 200 so Stripe doesn't retry
    }
  }

  // Handle payment failure event
  if (event.type === 'checkout.session.async_payment_failed') {
    const session = event.data.object;
    try {
      const projectId = session.metadata?.projectId;
      const userId = session.metadata?.userId;
      const amount = session.amount_total / 100;

      await Payment.create({
        project: projectId,
        user: userId,
        amount,
        currency: session.currency,
        stripeSessionId: session.id,
        status: 'failed'
      });

      console.log(`⚠️  Payment failed: $${amount} for project ${projectId}`);
    } catch (err) {
      console.error('❌ Error recording failed payment:', err);
    }
  }

  // Acknowledge receipt
  res.json({ received: true });
}));

module.exports = router;
