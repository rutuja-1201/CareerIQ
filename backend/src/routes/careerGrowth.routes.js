import express from 'express';
import CareerGrowth from '../models/CareerGrowth.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { generateCareerGrowthPlan } from '../services/huggingface.service.js';
import { normalizeGrowthPlan } from '../constants/jobRoles.js';
import { computeCareerProjection } from '../services/intelligence.service.js';

const router = express.Router();

router.post('/simulate', authenticate, async (req, res, next) => {
  try {
    let { currentSkills, targetRole, currentSalary } = req.body;
    if (!targetRole?.trim()) return res.status(400).json({ message: 'Target role required' });

    const user = await User.findById(req.userId);
    if (!currentSkills?.length) currentSkills = user?.skills || [];

    const parseLpa = (v) => {
      if (!v) return null;
      const n = parseFloat(String(v).replace(/[^\d.]/g, ''));
      return Number.isFinite(n) ? n : null;
    };
    const currentLpa = parseLpa(currentSalary) ?? parseLpa(user?.currentSalary) ?? 6;

    let aiPlan = {};
    try {
      aiPlan = await generateCareerGrowthPlan(currentSkills, targetRole);
    } catch {
      aiPlan = {};
    }

    const plan = normalizeGrowthPlan(aiPlan, currentSkills, targetRole);
    const projection = computeCareerProjection(currentLpa, plan.marketScore, plan.missingSkills);

    const record = await CareerGrowth.create({
      userId: req.userId,
      currentSkills,
      targetRole: targetRole.trim(),
      currentSalaryLpa: currentLpa,
      expectedReadiness: projection.expectedReadiness,
      potentialSalaryRange: projection.potentialSalaryRange,
      ...plan,
    });

    res.status(201).json({
      id: record._id,
      currentSkills,
      targetRole: record.targetRole,
      currentSalaryLpa: currentLpa,
      marketScore: record.marketScore,
      expectedReadiness: projection.expectedReadiness,
      potentialSalaryRange: projection.potentialSalaryRange,
      missingSkills: record.missingSkills,
      matchedSkills: plan.matchedSkills,
      estimatedLearningMonths: record.estimatedLearningMonths,
      salaryIncrease: projection.salaryIncrease,
      roadmap: record.roadmap,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const plans = await CareerGrowth.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ plans });
  } catch (err) {
    next(err);
  }
});

export default router;
