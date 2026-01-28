import { generativeAi } from "../configs/gemini.config";
import { JobModel } from "../models/jobs.model";
import type { ExtractInfo } from "./documentParse.service";

export async function scoreResume(
    jobId: string,
    resume: ExtractInfo
) {
    const job = await JobModel.findById(jobId);
    if (!job) throw new Error("Job not found");

    resume = resume || ({} as ExtractInfo);

    const breakdown = {
        skills: 0,
        experience: 0,
        education: 0,
        aiMatch: 0
    };

    // SKILLS MATCHING
    const requiredSkills: string[] = Array.isArray(job.requiredSkills)
        ? job.requiredSkills
        : [];

    const resumeSkills: string[] = Array.isArray(resume.skills)
        ? resume.skills
        : [];

    const matchedSkills = resumeSkills.filter(skill =>
        requiredSkills.some(js =>
            js.toLowerCase().includes(skill.toLowerCase())
        )
    );

    const skillWeight = Number(job.scoringWeights?.skills || 40);

    if (requiredSkills.length > 0) {
        breakdown.skills =
            (matchedSkills.length / requiredSkills.length) *
            skillWeight;
    }

    // EXPERIENCE SCORING
    const years = extractYearsFromExperience(resume.experience || []);
    const minExperience = job.minExperience ? parseInt(job.minExperience) : 0;
    const expWeight = Number(job.scoringWeights?.experience || 30);

    if (minExperience <= 0) {
        breakdown.experience = expWeight;
    } else if (years >= minExperience) {
        breakdown.experience = expWeight;
    } else {
        breakdown.experience =
            (years / minExperience) * expWeight;
    }

    // EDUCATION MATCHING
    const resumeEducationText = normalizeEducation(flattenEducation(resume.education || []));

    const jobEducationText = normalizeEducation(job.education || "");

    const eduWeight = Number(job.scoringWeights?.education || 20);

    if (resumeEducationText &&jobEducationText &&
        (
            resumeEducationText.includes(jobEducationText) ||
            jobEducationText.includes(resumeEducationText)
        )
    ) {
        breakdown.education = eduWeight;
    } else {
        breakdown.education = 0;
    }

    // AI MATCH SCORE
    const aiWeight = Number(job.scoringWeights?.aiMatch || 10);

    try {
        breakdown.aiMatch = Math.min(
            aiWeight,
            await getAiScore(job, resume, aiWeight)
        );
    } catch (err) {
        console.warn("AI scoring failed, defaulting to 0");
        breakdown.aiMatch = 0;
    }

    // TOTAL + STATUS
    const totalScore = Object.values(breakdown).reduce(
        (a, b) => a + b,
        0
    );

    let status: "SHORTLISTED" | "REJECTED" | "REVIEW" = "REJECTED";
    if (totalScore >= 70) status = "SHORTLISTED";
    else if (totalScore >= 50) status = "REVIEW";

    return {
        totalScore: Math.round(totalScore),
        status,
        breakdown: {
            skills: Math.round(breakdown.skills),
            experience: Math.round(breakdown.experience),
            education: Math.round(breakdown.education),
            aiMatch: Math.round(breakdown.aiMatch)
        }
    };
}

// Extract years from structured experience array
function extractYearsFromExperience(
    experience: {
        company: string;
        designation: string;
        startDate?: string;
        endDate?: string;
    }[]
): number {
    if (!Array.isArray(experience)) return 0;

    let totalYears = 0;

    for (const exp of experience) {
        const start = parseYear(exp.startDate);
        const end = parseYear(exp.endDate) || new Date().getFullYear();

        if (start && end && end >= start) {
            totalYears += end - start;
        }
    }

    return totalYears;
}

// Convert education objects into searchable text
function flattenEducation(
  education: any
): string {
  if (typeof education === "string") {
    return education;
  }
  if (!Array.isArray(education)) {
    return "";
  }
  return education
    .map((e) => {
      if (!e || typeof e !== "object") return "";

      return `${e.course || ""} ${e.schoolOrCollege || ""}`;
    })
    .join(" ")
    .trim();
}

function normalizeEducation(text: string) {
  return text
    .toLowerCase()
    // Engineering / Tech
    .replace(/b\.?tech/g, "bachelor of technology")
    .replace(/m\.?tech/g, "master of technology")
    .replace(/b\.?e/g, "bachelor of engineering")
    // Computer / IT
    .replace(/bca/g, "bachelor of computer application")
    .replace(/mca/g, "master of computer application")
    .replace(/cse/g, "computer science")
    .replace(/cs/g, "computer science")
    .replace(/it/g, "information technology")
    // Business / Arts
    .replace(/bba/g, "bachelor of business administration")
    .replace(/mba/g, "master of business administration")
    .replace(/ba/g, "bachelor of arts")
    .replace(/ma/g, "master of arts")

    // Cleanup
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}


function parseYear(value?: string): number | null {
    if (!value) return null;

    const match = value.match(/\d{4}/);
    return match ? parseInt(match[0]) : null;
}
// AI SCORING
async function getAiScore(
    job: any,
    resume: ExtractInfo,
    maxScore: number
) {
    const model = generativeAi.getGenerativeModel({
        model: "gemini-3-flash-preview"
    });

    const educationText = flattenEducation(
        resume.education || []
    );

    const experienceText = (resume.experience || [])
        .map(e =>
            `${e.designation || ""} at ${e.company || ""}`
        )
        .join(", ");

    const prompt = `
You are an ATS scoring system.
Return ONLY a number between 0 and ${maxScore}.

Job:
Title: ${job.title}
Required Skills: ${(job.requiredSkills || []).join(", ")}
Education: ${job.education || "Any"}
Min Experience: ${job.minExperience || "Any"}

Resume:
Skills: ${(resume.skills || []).join(", ")}
Experience: ${experienceText || "Not provided"}
Education: ${educationText || "Not provided"}

Score based on relevance.
`;

    const res = await model.generateContent(prompt);
    const score = parseFloat(res.response.text().trim());

    return isNaN(score) ? 0 : score;
}
