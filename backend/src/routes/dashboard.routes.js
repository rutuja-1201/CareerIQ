import express from 'express';
import Application from '../models/Application.js';
import Resume from '../models/Resume.js';
import SkillAnalysis from '../models/SkillAnalysis.js';
import InterviewQuestion from '../models/InterviewQuestion.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.userId;

    const [applications, latestResume, latestAnalysis, interviewCount] = await Promise.all([
      Application.find({ userId }),
      Resume.findOne({ userId }).sort({ createdAt: -1 }),
      SkillAnalysis.findOne({ userId }).sort({ createdAt: -1 }),
      InterviewQuestion.countDocuments({ userId }),
    ]);

    const totalApplications = applications.length;
    const interviews = applications.filter((a) => ['Interview', 'Offer', 'Joined'].includes(a.status)).length;
    const offers = applications.filter((a) => ['Offer', 'Joined'].includes(a.status)).length;

    const monthlyData = {};
    applications.forEach((app) => {
      const d = app.appliedDate ? new Date(app.appliedDate) : null;
      if (!d || Number.isNaN(d.getTime())) return;
      const key = d.toLocaleString('en', { month: 'short', year: 'numeric' });
      monthlyData[key] = (monthlyData[key] || 0) + 1;
    });

    const applicationsPerMonth = Object.entries(monthlyData).map(([month, count]) => ({ month, count }));
    const interviewConversionRate = totalApplications
      ? Math.round((interviews / totalApplications) * 100)
      : 0;

    const skillAnalyses = await SkillAnalysis.find({ userId }).sort({ createdAt: 1 }).limit(10);
    const skillGrowthTrend = skillAnalyses.map((a) => ({
      date: a.createdAt,
      match: a.match,
    }));

    const statusBreakdown = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      cards: {
        atsScore: latestResume?.atsScore ?? null,
        matchScore: latestAnalysis?.match ?? null,
        totalApplications,
        interviews,
        offers,
        skillGaps: latestAnalysis?.missing?.length ?? 0,
      },
      charts: {
        applicationsPerMonth,
        interviewConversionRate,
        skillGrowthTrend,
        statusBreakdown,
      },
      recent: {
        latestResume: latestResume
          ? { id: latestResume._id, atsScore: latestResume.atsScore, fileName: latestResume.fileName }
          : null,
        latestAnalysis: latestAnalysis
          ? { id: latestAnalysis._id, match: latestAnalysis.match, missing: latestAnalysis.missing }
          : null,
        interviewSessions: interviewCount,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
