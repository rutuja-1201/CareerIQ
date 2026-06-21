import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { runCareerIntelligenceScan } from '../services/intelligence.service.js';

const router = express.Router();

router.post('/scan', authenticate, upload.single('resume'), async (req, res, next) => {
  try {
    const { githubUsername, targetRole, currentSalary } = req.body;
    const report = await runCareerIntelligenceScan({
      userId: req.userId,
      file: req.file,
      githubUsername,
      targetRole,
      currentSalary,
    });
    res.status(201).json({ report });
  } catch (err) {
    if (err.message?.includes('GitHub API')) {
      return res.status(404).json({ message: 'GitHub user not found or rate limited' });
    }
    if (err.message?.includes('required') || err.message?.includes('Upload')) {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
});

export default router;
