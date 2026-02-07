import express from 'express'
import multer from 'multer';
import { applyForJob, deleteApplication, parseResume, viewApplication, viewApplications, viewApplicationsByJob, viewRecentApplications } from '../controllers/application.controller';
import { createJob, deleteJob, getJobById, getJobs, modifyJob, searchJobs, viewLatestJob } from '../controllers/job.controller';
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
router.put("/modify-job/:id",modifyJob)
router.delete("/delete-job/:id",deleteJob)
router.get("/view-recent-application",viewRecentApplications)
router.delete("/delete-application/:id",deleteApplication)
router.get("/view-recent-job",viewLatestJob)
router.get("/view-existed-application",viewApplicationsByJob)
export default router;