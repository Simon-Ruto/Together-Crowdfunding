const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

const app = express();

// Security middlewares
// Allow cross-origin resource policy for static media, but disable the
// cross-origin embedder policy so the browser doesn't block images served
// cross-origin when the frontend is on a different port.
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(limiter);
// Restrict CORS to the client origin when available, fallback to localhost:5173
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));

// ensure uploads directory exists (multer will write files here)
const fs = require('fs');
const uploadsDir = path.join(__dirname, '..', 'uploads');
try {
  fs.mkdirSync(uploadsDir, { recursive: true });
} catch (e) {
  console.error('Failed to create uploads directory', e.message);
}

// Need JSON for regular routes
app.use(express.json());

// Stripe webhook needs the raw body to validate signature. We'll capture raw body on the webhook route using a custom middleware below when mounting.

// serve uploads (backend/uploads)
// Add a small middleware that sets permissive response headers for the
// uploads route so images are loadable from the frontend origin without
// being blocked by the browser's ORB/COEP enforcement.
app.use('/uploads', (req, res, next) => {
  // Allow the client origin (or localhost dev url) to access these resources
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:5173');
  // Ensure Cross-Origin-Resource-Policy is permissive for images
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '..', 'uploads')));

// root health check / friendly message
app.get('/', (req, res) => {
  // If you run the frontend separately, you may prefer a redirect to the client URL.
  // If CLIENT_URL is set in .env, redirect there; otherwise return a simple JSON message.
  const client = process.env.CLIENT_URL
  if (client) return res.redirect(client)
  return res.json({ status: 'ok', message: 'Together API is running' })
});

// routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const paymentsRoutes = require('./routes/payments');
const webhooksRoutes = require('./routes/webhooks');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/payments', paymentsRoutes);

// Mount webhook route with raw body capture
// Mount webhook route with raw body capture
app.use('/webhooks/stripe', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body; // attach raw body (Buffer) for signature verification
  next();
}, webhooksRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    w: 'majority',
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB Atlas connection error:', err.message);
    process.exit(1);
  });
