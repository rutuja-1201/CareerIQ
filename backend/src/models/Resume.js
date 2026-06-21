import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileName: { type: String, required: true },
    extractedText: { type: String, default: '' },
    skills: [{ type: String }],
    atsScore: { type: Number },
    missingKeywords: [{ type: String }],
    strengths: [{ type: String }],
    feedback: { type: String, default: '' },
    resumeQuality: { type: String, default: '' },
    weakBullets: [{ before: String, after: String }],
  },
  { timestamps: true }
);

export default mongoose.model('Resume', resumeSchema);
