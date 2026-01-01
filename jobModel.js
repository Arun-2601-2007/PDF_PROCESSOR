const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  jobId: String,
  jobType: String,
  inputFiles: [String],
  status: String,
  resultUrl: String
});

module.exports = mongoose.model("Job", jobSchema);
