const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const auth = require('../middleware/auth');
const Project = require('../models/Project');

// Create a Checkout Session for a project
router.post('/checkout/:projectId', auth, async (req, res) => {
  const { successUrl, cancelUrl, amount } = req.body;
  if (!amount || Number(amount) <= 0) return res.status(400).json({ message: 'Invalid amount' });
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `Contribution to ${project.title}` },
          unit_amount: Math.round(Number(amount) * 100),
        },
        quantity: 1,
      }],
      success_url: successUrl || `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&project=${project.id}`,
      cancel_url: cancelUrl || (process.env.CLIENT_URL || 'http://localhost:5173'),
      metadata: { projectId: project.id, userId: req.user.id },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err && err.raw ? err.raw : err)
    // try to return Stripe's message if present
    const msg = err?.message || (err?.raw && err.raw.message) || 'Stripe error'
    res.status(500).json({ message: msg });
  }
});

// Simple confirm endpoint (not webhook-secure). Use only for demo/testing: expects session_id and project id.
router.post('/confirm', async (req, res) => {
  const { session_id, project } = req.body;
  try {
    if (!session_id || !project) return res.status(400).json({ message: 'Missing session_id or project' });
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') return res.status(400).json({ message: 'Payment not completed' });
    const amount = session.amount_total / 100;
    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ message: 'Project not found' });
    proj.collected += amount;
    if (proj.collected >= proj.goal) proj.isFunded = true;
    await proj.save();
    res.json({ ok: true, project: proj });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error confirming payment' });
  }
});

module.exports = router;
