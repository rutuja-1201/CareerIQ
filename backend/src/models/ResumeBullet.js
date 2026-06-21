import mongoose from 'mongoose';

const resumeBulletSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    original: { type: String, required: true },
    optimized: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('ResumeBullet', resumeBulletSchema);
