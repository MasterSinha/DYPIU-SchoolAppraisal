# DYPIU School Appraisal Frontend Documentation

This document explains where each frontend feature lives so future changes can be made without searching through every file.

## 1. App Entry And Routing

| Purpose | File |
| --- | --- |
| React app entry | `src/main.jsx` |
| Main route definitions and route protection | `src/App.jsx` |
| Route list reference | `src/routes/appRoutes.jsx` |
| Shared global styling | `src/styles/common.css` |

Current routes:

| URL | Role Required | Page |
| --- | --- | --- |
| `/login` | None | Login page |
| `/director/dashboard` | `director` | Academic audit form |
| `/administrative/dashboard` | `administrative` | Administrative audit form |
| `/vice-chancellor/dashboard` | `vice-chancellor` | VC review dashboard |
| `/iqac/dashboard` | `iqac` | IQAC review dashboard |
| `/review/dashboard` | `vice-chancellor` or `iqac` | Shared review dashboard |

Route protection is handled by `ProtectedRoute` inside `src/App.jsx`. It checks `sessionStorage.getItem("role")`.

## 2. Test Login Accounts

The temporary frontend-only login accounts are defined in `src/pages/auth/Login.jsx`.

| Role | Email | Password | Redirect |
| --- | --- | --- | --- |
| Director | `director@dypiu.ac.in` | `Director@123` | `/director/dashboard` |
| Administrative | `administrative@dypiu.ac.in` | `Admin@123` | `/administrative/dashboard` |
| Vice Chancellor | `vc@dypiu.ac.in` | `VC@123` | `/vice-chancellor/dashboard` |
| IQAC | `iqac@dypiu.ac.in` | `IQAC@123` | `/iqac/dashboard` |

When backend auth is ready, replace `LOGIN_ACCOUNTS` and the fake timeout login logic in `src/pages/auth/Login.jsx` with API login.

## 3. Main Folder Structure

```text
src/
  App.jsx
  main.jsx
  assets/
    images/
  data/
    auditHierarchy.js
  features/
    schoolAppraisal/
      administrativeAudit/
      components/
      formSchemas/
      reviewDashboard/
  pages/
    administrative/
    auth/
    director/
    review/
  routes/
    appRoutes.jsx
  styles/
    common.css
```

Use `features/schoolAppraisal` for form-specific logic and reusable school appraisal components. Use `pages` only for route-level wrappers.

## 4. Shared Styling

Global project styling is in:

```text
src/styles/common.css
```

Use this file for common classes such as:

- dashboard shell/layout
- sidebar
- common buttons
- form headings
- audit tables
- modal layout
- print behavior
- responsive behavior

Avoid adding new `<style>` blocks or large local style objects unless the style is truly specific to one component.

Current note: some older files still have local inline style objects. They can be migrated gradually into `common.css`.

## 5. Shared Components

| Feature | File |
| --- | --- |
| Shared sidebar | `src/features/schoolAppraisal/components/AppSidebar.jsx` |
| Shared dynamic table | `src/features/schoolAppraisal/components/AuditTable.jsx` |
| Serial number helpers | `src/features/schoolAppraisal/components/tableHelpers.js` |
| Academic section renderer | `src/features/schoolAppraisal/components/AuditSection.jsx` |
| Academic report/print panel | `src/features/schoolAppraisal/components/AuditReportPanel.jsx` |
| Hierarchy display component | `src/features/schoolAppraisal/components/RoleHierarchy.jsx` |

`AuditTable.jsx` is used for both Academic and Administrative audit tables. If you need to change add row, delete last row, serial number behavior, attachment columns, compact Sr No width, or table button style, change it there.

## 6. Academic Audit Form

Route:

```text
/director/dashboard
```

Main files:

| Purpose | File |
| --- | --- |
| Route wrapper/sidebar page | `src/pages/director/DirectorDashboard.jsx` |
| Academic form state and navigation | `src/features/schoolAppraisal/components/AuditForm.jsx` |
| Academic form schema | `src/features/schoolAppraisal/formSchemas/academicAudit2025.js` |
| Academic schema export | `src/features/schoolAppraisal/formSchemas/index.js` |
| Academic section rendering | `src/features/schoolAppraisal/components/AuditSection.jsx` |
| Academic print/report view | `src/features/schoolAppraisal/components/AuditReportPanel.jsx` |

Academic localStorage key:

```text
dypiu-school-appraisal:academic-audit-2025-26:draft
```

Saved data shape:

```js
{
  values: {},
  tables: {},
  submittedAt: "optional date string"
}
```

Where to change Academic sections, headings, field labels, table names, table columns, initial rows:

```text
src/features/schoolAppraisal/formSchemas/academicAudit2025.js
```

Academic current sections:

| Section | Schema ID |
| --- | --- |
| School / Department Information | `school-department-information` |
| Part A - Academic Activities | `part-a-academic-activities` |
| Part B - Student Development & Progression | `part-b-student-development` |
| Part C - Faculty Development & Research Activities | `part-c-faculty-research` |
| Part D - SWOC Analysis | `part-d-swoc` |
| Part E - Observations & Recommendations of the Audit | `part-e-observations` |

## 7. Administrative Audit Form

Route:

```text
/administrative/dashboard
```

Main files:

| Purpose | File |
| --- | --- |
| Route wrapper/sidebar page | `src/pages/administrative/AdministrativeDashboard.jsx` |
| Administrative form state and navigation | `src/features/schoolAppraisal/administrativeAudit/AdministrativeAuditDashboard.jsx` |
| Administrative schema/config | `src/features/schoolAppraisal/administrativeAudit/administrativeAuditConfig.js` |
| Administrative print/report view | `src/features/schoolAppraisal/administrativeAudit/AdministrativeReportPanel.jsx` |

Administrative localStorage key:

```text
dypiu-school-appraisal:administrative-audit-2025-26
```

Saved data shape:

```js
{
  fields: {},
  tables: {},
  lastSavedAt: "date string",
  submittedAt: "optional date string"
}
```

Where to change Administrative sections, headings, notes, fields, table names, table columns, initial rows:

```text
src/features/schoolAppraisal/administrativeAudit/administrativeAuditConfig.js
```

Administrative current sections:

| Section | Owner |
| --- | --- |
| A. University Information | Registrar |
| B. Faculty and Staff Details | HR |
| C. Infrastructure Details | Registrar |
| D. Student Activities | Dean Student Welfare / Director Student Affairs |
| E. Student Activities, Placement, Internship and Training | Dean Industry and Corporate Relations / T & P |
| F. Observations & Recommendations of the Audit | VC / IQAC / Audit Team |

## 8. VC And IQAC Review Dashboard

Routes:

```text
/vice-chancellor/dashboard
/iqac/dashboard
/review/dashboard
```

Main files:

| Purpose | File |
| --- | --- |
| Route wrapper | `src/pages/review/ReviewDashboardPage.jsx` |
| Shared VC/IQAC dashboard | `src/features/schoolAppraisal/reviewDashboard/ReviewDashboard.jsx` |
| Mock schools, role labels, groups | `src/features/schoolAppraisal/reviewDashboard/reviewDashboardData.js` |

The same dashboard is used for Vice Chancellor and IQAC. The label changes based on `sessionStorage.role`.

Current review dashboard behavior:

- sidebar has Overview, Academic Audit, Administrative Audit
- Academic and Administrative lists are grouped by All, Engineering, and Non-Engineering
- View Form opens a full form view with Back button
- section navigation shows Part A, Part B, etc.
- VC/IQAC can view, approve, and generate report
- remarks and send back were removed
- generate report prints all sections, not only the active section

Important localStorage note:

Until backend is connected, VC/IQAC reads from the same browser localStorage drafts used by Director and Administrative forms. That means all mock schools can show the same locally saved form data. Backend should later provide school-specific submitted forms.

## 9. Reports And Print

| Form | Report File |
| --- | --- |
| Academic Audit | `src/features/schoolAppraisal/components/AuditReportPanel.jsx` |
| Administrative Audit | `src/features/schoolAppraisal/administrativeAudit/AdministrativeReportPanel.jsx` |
| VC/IQAC Review Print | `src/features/schoolAppraisal/reviewDashboard/ReviewDashboard.jsx` |

Print-specific CSS is in:

```text
src/styles/common.css
```

Look for:

```css
@media print
```

The sidebar and non-report buttons should be hidden during print using common print classes.

## 10. Common Change Map

| If you want to change... | Edit this file |
| --- | --- |
| Login accounts or redirects | `src/pages/auth/Login.jsx` |
| Route path or role protection | `src/App.jsx` |
| Academic form columns/headings/sections | `src/features/schoolAppraisal/formSchemas/academicAudit2025.js` |
| Administrative form columns/headings/sections | `src/features/schoolAppraisal/administrativeAudit/administrativeAuditConfig.js` |
| Add row/delete row/Sr No/attachment table behavior | `src/features/schoolAppraisal/components/AuditTable.jsx` |
| Serial number detection | `src/features/schoolAppraisal/components/tableHelpers.js` |
| Academic form save/submit/section navigation | `src/features/schoolAppraisal/components/AuditForm.jsx` |
| Administrative form save/submit/section navigation | `src/features/schoolAppraisal/administrativeAudit/AdministrativeAuditDashboard.jsx` |
| Academic report print layout | `src/features/schoolAppraisal/components/AuditReportPanel.jsx` |
| Administrative report print layout | `src/features/schoolAppraisal/administrativeAudit/AdministrativeReportPanel.jsx` |
| VC/IQAC dashboard cards/tabs/view/approve/report | `src/features/schoolAppraisal/reviewDashboard/ReviewDashboard.jsx` |
| VC/IQAC mock schools and grouping | `src/features/schoolAppraisal/reviewDashboard/reviewDashboardData.js` |
| Sidebar UI | `src/features/schoolAppraisal/components/AppSidebar.jsx` |
| Common colors/fonts/buttons/tables/print CSS | `src/styles/common.css` |

## 11. Attachment Columns

Attachment fields are currently detected in `AuditTable.jsx` by column names containing words like:

```text
link
proof
attachment
document
mom
```

So if a table column is named `Link to relevant Proof`, `Proof as attachment`, or `Link for MoM`, the table should show attachment/view controls.

If backend later stores file metadata, update the attachment handling inside:

```text
src/features/schoolAppraisal/components/AuditTable.jsx
```

## 12. Backend Integration Notes

Recommended backend entities:

- users
- roles
- schools
- academic audit submissions
- administrative audit submissions
- audit sections
- audit table rows
- attachments
- approvals

Frontend values can be mapped easily if backend naming differs. The important thing is to preserve stable IDs for sections, fields, tables, and columns.

Recommended API shape for loading a submitted form:

```js
{
  id: "submission-id",
  auditType: "academic" | "administrative",
  schoolId: "school-id",
  academicYear: "2025-26",
  status: "draft" | "submitted" | "approved",
  fields: {},
  tables: {},
  attachments: [],
  submittedAt: "date string",
  approvedAt: "date string"
}
```

For Academic frontend, map backend `fields` into `values` if required.

For Administrative frontend, the frontend already uses `fields`.

## 13. Useful Commands

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Run lint:

```bash
npm run lint
```

Build production bundle:

```bash
npm run build
```

## 14. Before Backend Starts

Before connecting backend, keep these IDs stable:

- route role names in `src/App.jsx`
- local form field IDs in schemas
- table IDs in schemas
- section IDs in schemas
- status names in review dashboard

Changing display labels is easy. Changing IDs after backend starts will require migration or mapping.
