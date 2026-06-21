import express from 'express';
import JobDescription from '../models/JobDescription.js';
import { authenticate } from '../middleware/auth.js';
import { extractSkillsFromJD } from '../services/skillGap.service.js';
import { extractJDSkillsWithAI } from '../services/huggingface.service.js';

const router = express.Router();

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { text, title } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Job description text required' });

    const algorithmSkills = extractSkillsFromJD(text);
    let parsed = { title: title || 'Untitled Role', skills: algorithmSkills, experienceRequired: 0 };

    try {
      const aiParsed = await extractJDSkillsWithAI(text);
      parsed = {
        title: aiParsed.title || parsed.title,
        skills: aiParsed.skills?.length ? aiParsed.skills : algorithmSkills,
        experienceRequired: aiParsed.experienceRequired || 0,
      };
    } catch {
      const expMatch = text.match(/(\d+)\+?\s*years?/i);
      if (expMatch) parsed.experienceRequired = parseInt(expMatch[1], 10);
    }

    const jd = await JobDescription.create({
      userId: req.userId,
      title: parsed.title,
      rawText: text,
      skills: parsed.skills,
      experienceRequired: parsed.experienceRequired,
    });

    res.status(201).json({
      jobDescription: {
        id: jd._id,
        title: jd.title,
        skills: jd.skills,
        experienceRequired: jd.experienceRequired,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const jobDescriptions = await JobDescription.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select('-rawText');
    res.json({ jobDescriptions });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const jd = await JobDescription.findOne({ _id: req.params.id, userId: req.userId });
    if (!jd) return res.status(404).json({ message: 'Job description not found' });
    res.json({ jobDescription: jd });
  } catch (err) {
    next(err);
  }
});

export default router;
