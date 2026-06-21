import express from 'express';
import Resume from '../models/Resume.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { extractTextFromPDF } from '../services/pdf.service.js';
import { extractSkillsFromResume } from '../services/skillGap.service.js';
import { calculateATSScore } from '../services/ats.service.js';
import { analyzeResumeWithAI } from '../services/huggingface.service.js';

const router = express.Router();

router.post('/upload', authenticate, upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'PDF file required' });

    let extractedText;
    try {
      extractedText = await extractTextFromPDF(req.file.buffer);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Could not extract text from PDF. The file may be corrupted or image-based.'
      });
    }

    if (!extractedText) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract text from PDF. The PDF may be empty or contain only images.'
      });
    }

    const skills = extractSkillsFromResume(extractedText);
    const user = await User.findById(req.userId);
    const jdText = req.body.jobDescription || '';

    const algorithmScore = calculateATSScore(
      extractedText,
      jdText,
      skills,
      [],
      user?.experience || 0,
      0
    );

    let aiAnalysis = {};
    try {
      aiAnalysis = await analyzeResumeWithAI(extractedText, jdText);
    } catch {
      aiAnalysis = {
        atsScore: algorithmScore.atsScore,
        missingKeywords: algorithmScore.missingKeywords,
        strengths: algorithmScore.strengths,
        feedback: 'Resume analyzed using algorithmic scoring.',
      };
    }

    const atsScore = aiAnalysis.atsScore ?? algorithmScore.atsScore;
    const resume = await Resume.create({
      userId: req.userId,
      fileName: req.file.originalname,
      extractedText,
      skills,
      atsScore,
      missingKeywords: aiAnalysis.missingKeywords || algorithmScore.missingKeywords,
      strengths: aiAnalysis.strengths || algorithmScore.strengths,
      feedback: aiAnalysis.feedback || '',
      resumeQuality: aiAnalysis.resumeQuality || (atsScore >= 75 ? 'Strong' : atsScore >= 55 ? 'Good' : 'Needs Work'),
      weakBullets: aiAnalysis.weakBullets || [],
    });

    if (skills.length && user) {
      user.skills = [...new Set([...user.skills, ...skills])];
      await user.save();
    }

    res.status(201).json({
      success: true,
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        extractedText: resume.extractedText,
        atsScore: resume.atsScore,
        missingKeywords: resume.missingKeywords,
        strengths: resume.strengths,
        skills: resume.skills,
        feedback: resume.feedback,
        resumeQuality: resume.resumeQuality,
        weakBullets: resume.weakBullets,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select('-extractedText');
    res.json({ resumes });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.userId });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.json({ resume });
  } catch (err) {
    next(err);
  }
});

export default router;
