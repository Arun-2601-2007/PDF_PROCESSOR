const { PDFDocument } = require("pdf-lib");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Job = require("./jobModel");

async function processPDF(jobId) {
  const job = await Job.findOne({ jobId });
  if (!job) return;

  try {
    job.status = "PROCESSING";
    await job.save();

    const mergedPdf = await PDFDocument.create();

    for (const url of job.inputFiles) {
      const pdfBytes = (await axios.get(url, { responseType: "arraybuffer" })).data;
      const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

      if (pdfBytes.length > MAX_SIZE) {
        throw new Error("File size exceeds limit");
      }

      const pdf = await PDFDocument.load(pdfBytes);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(p => mergedPdf.addPage(p));
    }

    const pdfBytes = await mergedPdf.save();

    const outputPath = path.join(process.cwd(), "output", `${jobId}.pdf`);
    fs.writeFileSync(outputPath, pdfBytes);

    job.status = "COMPLETED";
    job.resultUrl = `/download/${jobId}`;
    await job.save();

  } catch (err) {
    console.error("PDF PROCESSING ERROR:", err.message);
    job.status = "FAILED";
    await job.save();
  }
}

module.exports = processPDF;
