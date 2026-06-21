import mongoose from 'mongoose';

const salaryReportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    experience: { type: Number, required: true },
    skills: [{ type: String }],
    predictions: {
      Nagpur: String,
      Pune: String,
      Bangalore: String,
      Mumbai: String,
      Hyderabad: String,
      Delhi: String,
      Remote: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model('SalaryReport', salaryReportSchema);
