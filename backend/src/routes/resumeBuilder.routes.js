import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import ResumeBuilder from '../models/ResumeBuilder.js';
import { optimizeResume } from '../services/resumeBuilder.service.js';
import { generateResumePDF } from '../services/pdf.resume.service.js';

const router = express.Router();

// Optimize resume with job description
router.post(
  '/optimize',
  authenticate,
  [
    body('resumeText').notEmpty().withMessage('Resume text is required'),
    body('jobDescription').notEmpty().withMessage('Job description is required'),
  ],
  async (req, res, next) => {
    try {
      console.log('Resume optimization request body:', {
        hasResumeText: !!req.body.resumeText,
        hasJobDescription: !!req.body.jobDescription,
        resumeTextLength: req.body.resumeText?.length || 0,
        jobDescriptionLength: req.body.jobDescription?.length || 0
      });

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { resumeText, jobDescription } = req.body;

      // Optimize resume
      const optimization = await optimizeResume(resumeText, jobDescription);

      // Save to database
      const resumeBuilder = await ResumeBuilder.create({
        userId: req.userId,
        originalResume: resumeText,
        jobDescription,
        targetRole: optimization.targetRole,
        optimizedResume: optimization.optimizedResume,
        extractedKeywords: optimization.extractedKeywords,
        addedKeywords: optimization.addedKeywords,
        atsScoreBefore: optimization.atsScoreBefore,
        atsScoreAfter: optimization.atsScoreAfter,
        improvements: optimization.improvements,
      });

      res.json({
        success: true,
        data: {
          id: resumeBuilder._id,
          optimizedResume: optimization.optimizedResume,
          atsScoreBefore: optimization.atsScoreBefore,
          atsScoreAfter: optimization.atsScoreAfter,
          addedKeywords: optimization.addedKeywords,
          improvements: optimization.improvements,
          targetRole: optimization.targetRole,
        },
      });
    } catch (error) {
      console.error('Resume optimization error:', error);
      next(error);
    }
  }
);

// Generate PDF for optimized resume
router.get(
  '/generate-pdf/:id',
  authenticate,
  async (req, res, next) => {
    try {
      console.log('PDF generation request for ID:', req.params.id);

      const resumeBuilder = await ResumeBuilder.findOne({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!resumeBuilder) {
        console.log('Resume not found for ID:', req.params.id);
        return res.status(404).json({ success: false, message: 'Resume not found' });
      }

      console.log('Generating PDF for:', resumeBuilder.optimizedResume.contact?.name);

      // Generate PDF
      const pdfBuffer = await generateResumePDF(
        resumeBuilder.optimizedResume,
        resumeBuilder.pdfStyle || {}
      );

      // Update database with PDF status
      resumeBuilder.pdfGenerated = true;
      await resumeBuilder.save();

      // Use candidate name for filename
      const candidateName = resumeBuilder.optimizedResume.contact?.name || 'Resume';
      const safeFilename = candidateName.replace(/[^a-zA-Z0-9]/g, '_');

      console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');

      // Send PDF as response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${safeFilename}_Resume_Optimized.pdf"`
      );

      // Send as binary buffer
      res.end(pdfBuffer, 'binary');
      console.log('PDF sent to client successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate PDF: ' + error.message
      });
    }
  }
);

// Live preview PDF without saving (for editor)
router.post('/preview-pdf', authenticate, async (req, res) => {
  try {
    const { optimizedResume, pdfStyle } = req.body;
    if (!optimizedResume) {
      return res.status(400).json({ success: false, message: 'optimizedResume is required' });
    }

    const pdfBuffer = await generateResumePDF(optimizedResume, pdfStyle || {});

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    res.end(pdfBuffer, 'binary');
  } catch (error) {
    console.error('Preview PDF error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate preview: ' + error.message });
  }
});

// Update resume content and style
router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const { optimizedResume, pdfStyle } = req.body;
    const update = {};
    if (optimizedResume) update.optimizedResume = optimizedResume;
    if (pdfStyle) update.pdfStyle = pdfStyle;

    const resumeBuilder = await ResumeBuilder.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: update },
      { new: true }
    );

    if (!resumeBuilder) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    res.json({
      success: true,
      data: {
        id: resumeBuilder._id,
        optimizedResume: resumeBuilder.optimizedResume,
        pdfStyle: resumeBuilder.pdfStyle,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get all resume builder history for user
router.get('/history', authenticate, async (req, res, next) => {
  try {
    const resumes = await ResumeBuilder.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('targetRole atsScoreBefore atsScoreAfter pdfGenerated createdAt');

    res.json({
      success: true,
      data: resumes,
    });
  } catch (error) {
    next(error);
  }
});

// Get single resume builder by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const resumeBuilder = await ResumeBuilder.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!resumeBuilder) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    res.json({
      success: true,
      data: resumeBuilder,
    });
  } catch (error) {
    next(error);
  }
});

// Delete resume builder entry
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const result = await ResumeBuilder.deleteOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    res.json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
