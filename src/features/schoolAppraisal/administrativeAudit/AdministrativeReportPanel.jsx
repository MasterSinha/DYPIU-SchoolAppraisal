export default function AdministrativeReportPanel({ meta, modules, data, onClose }) {
  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <div>
          <p style={styles.kicker}>{meta.university}</p>
          <h2 style={styles.title}>{meta.title}</h2>
          <p style={styles.text}>{meta.address}</p>
          <p style={styles.text}>{meta.act}</p>
          <p style={styles.year}>Academic Year {meta.academicYear}</p>
        </div>
        <div style={styles.actions}>
          <button type="button" style={styles.secondary} onClick={onClose}>
            Close
          </button>
          <button type="button" style={styles.primary} onClick={() => window.print()}>
            Print Report
          </button>
        </div>
      </div>

      <div style={styles.body}>
        {modules.map((module) => (
          <section key={module.id} style={styles.module}>
            <h3 style={styles.moduleTitle}>
              {module.number}. {module.title}
            </h3>

            {!!module.fields?.length && (
              <div style={styles.fieldGrid}>
                {module.fields.map((field) => (
                  <div key={field.id} style={styles.fieldBlock}>
                    <div style={styles.fieldLabel}>{field.label}</div>
                    <div style={styles.fieldValue}>{data.fields[field.id] || "-"}</div>
                  </div>
                ))}
              </div>
            )}

            {!!module.tables?.length &&
              module.tables.map((table) => (
                <div key={table.id} style={styles.tableBlock}>
                  <h4 style={styles.tableTitle}>{table.title}</h4>
                  <div style={styles.scroller}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          {table.columns.map((column) => (
                            <th key={column} style={styles.th}>
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(data.tables[table.id] || []).map((row, index) => (
                          <tr key={`${table.id}-${index}`}>
                            {table.columns.map((column) => (
                              <td key={column} style={styles.td}>
                                {row[column] || "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
          </section>
        ))}
      </div>
    </div>
  );
}

const styles = {
  panel: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 18,
    padding: 22,
    border: "1px solid #dbe3ef",
    borderRadius: 10,
    background: "#fff",
    boxShadow: "0 12px 26px rgba(15, 23, 42, 0.04)",
  },
  kicker: {
    margin: "0 0 7px",
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
  },
  title: {
    margin: "0 0 8px",
    color: "#0f172a",
    fontSize: 26,
  },
  text: {
    margin: "2px 0",
    color: "#64748b",
    fontSize: 13,
  },
  year: {
    margin: "10px 0 0",
    color: "#334155",
    fontWeight: 900,
    fontSize: 13,
  },
  actions: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
  },
  primary: {
    border: "none",
    borderRadius: 8,
    background: "#2563eb",
    color: "#fff",
    padding: "10px 14px",
    fontWeight: 900,
    cursor: "pointer",
  },
  secondary: {
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    background: "#fff",
    color: "#334155",
    padding: "10px 14px",
    fontWeight: 900,
    cursor: "pointer",
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  module: {
    padding: 18,
    border: "1px solid #dbe3ef",
    borderRadius: 10,
    background: "#fff",
  },
  moduleTitle: {
    margin: "0 0 14px",
    color: "#0f172a",
    fontSize: 19,
  },
  fieldGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 10,
    marginBottom: 14,
  },
  fieldBlock: {
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 10,
    background: "#f8fafc",
  },
  fieldLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: 900,
    marginBottom: 5,
  },
  fieldValue: {
    color: "#0f172a",
    fontSize: 13,
    whiteSpace: "pre-wrap",
  },
  tableBlock: {
    marginTop: 14,
  },
  tableTitle: {
    margin: "0 0 8px",
    color: "#1e293b",
    fontSize: 15,
  },
  scroller: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 720,
  },
  th: {
    padding: "8px 9px",
    border: "1px solid #cbd5e1",
    background: "#eef4fb",
    color: "#334155",
    fontSize: 11,
    textAlign: "left",
  },
  td: {
    padding: "8px 9px",
    border: "1px solid #e2e8f0",
    color: "#0f172a",
    fontSize: 12,
    verticalAlign: "top",
  },
};
