import express from 'express';
import SkillAnalysis from '../models/SkillAnalysis.js';
import Resume from '../models/Resume.js';
import JobDescription from '../models/JobDescription.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { computeSkillGap } from '../services/skillGap.service.js';
import { generateLearningRoadmap } from '../services/huggingface.service.js';
import { getTargetSkillsForRole, buildCompleteRoadmap } from '../constants/jobRoles.js';

const router = express.Router();

router.post('/analyze', authenticate, async (req, res, next) => {
  try {
    const { resumeId, jobDescriptionId, resumeSkills, jdSkills, targetRole } = req.body;

    let rSkills = resumeSkills || [];
    let jSkills = jdSkills || [];

    if (resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, userId: req.userId });
      if (resume) rSkills = resume.skills;
    }
    if (jobDescriptionId) {
      const jd = await JobDescription.findOne({ _id: jobDescriptionId, userId: req.userId });
      if (jd) jSkills = jd.skills;
    } else if (targetRole?.trim()) {
      jSkills = getTargetSkillsForRole(targetRole);
    }
    if (!rSkills.length) {
      const user = await User.findById(req.userId);
      rSkills = user?.skills || [];
    }

    if (!jSkills.length) {
      return res.status(400).json({ message: 'Select a job description or target role' });
    }

    const gap = computeSkillGap(rSkills, jSkills);

    let learningRoadmap = [];
    if (gap.missing.length) {
      try {
        const aiRoadmap = await generateLearningRoadmap(gap.missing);
        learningRoadmap = aiRoadmap.length >= gap.missing.length ? aiRoadmap : buildCompleteRoadmap(gap.missing);
      } catch {
        learningRoadmap = buildCompleteRoadmap(gap.missing);
      }
    }

    const analysis = await SkillAnalysis.create({
      userId: req.userId,
      resumeId: resumeId || undefined,
      jobDescriptionId: jobDescriptionId || undefined,
      resumeSkills: gap.resumeSkills,
      jdSkills: gap.jdSkills,
      match: gap.match,
      missing: gap.missing,
      matched: gap.matched,
      learningRoadmap,
    });

    res.status(201).json({
      analysis: {
        id: analysis._id,
        match: analysis.match,
        missing: analysis.missing,
        matched: analysis.matched,
        resumeSkills: analysis.resumeSkills,
        jdSkills: analysis.jdSkills,
        learningRoadmap: analysis.learningRoadmap,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const analyses = await SkillAnalysis.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ analyses });
  } catch (err) {
    next(err);
  }
});

export default router;
