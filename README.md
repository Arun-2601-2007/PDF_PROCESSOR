# PDF_PROCESSOR

OVERVIEW

This project is a minimal end-to-end PDF processing backend service with a simple frontend.
It allows users to upload multiple PDF files, processes them asynchronously (PDF merge), tracks job status, and provides a downloadable result.

The system supports:

  • Job-based asynchronous processing
  
  • Polling for job status
  
  • File size validation
  
  • Automatic result download


FEATURES IMPLEMENTED


CORE REQUIREMENTS

  • REST API to create file processing jobs
  
  • Asynchronous job execution
  
  • Job status polling (PENDING, PROCESSING, COMPLETED, FAILED)
  
  • Result URL for successful jobs


BONUS FEATURES COMPLETED

  • Simple frontend to upload PDF files
  
  • Automatic download of merged PDF after processing

THOUGHT PROCESS AND DESIGN APPROACH

The primary goal was to design a minimal yet robust PDF processing service that can handle computationally expensive tasks without blocking client requests.

1. Job-Based Architecture

Since PDF operations such as merging are time-consuming, the system was designed around a job-based model. Instead of processing files synchronously, each request creates a job with a unique job ID. This allows the server to respond immediately while the actual processing happens in the background.

2. Asynchronous Processing

To prevent server crashes and improve responsiveness, PDF processing is executed asynchronously. This ensures that the main API thread remains free to handle incoming requests, even when multiple jobs are being processed.

3. Clear Job State Management


Each job progresses through well-defined states: PENDING, PROCESSING, COMPLETED, and FAILED. These states make it easy for clients to track progress and handle errors gracefully.

4. Dual Input Support (Frontend and API)

Two job creation methods were intentionally supported:
• File uploads via a frontend interface
• Public file URLs via an API endpoint

5. Polling-Based Status Tracking

Instead of complex real-time communication, a polling mechanism was chosen. The frontend periodically checks job status, which keeps the system simple and reliable while still providing timely updates.

6. Resource Safety Considerations

To avoid excessive memory or CPU usage:
• File size limits were enforced
• The number of files per job was restricted
• Processing was performed sequentially per job


7. User Experience Focus

A simple frontend was added to improve usability. Automatic file download after successful processing removes the need for manual steps, making the experience smooth and intuitive.

8. Separation of Concerns

The system is divided into clear responsibilities:
• The API layer handles request validation and job creation
• The processing layer performs PDF merging
• The database stores job metadata
• The frontend manages user interaction and polling

TECH STACK

Frontend

  • HTML
  
  • CSS
  
  • Vanilla JavaScript

Backend

  • Node.js
  
  • Express.js
  
  • Multer (file uploads)
  
  • pdf-lib (PDF merging)
  
  • Axios (fetch PDFs from URLs)
  
  • MongoDB with Mongoose


PROJECT STRUCTURE

project-root
|
|-- public
| |-- index.html (Frontend UI + JS logic)
|
|-- uploads (Temporary uploaded PDF files)
|-- output (Final merged PDF files)
|
|-- server.js (Main Express server)
|-- jobModel.js (MongoDB Job schema)
|-- pdfProcessor.js (PDF merge logic)
|
|-- package.json


SETUP INSTRUCTIONS

Step 1: Install dependencies
npm install

Step 2: Start MongoDB
MongoDB should be running locally at:
mongodb://localhost:27017/pdfjobs

Step 3: Start the server
node server.js
Server runs at:
http://localhost:3000


END-TO-END FLOW

  User selects PDF files from browser
  
  Files are uploaded to backend
  
  A job is created with status PENDING
  
  PDF processing runs in background
  
  Frontend polls job status
  
  Once completed, merged PDF is downloaded automatically


API ENDPOINTS OVERVIEW

  POST /api/upload
  
  POST /api/jobs
  
  GET /api/jobs/:jobId
  
  GET /download/:jobId


IMPORTANT: FRONTEND vs POSTMAN USAGE

This project has TWO ways to create jobs.


FRONTEND-BASED FLOW (index.html)

Used by normal users through the browser.

Endpoints used by frontend:

POST /api/upload

  • Uploads real PDF files
  
  • Uses multipart/form-data
  
  • Multer stores files in uploads folder
  
  • Automatically creates job

GET /api/jobs/:jobId

  • Frontend polls job status every 2 seconds

GET /download/:jobId

  • Automatically triggered by browser
  
  • Downloads merged PDF


NOTE:

Frontend DOES NOT need online URLs.
It uploads real files from user’s system.


POSTMAN / API TESTING FLOW

Used for backend testing and task validation.

Endpoint used in Postman:

POST /api/jobs

This endpoint:

  • Accepts JSON only
  
  • DOES NOT accept file uploads
  
  • Requires PUBLIC ONLINE PDF URLs

Example Postman Request:

POST http://localhost:3000/api/jobs
Headers:
Content-Type: application/json
Body (raw JSON):
{
  "job_type": "MERGE_PDF",
  "input_files": [
    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    "https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf"
  ]
}

Why online URLs are required:

  • Backend downloads PDFs using axios.get(url)
  
  • Local file paths do not work in Postman

You can then poll job status using:
GET /api/jobs/:jobId


ENDPOINT USAGE SUMMARY

Endpoint | Used By | Purpose

  POST /api/upload | Frontend | Upload PDFs
  
  POST /api/jobs | Postman | Job via URLs
  
  GET /api/jobs/:jobId | Both | Job status

  GET /download/:jobId | Frontend | Download PDF


JOB STATUS STATES

  • PENDING – Job created, waiting to start
  
  • PROCESSING – PDF merge in progress
  
  • COMPLETED – PDF merged successfully
  
  • FAILED – Error during processing


VALIDATIONS & SAFETY

  • Maximum file size: 5MB per PDF
  
  • Maximum files per job: 5
  
  • Client-side file size validation
  
  • Server-side file size enforcement
  
  • Background processing prevents server blocking


DESIGN DECISIONS

  • Job-based architecture for scalability
  
  • Asynchronous processing to avoid request blocking
  
  • Polling approach for simplicity

  • Clear separation of frontend and backend logic


AUTHOR

Aruneswar
