export const REVIEW_NAV_ITEMS = [
  { id: "overview", title: "Overview" },
  { id: "academic", title: "Academic Audit" },
  { id: "administrative", title: "Administrative Audit" },
];

export const REVIEW_ROLE_CONFIG = {
  "vice-chancellor": {
    badge: "VC",
    title: "Vice Chancellor Dashboard",
    roleTitle: "Vice Chancellor",
    roleText: "School Appraisal Review",
  },
  iqac: {
    badge: "IQ",
    title: "IQAC Dashboard",
    roleTitle: "IQAC",
    roleText: "School Appraisal Review",
  },
};

export const SCHOOL_GROUPS = {
  engineering: "Engineering",
  nonEngineering: "Non-Engineering",
};

const engineeringSchools = [
  {
    id: "engineering-technology",
    school: "School of Engineering & Technology",
    director: "Director, Engineering & Technology",
  },
  {
    id: "computer-science",
    school: "School of Computer Science, Engineering & Applications",
    director: "Director, Computer Science",
  },
  {
    id: "applied-sciences",
    school: "School of Applied Sciences",
    director: "Director, Applied Sciences",
  },
  {
    id: "design",
    school: "School of Design",
    director: "Director, Design",
  },
];

const nonEngineeringSchools = [
  {
    id: "management",
    school: "School of Management",
    director: "Director, Management",
  },
  {
    id: "media-communication",
    school: "School of Media & Communication",
    director: "Director, Media & Communication",
  },
  {
    id: "law",
    school: "School of Law",
    director: "Director, Law",
  },
  {
    id: "liberal-arts",
    school: "School of Liberal Arts",
    director: "Director, Liberal Arts",
  },
];

const academicSections = [
  "School Information",
  "Part A - Academic Activities",
  "Part B - Faculty and Staff Details",
  "Part C - Infrastructure Details",
  "Part D - SWOC Analysis",
  "Part E - Observations",
  "Part F - Recommendations",
];

const administrativeSections = [
  "A. University Information",
  "B. Faculty and Staff Details",
  "C. Infrastructure Details",
  "D. Student Activities",
  "E. Placements, Internships & Training",
  "F. Observations & Recommendations",
];

const statuses = ["submitted", "under-review", "approved"];

const buildSubmission = (school, group, auditType, index) => ({
  id: `${auditType}-${school.id}`,
  auditType,
  group,
  school: school.school,
  submittedBy: school.director,
  submittedOn: `2026-06-${String(12 + index).padStart(2, "0")}`,
  status: statuses[index % statuses.length],
  sections: auditType === "academic" ? academicSections : administrativeSections,
  attachments: auditType === "academic"
    ? ["Board of Studies MoM.pdf", "Syllabus revision ATR.pdf", "Faculty proof.zip"]
    : ["Faculty staff proof.pdf", "Infrastructure photos.zip", "Placement records.pdf"],
});

export const initialReviewSubmissions = {
  academic: [
    ...engineeringSchools.map((school, index) => buildSubmission(school, "engineering", "academic", index)),
    ...nonEngineeringSchools.map((school, index) => buildSubmission(school, "nonEngineering", "academic", index + 4)),
  ],
  administrative: [
    ...engineeringSchools.map((school, index) => buildSubmission(school, "engineering", "administrative", index + 1)),
    ...nonEngineeringSchools.map((school, index) => buildSubmission(school, "nonEngineering", "administrative", index + 5)),
  ],
};
