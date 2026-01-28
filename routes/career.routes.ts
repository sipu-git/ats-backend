import express from 'express'
import multer from 'multer';
import { applyForJob, parseResume, viewApplication, viewApplications } from '../controllers/application.controller';
import { createJob, getJobById, getJobs, searchJobs } from '../controllers/job.controller';
import { getAtsByJob, viewAtsScore } from '../controllers/ats.controller';

const router = express.Router()
const uploadDoc = multer({ storage: multer.memoryStorage() })

router.post("/parse-resume", uploadDoc.single("document"), parseResume)
router.post("/apply-job", applyForJob);
router.post("/add-job", createJob);
router.get("/get-jobs", getJobs);
router.get("/get-job/:id", getJobById)
router.get("/search-jobs", searchJobs);
router.get("/view-application/:id", viewApplication)
router.get("/view-applications", viewApplications)
router.get("/view-ats-score/:jobId", viewAtsScore)
router.get("/view-ats-by-job/:jobId", getAtsByJob)
export default router;