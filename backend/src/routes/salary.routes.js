import express from 'express';
import SalaryReport from '../models/SalaryReport.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { predictSalary } from '../services/salary.service.js';

const router = express.Router();

router.post('/predict', authenticate, async (req, res, next) => {
  try {
    let { experience, skills } = req.body;

    if (experience === undefined || !skills?.length) {
      const user = await User.findById(req.userId);
      experience = experience ?? user?.experience ?? 0;
      skills = skills?.length ? skills : user?.skills || [];
    }

    const predictions = predictSalary(experience, skills);

    const report = await SalaryReport.create({
      userId: req.userId,
      experience,
      skills,
      predictions,
    });

    res.status(201).json({ id: report._id, experience, skills, predictions });
  } catch (err) {
    next(err);
  }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const reports = await SalaryReport.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ reports });
  } catch (err) {
    next(err);
  }
});

export default router;
