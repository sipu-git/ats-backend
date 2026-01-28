export function normalizeEducation(education: any[]) {
  if (!Array.isArray(education)) return [];

  return education.map((e) => ({
    schoolOrCollege: String(e.schoolOrCollege || "").trim(),
    course: String(e.course || "").trim(),
    startYear: String(e.startYear || "").trim(),
    endYear: String(e.endYear || "").trim()
  }));
}

export function normalizeExperience(experience: any[]) {
  if (!Array.isArray(experience)) return [];

  return experience.map((e) => ({
    company: String(e.company || "").trim(),
    designation: String(e.designation || "").trim(),
    startDate: String(e.startDate || "").trim(),
    endDate: String(e.endDate || "").trim()
  }));
}

// Convert structured data → AI scoring text
export function buildScoringResume(formData: any) {
  return {
    ...formData,

    education: Array.isArray(formData.education)
      ? formData.education
          .map(
            (e: any) =>
              `${e.course || ""} at ${e.schoolOrCollege || ""} ${e.startYear || ""}-${e.endYear || ""}`
          )
          .join(", ")
      : "",

    experience: Array.isArray(formData.experience)
      ? formData.experience
          .map(
            (e: any) =>
              `${e.designation || ""} at ${e.company || ""} ${e.startDate || ""}-${e.endDate || ""}`
          )
          .join(", ")
      : ""
  };
}
