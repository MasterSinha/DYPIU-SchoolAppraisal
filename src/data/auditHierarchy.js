export const auditHierarchy = {
  title: "Academic & Administrative Audit",
  adminRole: {
    id: "vc-iqac",
    label: "Vice Chancellor & IQAC Director",
  },
  userRoles: [
    {
      id: "school-director",
      label: "School Director",
      auditType: "academic",
    },
    {
      id: "registrar",
      label: "Registrar",
      auditType: "administrative",
    },
    {
      id: "hr",
      label: "HR",
      auditType: "administrative",
    },
    {
      id: "dean-student-welfare",
      label: "Dean Student Welfare",
      auditType: "administrative",
    },
    {
      id: "dean-placements",
      label: "Dean Placements",
      auditType: "administrative",
    },
  ],
  academicSchools: [
    { id: "socsea", label: "School of Computer Science & Applications", shortName: "SoCSEA" },
    { id: "sobb", label: "School of Bio-Engineering & Bio Science", shortName: "SoBB" },
    { id: "soce", label: "School of Continual Education", shortName: "SoCE" },
    { id: "soemr", label: "School of Engineering, Management & Research", shortName: "SoEMR" },
    { id: "socm", label: "School of Commerce & Management", shortName: "SoCM" },
    { id: "somcs", label: "School of Media & Communication Studies", shortName: "SoMCS" },
    { id: "sod", label: "School of Design", shortName: "SoD" },
    { id: "soaa", label: "School of Applied Arts", shortName: "SoAA" },
  ],
  administrativeSubmitters: [
    { id: "registrar", label: "Registrar" },
    { id: "hr", label: "HR" },
    { id: "dean-student-welfare", label: "Dean Student Welfare" },
    { id: "dean-placements", label: "Dean Placements" },
  ],
  reviewers: [
    { id: "vice-chancellor", label: "Vice Chancellor" },
    { id: "iqac", label: "IQAC Director" },
  ],
};
