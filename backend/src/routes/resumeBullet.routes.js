import express from 'express';
import ResumeBullet from '../models/ResumeBullet.js';
import { authenticate } from '../middleware/auth.js';
import { optimizeResumeBullet } from '../services/huggingface.service.js';

const router = express.Router();

router.post('/optimize', authenticate, async (req, res, next) => {
  try {
    const { bullet } = req.body;
    if (!bullet?.trim()) return res.status(400).json({ message: 'Bullet point required' });

    let optimized = bullet;
    try {
      const result = await optimizeResumeBullet(bullet);
      optimized = result.optimized || bullet;
    } catch {
      optimized = `Spearheaded ${bullet.replace(/^worked on/i, '').trim()} delivering measurable impact.`;
    }

    const record = await ResumeBullet.create({
      userId: req.userId,
      original: bullet,
      optimized,
    });

    res.status(201).json({
      id: record._id,
      original: record.original,
      optimized: record.optimized,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/history', authenticate, async (req, res, next) => {
  try {
    const bullets = await ResumeBullet.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(20);
    res.json({ bullets });
  } catch (err) {
    next(err);
  }
});

export default router;
