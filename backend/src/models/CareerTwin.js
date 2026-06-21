import mongoose from 'mongoose';

const careerTwinSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userMessage: { type: String, required: true },
    interpretedGoal: { type: String },
    targetRole: { type: String, required: true },
    timelineMonthsRequested: { type: Number, default: 12 },
    estimatedTimelineMonths: { type: Number },
    currentReadiness: { type: Number },
    expectedReadiness: { type: Number },
    missingSkills: [{ type: String }],
    matchedSkills: [{ type: String }],
    weeklyLearningPlan: [
      { week: Number, skill: String, focus: String, resources: [{ type: String }] },
    ],
    twinReply: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('CareerTwin', careerTwinSchema);
