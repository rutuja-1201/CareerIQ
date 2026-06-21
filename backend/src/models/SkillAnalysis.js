import mongoose from 'mongoose';

const skillAnalysisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
    jobDescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobDescription' },
    resumeSkills: [{ type: String }],
    jdSkills: [{ type: String }],
    match: { type: Number, required: true },
    missing: [{ type: String }],
    matched: [{ type: String }],
    learningRoadmap: [
      {
        week: Number,
        skill: String,
        focus: String,
        resources: [{ type: String }],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('SkillAnalysis', skillAnalysisSchema);
