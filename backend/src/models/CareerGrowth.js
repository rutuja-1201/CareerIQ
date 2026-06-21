import mongoose from 'mongoose';

const careerGrowthSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    currentSkills: [{ type: String }],
    targetRole: { type: String, required: true },
    currentSalaryLpa: { type: Number },
    marketScore: { type: Number },
    expectedReadiness: { type: Number },
    potentialSalaryRange: { type: String },
    missingSkills: [{ type: String }],
    matchedSkills: [{ type: String }],
    estimatedLearningMonths: { type: Number },
    salaryIncrease: { type: String },
    roadmap: [{ week: Number, skill: String, focus: String, resources: [{ type: String }] }],
  },
  { timestamps: true }
);

export default mongoose.model('CareerGrowth', careerGrowthSchema);
