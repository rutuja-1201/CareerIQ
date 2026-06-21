import mongoose from 'mongoose';

const resumeBuilderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalResume: { type: String, required: true },
    jobDescription: { type: String, required: true },
    targetRole: { type: String, default: '' },

    // Optimization results
    optimizedResume: {
      contact: {
        name: String,
        email: String,
        phone: String,
        linkedin: String,
        github: String,
        portfolio: String,
      },
      summary: String,
      experience: [{
        title: String,
        company: String,
        location: String,
        duration: String,
        bullets: [String],
      }],
      skills: [String],
      education: [{
        degree: String,
        institution: String,
        year: String,
        details: String,
      }],
      certifications: [String],
    },

    // Analysis
    extractedKeywords: [String],
    addedKeywords: [String],
    atsScoreBefore: { type: Number, default: 0 },
    atsScoreAfter: { type: Number, default: 0 },
    improvements: [String],

    pdfStyle: {
      fontFamily: { type: String, default: 'Helvetica Neue' },
      fontSize: { type: Number, default: 10.5 },
      lineHeight: { type: Number, default: 1.4 },
      sectionSpacing: { type: Number, default: 18 },
      nameFontSize: { type: Number, default: 28 },
      pagePadding: { type: Number, default: 40 },
    },

    // PDF
    pdfUrl: { type: String, default: '' },
    pdfGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('ResumeBuilder', resumeBuilderSchema);
