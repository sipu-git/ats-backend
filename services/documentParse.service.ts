import { generativeAi } from "../configs/gemini.config";

export interface ExtractInfo {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  education?: {
    schoolOrCollege: string;
    course: string;
    startYear?: string;
    endYear?: string;
  }[];
  experience?: {
    company: string;
    designation: string;
    startDate?: string;
    endDate?: string;
  }[];
}


export async function parseDocument(
  docText: string,
  retry = 1
): Promise<ExtractInfo> {
  try {
    const model = generativeAi.getGenerativeModel({
      model: "gemini-3-flash-preview"
    });

    const prompt = `
You are a STRICT JSON API.
You MUST return ONLY valid JSON.
NO markdown.
NO explanation.
NO extra text.

Extract structured data from this resume.
"experience" means:
- Work Experience
- Professional Experience
- Employment History
- Internships
- Projects
- Freelance Work

Each experience entry MUST include:
- company
- designation (job title or role)
- startDate (month/year if available)
- endDate (month/year or "Present")

If multiple roles exist at the same company, return them as separate objects.
If any work history is found, you MUST return at least 1 object in "experience".
Never return an empty array if experience exists in the resume.

Return EXACTLY this format:
{
  "name": "",
  "email": "",
  "phone": "",
  "skills": [],
  "education": [
    {
      "schoolOrCollege": "",
      "course": "",
      "startYear": "",
      "endYear": ""
    }
  ],
  "experience": [
    {
      "company": "",
      "designation": "",
      "startDate": "",
      "endDate": ""
    }
  ]
}

Rules:
- skills = array of strings
- education = array of objects
- experience = array of objects
- If missing data, return empty string or empty array
- NEVER return null

Resume:
${docText}
`;

    const res = await model.generateContent(prompt);
    const raw = res.response.text().trim();

    const json = extractJson(raw);

    return {
      name: json.name || "",
      email: json.email || "",
      phone: json.phone || "",
      skills: Array.isArray(json.skills) ? normalizeSkills(json.skills):[],
      education: Array.isArray(json.education)
        ? json.education.map((e: any) => ({
          schoolOrCollege: String(e.schoolOrCollege || "").trim(),
          course: String(e.course || "").trim(),
          startYear: e.startYear ? String(e.startYear).trim() : "",
          endYear: e.endYear ? String(e.endYear).trim() : ""
        }))
        : [],

      experience: Array.isArray(json.experience)
        ? json.experience.map((x: any) => ({
          company: String(x.company || "").trim(),
          designation: String(x.designation || "").trim(),
          startDate: x.startDate ? String(x.startDate).trim() : "",
          endDate: x.endDate ? String(x.endDate).trim() : ""
        }))
        : []
    };
  } catch (err) {
    console.error("Resume parsing failed:", err);

    if (retry > 0) {
      console.warn("Retrying resume parsing with stricter mode...");

      return parseDocument(
        docText + "\n\nIMPORTANT: Return ONLY valid minified JSON. Do not add spaces or newlines.",
        retry - 1
      );
    }


    throw new Error("Failed to parse document with AI");
  }
}

function extractJson(text: string): any {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");

  if (first === -1 || last === -1 || last <= first) {
    throw new Error("No valid JSON found in AI response");
  }

  const jsonString = text.slice(first, last + 1);
  return JSON.parse(jsonString);
}

function normalizeSkills(skills: any[]): string[] {
  return [...new Set(
    skills
      .map(s => String(s).toLowerCase().trim())
      .filter(Boolean)
  )];
}


