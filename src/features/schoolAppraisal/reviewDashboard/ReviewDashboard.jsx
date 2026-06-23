import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import universityLogo from "../../../assets/images/image.png";
import AppSidebar from "../components/AppSidebar";
import { columnsWithSerial } from "../components/tableHelpers";
import { administrativeAuditModules } from "../administrativeAudit/administrativeAuditConfig";
import { academicAudit2025Schema } from "../formSchemas";
import {
  REVIEW_NAV_ITEMS,
  REVIEW_ROLE_CONFIG,
  SCHOOL_GROUPS,
  initialReviewSubmissions,
} from "./reviewDashboardData";

const STORAGE_KEY = "dypiu-school-appraisal:review-dashboard";
const ACADEMIC_DRAFT_KEY = `dypiu-school-appraisal:${academicAudit2025Schema.id}:draft`;
const ADMINISTRATIVE_DRAFT_KEY = "dypiu-school-appraisal:administrative-audit-2025-26";

const statusLabels = {
  submitted: "Submitted",
  "under-review": "Under Review",
  approved: "Approved",
};

const statusStyles = {
  submitted: { color: "#1d4ed8", background: "#dbeafe", border: "#bfdbfe" },
  "under-review": { color: "#92400e", background: "#fef3c7", border: "#fde68a" },
  approved: { color: "#166534", background: "#dcfce7", border: "#bbf7d0" },
};

const auditLabels = {
  academic: "Academic Audit",
  administrative: "Administrative Audit",
};

const groupTabs = [
  { id: "all", label: "All Schools" },
  { id: "engineering", label: "Engineering" },
  { id: "nonEngineering", label: "Non-Engineering" },
];

const allowedReviewStatuses = new Set(["submitted", "under-review", "approved"]);
const normalizeReviewStatus = (status) => allowedReviewStatuses.has(status) ? status : "submitted";

const sanitizeSubmissions = (submissions) => ({
  academic: (submissions.academic || []).map((submission) => ({
    ...submission,
    status: normalizeReviewStatus(submission.status),
  })),
  administrative: (submissions.administrative || []).map((submission) => ({
    ...submission,
    status: normalizeReviewStatus(submission.status),
  })),
});

const loadSubmissions = () => {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return sanitizeSubmissions(initialReviewSubmissions);

  try {
    const sanitized = sanitizeSubmissions({ ...initialReviewSubmissions, ...JSON.parse(saved) });
    saveSubmissions(sanitized);
    return sanitized;
  } catch {
    return sanitizeSubmissions(initialReviewSubmissions);
  }
};

const saveSubmissions = (submissions) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
};

const initialsFor = (name = "") => name.split(" ").filter(Boolean).map((word) => word[0]).join("").slice(0, 2).toUpperCase();
const isAttachmentValue = (value) => value && typeof value === "object" && (value.url || value.name);

const blocksFor = (section) =>
  section.blocks || [
    ...(section.fields?.length ? [{ type: "fields", fields: section.fields }] : []),
    ...(section.tables?.length ? [{ type: "tables", tables: section.tables }] : []),
  ];

const loadSubmittedForm = (auditType) => {
  const storageKey = auditType === "academic" ? ACADEMIC_DRAFT_KEY : ADMINISTRATIVE_DRAFT_KEY;
  const saved = window.localStorage.getItem(storageKey);
  const fallback = { values: {}, tables: {}, hasSavedData: false };

  if (!saved) return fallback;

  try {
    const parsed = JSON.parse(saved);
    return auditType === "academic"
      ? { values: parsed.values || {}, tables: parsed.tables || {}, hasSavedData: true }
      : { values: parsed.fields || {}, tables: parsed.tables || {}, hasSavedData: true };
  } catch {
    return fallback;
  }
};

const sectionsForAudit = (auditType) => auditType === "academic" ? academicAudit2025Schema.sections : administrativeAuditModules;

export default function ReviewDashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("overview");
  const [activeGroup, setActiveGroup] = useState({ academic: "all", administrative: "all" });
  const [submissions, setSubmissions] = useState(loadSubmissions);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [printReviewAfterRender, setPrintReviewAfterRender] = useState(false);
  const [reportMode, setReportMode] = useState(false);
  const role = sessionStorage.getItem("role") || "iqac";
  const roleConfig = REVIEW_ROLE_CONFIG[role] || REVIEW_ROLE_CONFIG.iqac;
  const profile = {
    name: sessionStorage.getItem("name") || roleConfig.roleTitle,
    designation: sessionStorage.getItem("designation") || roleConfig.roleTitle,
    school: sessionStorage.getItem("school") || "D Y Patil International University",
    email: sessionStorage.getItem("email") || sessionStorage.getItem("username") || "",
  };

  const allSubmissions = useMemo(() => [...submissions.academic, ...submissions.administrative], [submissions]);
  const metrics = useMemo(() => buildMetrics(allSubmissions), [allSubmissions]);

  const updateSubmission = (auditType, submissionId, patch) => {
    setSubmissions((current) => {
      const next = {
        ...current,
        [auditType]: current[auditType].map((submission) =>
          submission.id === submissionId ? { ...submission, ...patch } : submission
        ),
      };
      saveSubmissions(next);
      return next;
    });

    setSelectedSubmission((current) =>
      current?.id === submissionId ? { ...current, ...patch } : current
    );
  };

  useEffect(() => {
    if (!printReviewAfterRender) return undefined;

    const timer = window.setTimeout(() => {
      window.print();
      setPrintReviewAfterRender(false);
      setReportMode(false);
    }, 150);

    return () => window.clearTimeout(timer);
  }, [printReviewAfterRender]);

  const confirmApprove = (submission) => {
    if (submission.status === "approved") return;

    const ok = window.confirm(`Do you want to approve ${submission.school} ${auditLabels[submission.auditType]}?`);
    if (!ok) return;

    updateSubmission(submission.auditType, submission.id, {
      status: "approved",
      reviewedBy: profile.name,
      reviewedOn: new Date().toISOString(),
    });
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <PrintStyles />
      <div className="review-dashboard-shell" style={styles.shell}>
        <AppSidebar
          title={roleConfig.title}
          subtitle="D Y Patil International University"
          badge={roleConfig.badge}
          roleTitle={roleConfig.roleTitle}
          roleText={roleConfig.roleText}
          academicYear="2025-26"
          items={REVIEW_NAV_ITEMS}
          activeId={activeView}
          onChange={(viewId) => {
            setSelectedSubmission(null);
            setReportMode(false);
            setActiveView(viewId);
          }}
          profile={profile}
          onLogout={() => setShowLogoutModal(true)}
        />

        <main className="review-dashboard-main" style={styles.page}>
          {!selectedSubmission && (
            <header style={styles.header}>
              <div style={styles.headerContent}>
                <div style={styles.logoWrap}>
                  <img src={universityLogo} alt="DYPIU Logo" style={styles.logo} />
                </div>
                <div>
                  <p style={styles.kicker}>D Y Patil International University Akurdi Pune</p>
                  <h1 style={styles.title}>{roleConfig.title}</h1>
                  <p style={styles.meta}>School Appraisal Review - Academic Year July, 2025 - June, 2026</p>
                </div>
              </div>
            </header>
          )}

          {selectedSubmission ? (
            <FullFormReview
              submission={selectedSubmission}
              reportMode={reportMode}
              onBack={() => {
                setReportMode(false);
                setSelectedSubmission(null);
              }}
              onApprove={() => confirmApprove(selectedSubmission)}
              onGenerateReport={() => {
                setReportMode(true);
                setPrintReviewAfterRender(true);
              }}
            />
          ) : activeView === "overview" ? (
            <OverviewPanel
              metrics={metrics}
              submissions={allSubmissions}
              onOpen={(submission) => {
                setActiveView(submission.auditType);
                setSelectedSubmission(submission);
              }}
            />
          ) : null}

          {!selectedSubmission && activeView === "academic" && (
            <AuditReviewPanel
              auditType="academic"
              submissions={submissions.academic}
              activeGroup={activeGroup.academic}
              onGroupChange={(group) => setActiveGroup((current) => ({ ...current, academic: group }))}
              onOpen={setSelectedSubmission}
            />
          )}

          {!selectedSubmission && activeView === "administrative" && (
            <AuditReviewPanel
              auditType="administrative"
              submissions={submissions.administrative}
              activeGroup={activeGroup.administrative}
              onGroupChange={(group) => setActiveGroup((current) => ({ ...current, administrative: group }))}
              onOpen={setSelectedSubmission}
            />
          )}
        </main>

        {showLogoutModal && <LogoutModal onCancel={() => setShowLogoutModal(false)} onConfirm={handleLogout} />}
      </div>
    </>
  );
}

function buildMetrics(submissions) {
  return submissions.reduce(
    (metrics, submission) => {
      metrics.total += 1;
      metrics[submission.status] += 1;
      metrics[submission.auditType] += 1;
      return metrics;
    },
    { total: 0, submitted: 0, "under-review": 0, approved: 0, academic: 0, administrative: 0 }
  );
}

function OverviewPanel({ metrics, submissions, onOpen }) {
  const pendingSubmissions = submissions.filter((submission) => submission.status !== "approved");

  return (
    <section style={styles.panel}>
      <div style={styles.blueHeading}>
        <h2 style={styles.sectionTitle}>Overview</h2>
      </div>

      <div style={styles.metricGrid}>
        <MetricCard label="Total forms" value={metrics.total} />
        <MetricCard label="Pending review" value={metrics.submitted + metrics["under-review"]} />
        <MetricCard label="Approved" value={metrics.approved} />
        <MetricCard label="Audit types" value="2" />
      </div>

      <div style={styles.splitGrid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Audit Summary</h3>
          <div style={styles.auditSummaryRows}>
            <SummaryRow label="Academic Audit" value={metrics.academic} />
            <SummaryRow label="Administrative Audit" value={metrics.administrative} />
            <SummaryRow label="Engineering Schools" value="4" />
            <SummaryRow label="Non-Engineering Schools" value="4" />
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Pending Review Queue</h3>
          <div style={styles.queueList}>
            {pendingSubmissions.slice(0, 6).map((submission) => (
              <button key={submission.id} type="button" style={styles.queueItem} onClick={() => onOpen(submission)}>
                <span>
                  <strong>{submission.school}</strong>
                  <small>{auditLabels[submission.auditType]}</small>
                </span>
                <StatusBadge status={submission.status} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AuditReviewPanel({ auditType, submissions, activeGroup, onGroupChange, onOpen }) {
  const filtered = activeGroup === "all" ? submissions : submissions.filter((submission) => submission.group === activeGroup);
  const counts = {
    all: submissions.length,
    engineering: submissions.filter((submission) => submission.group === "engineering").length,
    nonEngineering: submissions.filter((submission) => submission.group === "nonEngineering").length,
  };

  return (
    <section style={styles.panel}>
      <div style={styles.pageTitleRow}>
        <div style={styles.blueHeading}>
          <h2 style={styles.sectionTitle}>{auditLabels[auditType]} Reviews</h2>
        </div>
        <span style={styles.schoolCount}>{filtered.length} schools</span>
      </div>

      <div style={styles.tabs} role="tablist" aria-label={`${auditLabels[auditType]} school groups`}>
        {groupTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            style={{ ...styles.tab, ...(activeGroup === tab.id ? styles.activeTab : {}) }}
            onClick={() => onGroupChange(tab.id)}
          >
            {tab.label}
            <span style={styles.tabCount}>{counts[tab.id]}</span>
          </button>
        ))}
      </div>

      <div style={styles.reviewList}>
        {filtered.map((submission) => (
          <SubmissionCard
            key={submission.id}
            submission={submission}
            onOpen={() => onOpen(submission)}
          />
        ))}
      </div>
    </section>
  );
}

function SubmissionCard({ submission, onOpen }) {
  return (
    <article style={styles.submissionCard}>
      <div style={styles.submissionTop}>
        <div style={styles.schoolAvatar}>{initialsFor(submission.school)}</div>
        <div style={styles.submissionTitleBlock}>
          <h3 style={styles.schoolName}>{submission.school}</h3>
          <p style={styles.schoolMeta}>
            {SCHOOL_GROUPS[submission.group]} - {submission.submittedBy}
          </p>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      <div style={styles.submissionInfoGrid}>
        <InfoPill label="Submitted on" value={formatDate(submission.submittedOn)} />
        <InfoPill label="Sections" value={submission.sections.length} />
        <InfoPill label="Attachments" value={submission.attachments.length} />
      </div>

      <div style={styles.cardActions}>
        <button type="button" className="btn btn-secondary" onClick={onOpen}>View Form</button>
      </div>
    </article>
  );
}

function FullFormReview({ submission, reportMode, onBack, onApprove, onGenerateReport }) {
  const submittedForm = loadSubmittedForm(submission.auditType);
  const sections = sectionsForAudit(submission.auditType);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const isLastSection = activeSectionIndex === sections.length - 1;
  const isApproved = submission.status === "approved";
  const goToPreviousSection = () => setActiveSectionIndex((index) => Math.max(0, index - 1));
  const goToNextSection = () => setActiveSectionIndex((index) => Math.min(sections.length - 1, index + 1));

  return (
    <section style={styles.fullReviewPage}>
      <div
        className="full-review-header-print"
        style={{
          ...styles.fullReviewHeader,
          ...(reportMode ? { gridTemplateColumns: "minmax(0, 1fr) auto" } : {}),
        }}
      >
        {!reportMode && (
          <button type="button" className="btn btn-secondary review-dashboard-print-hidden" onClick={onBack}>
            Back
          </button>
        )}
        <div style={styles.fullReviewTitleBlock}>
          <p style={styles.kicker}>{auditLabels[submission.auditType]}</p>
          <h2 style={styles.fullReviewTitle}>{submission.school}</h2>
          <p style={styles.modalMeta}>{submission.submittedBy} - Submitted {formatDate(submission.submittedOn)}</p>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      {!reportMode && (
        <SectionReviewNav
          sections={sections}
          activeIndex={activeSectionIndex}
          onChange={setActiveSectionIndex}
        />
      )}

      <SubmittedFormViewer
        sections={sections}
        formData={submittedForm}
        auditType={submission.auditType}
        activeSectionIndex={activeSectionIndex}
        showAllSections={reportMode}
      />

      {!reportMode && <div className="review-dashboard-print-hidden" style={styles.fullReviewActions}>
        {!isLastSection ? (
          <div style={styles.reviewPager}>
            <button type="button" className="btn btn-secondary" onClick={goToPreviousSection} disabled={activeSectionIndex === 0}>
              Previous
            </button>
            <button type="button" className="btn btn-primary" onClick={goToNextSection}>
              Next
            </button>
          </div>
        ) : (
          <div style={styles.finalReviewPanel}>
            <div style={styles.finalActionRow}>
              <span style={styles.reviewHint}>
                {isApproved ? "This form is approved. Report generation is still available." : "Review the last section before generating report or approving."}
              </span>
              <div style={styles.cardActions}>
                <button type="button" className="btn btn-secondary" onClick={onGenerateReport}>Generate Report</button>
                {!isApproved && <button type="button" className="btn btn-primary" onClick={onApprove}>Approve</button>}
              </div>
            </div>
          </div>
        )}
      </div>}
    </section>
  );
}

function SectionReviewNav({ sections, activeIndex, onChange }) {
  return (
    <nav style={styles.sectionNav} aria-label="Review form sections">
      {sections.map((section, index) => (
        <button
          key={section.id}
          type="button"
          style={{ ...styles.sectionNavButton, ...(index === activeIndex ? styles.activeSectionNavButton : {}) }}
          onClick={() => onChange(index)}
          title={section.title}
        >
          <span>{sectionLabelFor(section, index)}</span>
        </button>
      ))}
    </nav>
  );
}

function SubmittedFormViewer({ sections, formData, auditType, activeSectionIndex, showAllSections = false }) {
  const activeSection = sections[activeSectionIndex] || sections[0];
  const visibleSections = showAllSections ? sections : activeSection ? [activeSection] : [];

  return (
    <div style={styles.formViewer}>
      {!formData.hasSavedData && (
        <div style={styles.emptyDraftNotice}>
          No saved {auditLabels[auditType]} draft was found in this browser yet. Once Director/Administrative user fills and saves the form, the complete content will appear here.
        </div>
      )}

      {visibleSections.map((section) => (
        <section key={section.id} style={styles.reviewSection}>
          <h3 style={styles.reviewSectionTitle}>
            {section.number ? `${section.number}. ${section.title}` : section.title}
          </h3>
          {section.note && <p style={styles.reviewSectionNote}>{section.note}</p>}

          {blocksFor(section).map((block, blockIndex) => {
            if (block.type === "fields") {
              return (
                <ReadOnlyFieldGrid
                  key={`${section.id}-fields-${blockIndex}`}
                  fields={block.fields}
                  values={formData.values}
                />
              );
            }

            if (block.type === "text") {
              return (
                <p key={`${section.id}-text-${blockIndex}`} style={styles.reviewText}>
                  {block.text}
                </p>
              );
            }

            return (
              <div key={`${section.id}-tables-${blockIndex}`} style={styles.reviewTables}>
                {block.tables.map((table) => (
                  <ReadOnlyTable
                    key={table.id}
                    table={table}
                    rows={formData.tables[table.id] || []}
                    values={formData.values}
                  />
                ))}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}

function sectionLabelFor(section, index) {
  if (section.number) return `Part ${section.number}`;

  const partMatch = section.title.match(/^Part\s+[A-Z]/i);
  if (partMatch) return partMatch[0];

  return index === 0 ? "Info" : String(index + 1);
}

function ReadOnlyFieldGrid({ fields, values }) {
  return (
    <div style={styles.readOnlyFieldGrid}>
      {fields.map((field) => {
        if (field.kind === "heading") {
          return (
            <h4 key={field.id} style={styles.reviewSubheading}>
              {field.label}
            </h4>
          );
        }

        return (
          <div key={field.id} style={styles.readOnlyField}>
            <div style={styles.readOnlyLabel}>{field.label}</div>
            <div style={styles.readOnlyValue}>{renderValue(values[field.id])}</div>
          </div>
        );
      })}
    </div>
  );
}

function ReadOnlyTable({ table, rows, values }) {
  const columns = columnsWithSerial(table.columns);
  const visibleRows = rows.length ? rows : [columns.reduce((row, column) => ({ ...row, [column]: "" }), {})];

  return (
    <div style={styles.readOnlyTableBlock}>
      {table.showTitle !== false && <h4 style={styles.readOnlyTableTitle}>{table.title}</h4>}

      {!!table.notes?.length && (
        <div style={styles.readOnlyNotes}>
          {table.notes.map((note) => (
            <div key={note}>{note}</div>
          ))}
        </div>
      )}

      {!!table.fields?.length && (
        <div style={styles.readOnlyFieldGrid}>
          {table.fields.map((field) => (
            <div key={field.id} style={styles.readOnlyField}>
              <div style={styles.readOnlyLabel}>{field.label}</div>
              <div style={styles.readOnlyValue}>{renderValue(values[field.id])}</div>
            </div>
          ))}
        </div>
      )}

      <div style={styles.readOnlyScroller}>
        <table style={styles.readOnlyTable}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} style={styles.readOnlyTh}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, rowIndex) => (
              <tr key={`${table.id}-readonly-${rowIndex}`}>
                {columns.map((column) => (
                  <td key={column} style={styles.readOnlyTd}>
                    {renderValue(row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderValue(value) {
  if (isAttachmentValue(value)) {
    return (
      <div style={styles.attachmentPreview}>
        <span>{value.name || "Attachment"}</span>
        {value.url ? (
          <a href={value.url} target="_blank" rel="noreferrer" style={styles.attachmentLink}>
            View Attachment
          </a>
        ) : (
          <span style={styles.mutedText}>Attachment link unavailable</span>
        )}
      </div>
    );
  }

  return String(value || "").trim() || "-";
}

function MetricCard({ label, value }) {
  return (
    <div style={styles.metricCard}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div style={styles.summaryRow}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InfoPill({ label, value }) {
  return (
    <div style={styles.infoPill}>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

function StatusBadge({ status }) {
  const tone = statusStyles[status] || statusStyles.submitted;
  return (
    <span style={{ ...styles.statusBadge, color: tone.color, background: tone.background, borderColor: tone.border }}>
      {statusLabels[status] || status}
    </span>
  );
}

function LogoutModal({ onCancel, onConfirm }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-title">Confirm Logout</div>
        <div className="modal-text">You are about to leave School Appraisal. Any unsaved edits will be lost.</div>
        <div className="modal-actions">
          <button type="button" onClick={onCancel} className="modal-cancel">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="modal-confirm">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

function PrintStyles() {
  return (
    <style>{`
      @media (max-width: 900px) {
        .review-dashboard-shell { flex-direction: column; }
        .review-dashboard-main { padding: 18px !important; }
      }
      @media print {
        .app-sidebar,
        .review-dashboard-print-hidden {
          display: none !important;
        }
        .full-review-header-print {
          position: static !important;
          box-shadow: none !important;
        }
        .review-dashboard-shell {
          display: block !important;
          background: #fff !important;
        }
        .review-dashboard-main {
          padding: 0 !important;
          width: 100% !important;
          margin-left: 0 !important;
        }
        body {
          background: #fff !important;
        }
        .review-dashboard-main section {
          break-inside: auto;
        }
      }
      .review-dashboard-main .btn:disabled {
        opacity: .5;
        cursor: not-allowed;
        transform: none !important;
        box-shadow: none !important;
      }
    `}</style>
  );
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

const styles = {
  shell: {
    minHeight: "100vh",
    display: "flex",
    background: "#f5f7fb",
    color: "#0f172a",
    fontFamily: "Inter, 'Segoe UI', sans-serif",
  },
  page: {
    minHeight: "100vh",
    flex: 1,
    background: "#f5f7fb",
    padding: "28px 30px 40px",
    overflowX: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 18,
    padding: "24px 26px",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    background: "#fff",
    boxShadow: "0 10px 35px rgba(15, 23, 42, 0.055)",
    marginBottom: 22,
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: 18,
  },
  logoWrap: {
    width: 76,
    height: 76,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    border: "1px solid #e7edf5",
    borderRadius: 14,
    background: "#f8fafc",
  },
  logo: {
    width: 62,
    height: 62,
    objectFit: "contain",
  },
  kicker: {
    margin: "0 0 6px",
    color: "#2563eb",
    fontSize: 11,
    fontWeight: 750,
    textTransform: "uppercase",
    letterSpacing: ".08em",
  },
  title: {
    margin: "0 0 8px",
    color: "#0f172a",
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.25,
  },
  meta: {
    margin: 0,
    color: "#64748b",
    fontSize: 14,
    lineHeight: 1.5,
  },
  panel: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  blueHeading: {
    padding: "15px 18px",
    borderLeft: "5px solid #2563eb",
    borderRadius: 8,
    background: "#eff6ff",
  },
  pageTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
  },
  sectionTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1.25,
  },
  schoolCount: {
    flexShrink: 0,
    color: "#475569",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 14,
    fontWeight: 700,
  },
  metricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 14,
  },
  metricCard: {
    border: "1px solid #e5eaf2",
    borderRadius: 13,
    background: "#fff",
    padding: "18px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 5,
    color: "#64748b",
    fontSize: 14,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  splitGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(280px, .8fr) minmax(320px, 1.2fr)",
    gap: 18,
  },
  card: {
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    background: "#fff",
    padding: 18,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
  },
  cardTitle: {
    margin: "0 0 14px",
    color: "#0f172a",
    fontSize: 18,
    fontWeight: 700,
  },
  auditSummaryRows: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "12px 0",
    borderBottom: "1px solid #edf2f7",
    color: "#475569",
    fontSize: 14,
  },
  queueList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  queueItem: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    background: "#f8fafc",
    padding: "12px 14px",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
  },
  tabs: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  tab: {
    border: "1px solid #dbe3ef",
    borderRadius: 999,
    background: "#fff",
    color: "#334155",
    padding: "9px 12px",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "inherit",
  },
  activeTab: {
    color: "#fff",
    background: "#2563eb",
    borderColor: "#2563eb",
  },
  tabCount: {
    minWidth: 24,
    height: 24,
    display: "grid",
    placeItems: "center",
    borderRadius: 999,
    color: "inherit",
    background: "rgba(148, 163, 184, .18)",
    fontSize: 12,
  },
  reviewList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: 16,
  },
  submissionCard: {
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    background: "#fff",
    padding: 18,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
  },
  submissionTop: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
  },
  schoolAvatar: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    color: "#fff",
    background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
    fontSize: 12,
    fontWeight: 700,
  },
  submissionTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  schoolName: {
    margin: 0,
    color: "#0f172a",
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1.35,
  },
  schoolMeta: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: 14,
  },
  statusBadge: {
    border: "1px solid",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  submissionInfoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 10,
  },
  infoPill: {
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    background: "#f8fafc",
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    color: "#64748b",
    fontSize: 12,
  },
  cardActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "wrap",
  },
  fullReviewPage: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  fullReviewHeader: {
    position: "sticky",
    top: 0,
    zIndex: 5,
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr) auto",
    alignItems: "center",
    gap: 16,
    padding: 18,
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    background: "#fff",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
  },
  fullReviewTitleBlock: {
    minWidth: 0,
  },
  fullReviewTitle: {
    margin: "0 0 5px",
    color: "#0f172a",
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1.25,
  },
  sectionNav: {
    position: "sticky",
    top: 88,
    zIndex: 4,
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    padding: 12,
    border: "1px solid #dbe3ef",
    borderRadius: 14,
    background: "rgba(255, 255, 255, 0.96)",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.055)",
  },
  sectionNavButton: {
    minWidth: 72,
    border: "1px solid #dbe3ef",
    borderRadius: 999,
    background: "#f8fafc",
    color: "#334155",
    padding: "9px 12px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  activeSectionNavButton: {
    borderColor: "#2563eb",
    background: "#2563eb",
    color: "#fff",
    boxShadow: "0 8px 18px rgba(37, 99, 235, 0.18)",
  },
  fullReviewActions: {
    position: "sticky",
    bottom: 0,
    zIndex: 5,
    display: "flex",
    justifyContent: "flex-end",
    padding: 14,
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    background: "rgba(255, 255, 255, 0.96)",
    boxShadow: "0 -10px 28px rgba(15, 23, 42, 0.06)",
  },
  reviewPager: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
  finalReviewPanel: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  finalActionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  reviewHint: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: 700,
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.55)",
    zIndex: 1000,
    display: "grid",
    placeItems: "center",
    padding: 20,
  },
  reviewModal: {
    width: "min(1040px, 96vw)",
    maxHeight: "92vh",
    overflow: "auto",
    background: "#fff",
    borderRadius: 16,
    padding: 22,
    display: "flex",
    flexDirection: "column",
    gap: 18,
    boxShadow: "0 24px 70px rgba(0,0,0,0.28)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: 16,
  },
  modalTitle: {
    margin: "0 0 5px",
    fontSize: 18,
    color: "#0f172a",
  },
  modalMeta: {
    margin: 0,
    color: "#64748b",
    fontSize: 14,
  },
  modalGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  formViewer: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  emptyDraftNotice: {
    border: "1px solid #fde68a",
    borderRadius: 10,
    background: "#fffbeb",
    color: "#92400e",
    padding: "12px 14px",
    fontSize: 14,
    fontWeight: 700,
    lineHeight: 1.5,
  },
  reviewSection: {
    border: "1px solid #dbe3ef",
    borderRadius: 16,
    background: "#fff",
    padding: 24,
    boxShadow: "0 12px 35px rgba(15, 23, 42, 0.045)",
  },
  reviewSectionTitle: {
    margin: "0 0 14px",
    padding: "0 0 15px",
    borderBottom: "1px solid #edf1f6",
    color: "#0f172a",
    fontSize: 17,
    fontWeight: 700,
    letterSpacing: "-.015em",
    lineHeight: 1.3,
  },
  reviewSectionNote: {
    margin: "-6px 0 14px",
    color: "#475569",
    fontSize: 12,
    fontWeight: 600,
  },
  reviewText: {
    margin: "0 0 14px",
    color: "#0f172a",
    fontSize: 14,
    fontWeight: 700,
  },
  reviewTables: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  readOnlyFieldGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 10,
    marginBottom: 14,
  },
  reviewSubheading: {
    gridColumn: "1 / -1",
    margin: "8px 0 0",
    padding: "10px 12px",
    borderLeft: "4px solid #2563eb",
    borderRadius: 10,
    color: "#0f172a",
    background: "#eff6ff",
    fontSize: 15,
    fontWeight: 700,
    lineHeight: 1.35,
  },
  readOnlyField: {
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    background: "#f8fafc",
    padding: 10,
  },
  readOnlyLabel: {
    color: "#334155",
    fontSize: 12,
    fontWeight: 650,
    marginBottom: 5,
  },
  readOnlyValue: {
    color: "#0f172a",
    fontSize: 14,
    whiteSpace: "pre-wrap",
    lineHeight: 1.5,
  },
  readOnlyTableBlock: {
    marginTop: 8,
    border: "1px solid #dbe3ef",
    borderRadius: 13,
    background: "#fff",
    overflow: "hidden",
    boxShadow: "0 5px 18px rgba(15, 23, 42, .035)",
  },
  readOnlyTableTitle: {
    margin: 0,
    padding: "15px 17px",
    borderBottom: "1px solid #e8edf4",
    background: "#f8fafc",
    color: "#0f172a",
    fontSize: 14,
    fontWeight: 700,
    lineHeight: 1.35,
  },
  readOnlyNotes: {
    margin: 0,
    padding: "0 14px 12px",
    color: "#334155",
    fontSize: 14,
    lineHeight: 1.6,
  },
  readOnlyScroller: {
    overflowX: "auto",
  },
  readOnlyTable: {
    width: "100%",
    minWidth: 720,
    borderCollapse: "collapse",
  },
  readOnlyTh: {
    padding: "11px 12px",
    borderBottom: "1px solid #dbe3ef",
    borderRight: "1px solid #e5edf7",
    background: "#f8fafc",
    color: "#334155",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: ".025em",
    textAlign: "left",
    verticalAlign: "top",
  },
  readOnlyTd: {
    padding: "9px 10px",
    borderBottom: "1px solid #edf2f7",
    borderRight: "1px solid #edf2f7",
    color: "#0f172a",
    fontSize: 12.5,
    verticalAlign: "top",
    whiteSpace: "pre-wrap",
  },
  attachmentPreview: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  attachmentLink: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: 700,
    textDecoration: "none",
  },
  mutedText: {
    color: "#64748b",
    fontSize: 14,
  },
  sectionList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  sectionItem: {
    display: "grid",
    gridTemplateColumns: "32px 1fr auto",
    gap: 10,
    alignItems: "center",
    border: "1px solid #edf2f7",
    borderRadius: 10,
    padding: "9px 10px",
    fontSize: 14,
    color: "#334155",
  },
  attachmentList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  attachmentItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    border: "1px solid #edf2f7",
    borderRadius: 10,
    padding: "9px 10px",
    fontSize: 14,
  },
  modalActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  logoutModal: {
    width: "min(380px, 92vw)",
    background: "#fff",
    borderRadius: 14,
    padding: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  },
};
