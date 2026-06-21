import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    appliedDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['Applied', 'OA', 'Interview', 'Rejected', 'Offer', 'Joined'],
      default: 'Applied',
    },
    salary: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Application', applicationSchema);
