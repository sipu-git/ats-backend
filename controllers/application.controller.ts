import { uploadToS3, downloadFromS3 } from "../services/s3.service";
import { createRawData } from "../lib/generateDocId";
import { parseDocument } from "../services/documentParse.service";
import { extractTextFromFileBuffer } from "../services/textExtractor.service";
import { scoreResume } from "../services/resumeScoring.service";
import { ApplicationModel } from "../models/application.model";
import { JobModel } from "../models/jobs.model";
import { notifyCandidate } from "../services/notification.service";
import { buildScoringResume, normalizeEducation, normalizeExperience } from "../lib/normalizedData";
import type { Request, Response } from "express";

export const parseResume = async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file required"
      });
    }
    const s3Key = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    const fileBuffer = await downloadFromS3(s3Key);
    const text = await extractTextFromFileBuffer(
      fileBuffer,
      req.file.originalname
    );

    const extractedData = await parseDocument(text);

    return res.status(201).json({
      message: "Resume parsed successfully", data: {
        ...extractedData,
        education: extractedData.education || [],
        experience: extractedData.experience || []
      }
    });

  } catch (error) {
    console.error("Parse resume failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to parse resume"
    });
  }
}
export const applyForJob = async (req: Request, res: Response) => {
  try {
    const { jobId, formData } = req.body;

    if (!formData || !jobId) {
      return res.status(400).json({
        success: false,
        message: "formData and jobId are required"
      });
    }

    const job = await JobModel.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }
    const safeFormData = {
      name: String(formData.name || "").trim(),
      email: String(formData.email || "").trim(),
      phone: String(formData.phone || "").trim(),

      skills: Array.isArray(formData.skills)
        ? formData.skills.map((s: any) => String(s).trim())
        : [],

      education: normalizeEducation(formData.education),
      experience: normalizeExperience(formData.experience)
    };

    const scoringResume = buildScoringResume(safeFormData);
    const result = await scoreResume(jobId, scoringResume);
    if (!safeFormData.name || !safeFormData.email || !safeFormData.phone) {
      return res.status(400).json({ message: "All fields are mandatory" })
    }
    const emailCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailCheck.test(safeFormData.email)) {
      return res.status(401).json({ message: "Invalid email address!" })
    }
    const phoneCheck = /^[0-9+\-\s]{7,15}$/;
    if (!phoneCheck.test(safeFormData.phone)) {
      return res.status(401).json({ message: "Invalid phone number!" })
    }
    if (!safeFormData.skills.length) {
      return res.status(400).json({ message: "At least one skills required!" })
    }
    if (!safeFormData.education.length) {
      return res.status(400).json({
        success: false,
        message: "At least one education entry is required"
      });
    }

    for (const [index, edu] of safeFormData.education.entries()) {
      if (!edu || !edu.course || !edu.schoolOrCollege) {
        return res.status(400).json({
          success: false,
          message: `Education entry #${index + 1} must include course and school/college`
        });
      }
    }

    for (const [index, exp] of safeFormData.experience.entries()) {
      if (!exp.company || !exp.designation) {
        return res.status(400).json({
          success: false,
          message: `Experience entry #${index + 1} must include company and designation`
        });
      }
    }

    // SAVE RAW DATA
    const savedData = (await createRawData({
      originalFileName: "user-edited",
      ...safeFormData
    })) as any;

    // CREATE APPLICATION
    const application = await ApplicationModel.create({
      documentId: savedData.documentId,
      jobId,
      applicantEmail: safeFormData.email,
      score: result.totalScore,
      breakdown: result.breakdown,
      status:
        result.status === "SHORTLISTED" ? "Shortlisted" : result.status === "REJECTED" ? "rejected" : "Reviewing"
    });

    // EMAIL
    await notifyCandidate(
      safeFormData.email,
      result.status,
      job.title,
      safeFormData.name,
      job.company || "HireSphere"
    );

    return res.status(201).json({
      success: true,
      data: {
        autoFilledForm: safeFormData,
        application
      },
      message: "Application submitted and evaluated successfully"
    });
  } catch (error) {
    console.error("Apply job failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to apply for job"
    });
  }
};

export const viewApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Application ID is required!" })
    }
    const findApplication = await ApplicationModel.findById(id);
    if(!findApplication){
      return res.status(404).json({message:"Applications record doesn't exist!"})
    }
    return res.status(200).json({ message: "Application found successfully", data: findApplication })
  } catch (error) {
    console.error("Internal server error");
    return res.status(500).json({ message: "Internal server issue", error })

  }
}
export const viewApplications = async (req: Request, res: Response) => {
  try {
    const findApplications = await ApplicationModel.find().sort({createdAt:-1})
    if (!findApplications || findApplications.length === 0) {
      return res.status(404).json({ message: "Applications not found" })
    }
    return res.status(200).json({ message: "Applications found successfully!",data:findApplications })
  } catch (error) {
    console.error("Internal server error");
    return res.status(500).json({ message: "Internal server issue", error })
  }
}