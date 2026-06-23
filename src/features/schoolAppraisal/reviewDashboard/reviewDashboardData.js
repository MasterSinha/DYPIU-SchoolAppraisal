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
    roleTitle: "IQAC Director",
    roleText: "School Appraisal Review",
  },
};

export const SCHOOL_GROUPS = {
  engineering: "Engineering",
  nonEngineering: "Non-Engineering",
  administrative: "Administrative Role",
};

const engineeringSchools = [
  {
    id: "socsea",
    school: "School of Computer Science & Applications",
    shortName: "SoCSEA",
    director: "Director, School of Computer Science & Applications",
  },
  {
    id: "sobb",
    school: "School of Bio-Engineering & Bio Science",
    shortName: "SoBB",
    director: "Director, School of Bio-Engineering & Bio Science",
  },
  {
    id: "soce",
    school: "School of Continual Education",
    shortName: "SoCE",
    director: "Director, School of Continual Education",
  },
  {
    id: "soemr",
    school: "School of Engineering, Management & Research",
    shortName: "SoEMR",
    director: "Director, School of Engineering, Management & Research",
  },
];

const nonEngineeringSchools = [
  {
    id: "socm",
    school: "School of Commerce & Management",
    shortName: "SoCM",
    director: "Director, School of Commerce & Management",
  },
  {
    id: "somcs",
    school: "School of Media & Communication Studies",
    shortName: "SoMCS",
    director: "Director, School of Media & Communication Studies",
  },
  {
    id: "sod",
    school: "School of Design",
    shortName: "SoD",
    director: "Director, School of Design",
  },
  {
    id: "soaa",
    school: "School of Applied Arts",
    shortName: "SoAA",
    director: "Director, School of Applied Arts",
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

const administrativeSubmitters = [
  {
    id: "registrar",
    school: "Registrar",
    director: "Registrar - University Administration",
    groupLabel: "Administrative Role",
  },
  {
    id: "hr",
    school: "Human Resources",
    director: "HR - Faculty and Staff Details",
    groupLabel: "Administrative Role",
  },
  {
    id: "student-affairs",
    school: "Dean Student Welfare",
    director: "Dean Student Welfare - Student Activities",
    groupLabel: "Administrative Role",
  },
  {
    id: "dean-placements",
    school: "Dean Placements",
    director: "Dean Placements - Placements, Internships & Training",
    groupLabel: "Administrative Role",
  },
];

const buildSubmission = (school, group, auditType, index) => ({
  id: `${auditType}-${school.id}`,
  auditType,
  group,
  groupLabel: school.groupLabel || SCHOOL_GROUPS[group],
  school: school.school,
  title: school.school,
  shortName: school.shortName,
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
  administrative: administrativeSubmitters.map((submitter, index) =>
    buildSubmission(submitter, "administrative", "administrative", index)
  ),
};
