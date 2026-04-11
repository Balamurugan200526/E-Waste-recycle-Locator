/**
 * Recycle Centers Routes
 * Browse and find nearby centers
 */

const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const RecycleCenter = require('../models/RecycleCenter');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');

// GET /api/centers - get all active centers
router.get('/', optionalAuth, async (req, res) => {
  try {
    const centers = await RecycleCenter.find({ isActive: true }).sort({ name: 1 });
    res.json({ centers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch centers' });
  }
});

// GET /api/centers/nearby - find centers near user location
router.get('/nearby', [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  query('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  query('radius').optional().isInt({ min: 1, max: 200 }).withMessage('Radius must be 1-200 km')
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { lat, lng, radius = 50 } = req.query; // radius in km
    const radiusInMeters = Number(radius) * 1000;

    const centers = await RecycleCenter.find({
      isActive: true,
      location: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radiusInMeters
        }
      }
    }).limit(20);

    // Calculate distance for each center
    const centersWithDistance = centers.map(center => {
      const dist = calculateDistance(
        parseFloat(lat), parseFloat(lng),
        center.location.coordinates[1], center.location.coordinates[0]
      );
      return { ...center.toObject(), distance: dist };
    });

    res.json({ centers: centersWithDistance });
  } catch (error) {
    console.error('Nearby centers error:', error);
    res.status(500).json({ error: 'Failed to find nearby centers' });
  }
});

// GET /api/centers/:id
router.get('/:id', async (req, res) => {
  try {
    const center = await RecycleCenter.findById(req.params.id);
    if (!center) return res.status(404).json({ error: 'Center not found' });
    res.json({ center });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch center' });
  }
});

// POST /api/centers - admin only
router.post('/', authenticate, requireAdmin, [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('address').trim().notEmpty().withMessage('Address required'),
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates [lng, lat] required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const center = new RecycleCenter(req.body);
    await center.save();
    res.status(201).json({ message: 'Center created', center });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create center' });
  }
});

// PUT /api/centers/:id - admin only
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const center = await RecycleCenter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!center) return res.status(404).json({ error: 'Center not found' });
    res.json({ message: 'Center updated', center });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update center' });
  }
});

// DELETE /api/centers/:id - admin only
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const center = await RecycleCenter.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!center) return res.status(404).json({ error: 'Center not found' });
    res.json({ message: 'Center deactivated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete center' });
  }
});

// Haversine formula to calculate distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));
}

module.exports = router;
