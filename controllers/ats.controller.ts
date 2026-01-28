import type { Request, Response } from "express";
import { ApplicationModel } from "../models/application.model";
import RawDataModel from "../models/data.model";

export const getAtsByJob = async (req: Request, res: Response) => {
    try {
        const { jobId } = req.params;
        const results = await ApplicationModel.find({ jobId }).sort({ score: -1, appliedDate: -1 }).lean();
        return res.status(200).json({ jobId, totalCandidate: results.length, results })

    } catch (error) {
        console.error("ATS JOB FETCH ERROR:", error);
        return res.status(500).json({ error: "Failed to fetch ATS scores" });
    }
}

export const viewAtsScore = async (req: Request, res: Response) => {
    try {
        const { jobId } = req.params;
        const { email } = req.query;
         
        const cleanEmail = String(email).trim().toLowerCase();
        const cleanJobId = String(jobId).trim();
        console.log(cleanEmail);
        const record = await ApplicationModel.findOne({
            jobId: cleanJobId, applicantEmail: {
                $regex: `^${cleanEmail}$`, $options: "i"
            }
        }).lean()
        if (!record) {
            return res.status(404).json({ message: "AI score doesn't found in this job" })
        }
        const attachResume = await RawDataModel.findOne({ documentId: record.documentId }).select("originalFileName skills education experience createdAt").lean()
        return res.status(200).json({
            message: "ATS Score fetched", jobId,
            applicantEmail: email,
            score: record.score,
            status: record.status,
            breakdown: record.breakdown,
            appliedDate: record.appliedDate,
            attachResume
        })
    } catch (error) {
        console.error("VIEW ATS ERROR:", error);
        return res.status(500).json({ error: "Failed to fetch ATS score" });
    }
}