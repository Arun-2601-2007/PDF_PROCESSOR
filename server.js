const express = require("express");
const mongoose = require("mongoose");
const Job = require("./jobModel");
const processPDF = require("./pdfProcessor");

const multer = require("multer");
const path = require("path");

const app = express();

app.use(express.json());

// Serve frontend & uploaded files
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// Multer config (5MB limit)
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }
});

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/pdfjobs")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Create Job using URLs
app.post("/api/jobs", async (req, res) => {
  const { job_type, input_files } = req.body;

  if (!job_type || !input_files || input_files.length === 0) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const jobId = "job_" + Date.now();

  await Job.create({
    jobId,
    jobType: job_type,
    inputFiles: input_files,
    status: "PENDING"
  });

  setTimeout(() => processPDF(jobId), 1000);

  res.json({ job_id: jobId, status: "PENDING" });
});

app.post("/api/upload", (req, res) => {
  upload.array("files", 5)(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File too large! Max size is 100MB." });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const fileUrls = req.files.map(
      file => `http://localhost:3000/uploads/${file.filename}`
    );

    const jobId = "job_" + Date.now();

    // Create Job in DB
    await Job.create({
      jobId,
      jobType: "MERGE_PDF",
      inputFiles: fileUrls,
      status: "PENDING"
    });

    // **Process in background, do NOT await**
    setTimeout(() => {
      processPDF(jobId)
        .then(() => console.log(`Job ${jobId} processed.`))
        .catch(err => console.error(err));
    }, 1000);

    // Send response immediately
    res.json({ job_id: jobId, status: "PENDING" });
  });
});


// Get Job Status
app.get("/api/jobs/:jobId", async (req, res) => {
  const job = await Job.findOne({ jobId: req.params.jobId });
  if (!job) return res.status(404).json({ error: "Job not found" });

  res.json({
    job_id: job.jobId,
    status: job.status,
    result_url: job.resultUrl
  });
});

// Download result PDF
app.get("/download/:jobId", (req, res) => {
  const filePath = path.join(process.cwd(), "output", `${req.params.jobId}.pdf`);
  res.download(filePath);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
