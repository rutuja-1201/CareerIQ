import mongoose from 'mongoose';

const githubReportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    username: { type: String, required: true },
    developerScore: { type: Number },
    strengths: [{ type: String }],
    frameworks: [{ type: String }],
    topics: [{ type: String }],
    languages: [{ name: String, bytes: Number }],
    recentActivity: { type: Number, default: 0 },
    totalRepos: { type: Number, default: 0 },
    totalStars: { type: Number, default: 0 },
    totalCommits: { type: Number, default: 0 },
    topRepos: [{ name: String, stars: Number, language: String }],
  },
  { timestamps: true }
);

export default mongoose.model('GithubReport', githubReportSchema);
