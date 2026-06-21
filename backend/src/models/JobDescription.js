import mongoose from 'mongoose';

const jobDescriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'Untitled Role' },
    rawText: { type: String, required: true },
    skills: [{ type: String }],
    experienceRequired: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('JobDescription', jobDescriptionSchema);
