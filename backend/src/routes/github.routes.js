import express from 'express';
import GithubReport from '../models/GithubReport.js';
import { authenticate } from '../middleware/auth.js';
import { analyzeGithubProfile } from '../services/github.service.js';

const router = express.Router();

router.post('/analyze', authenticate, async (req, res, next) => {
  try {
    const { username } = req.body;
    if (!username?.trim()) return res.status(400).json({ message: 'GitHub username required' });

    const analysis = await analyzeGithubProfile(username.trim());

    const report = await GithubReport.create({
      userId: req.userId,
      ...analysis,
    });

    res.status(201).json({ report });
  } catch (err) {
    if (err.message?.includes('GitHub API')) {
      return res.status(404).json({ message: 'GitHub user not found or rate limited' });
    }
    next(err);
  }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const reports = await GithubReport.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ reports });
  } catch (err) {
    next(err);
  }
});

export default router;
