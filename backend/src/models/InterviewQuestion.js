import mongoose from 'mongoose';

const interviewQuestionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
    jobDescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobDescription' },
    frontend: [{ type: String }],
    backend: [{ type: String }],
    systemDesign: [{ type: String }],
    behavioral: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model('InterviewQuestion', interviewQuestionSchema);
