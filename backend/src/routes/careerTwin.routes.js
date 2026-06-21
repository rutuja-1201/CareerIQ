import express from 'express';
import CareerTwin from '../models/CareerTwin.js';
import { authenticate } from '../middleware/auth.js';
import { generateCareerTwinPlan } from '../services/careerTwin.service.js';

const router = express.Router();

router.post('/chat', authenticate, async (req, res, next) => {
  try {
    const { message } = req.body;
    const plan = await generateCareerTwinPlan(req.userId, message);
    res.status(201).json({ plan });
  } catch (err) {
    if (err.message?.includes('Tell Career Twin')) {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
});

router.get('/history', authenticate, async (req, res, next) => {
  try {
    const plans = await CareerTwin.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(10);
    res.json({ plans });
  } catch (err) {
    next(err);
  }
});

export default router;
