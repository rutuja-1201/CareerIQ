import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    googleId: { type: String, sparse: true },
    experience: { type: Number, default: 0 },
    skills: [{ type: String }],
    currentSalary: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
