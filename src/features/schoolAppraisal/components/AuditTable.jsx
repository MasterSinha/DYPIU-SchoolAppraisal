import { columnsWithSerial, serialColumnFor } from "./tableHelpers";

const isAttachmentColumn = (column) => /proof\s+as\s+an?\s+attachment/i.test(column);

export default function AuditTable({ table, rows, values = {}, onFieldChange, onChange, onAddRow, onDeleteLastRow }) {
  const columns = columnsWithSerial(table.columns);

  return (
    <section style={styles.wrap}>
      {table.showTitle !== false && (
        <div style={styles.header}>
          <h3 style={styles.title}>{table.title}</h3>
        </div>
      )}

      {!!table.fields?.length && (
        <div style={styles.embeddedFields}>
          {table.fields.map((field) => (
            <label key={field.id} style={styles.embeddedField}>
              <span style={styles.embeddedLabel}>{field.label}</span>
              <input
                value={values[field.id] ?? ""}
                onChange={(event) => onFieldChange(field.id, event.target.value)}
                style={styles.embeddedInput}
                type={field.type || "text"}
              />
            </label>
          ))}
        </div>
      )}

      <div style={styles.scroller}>
        <table style={{ ...styles.table, minWidth: Math.max(760, columns.length * 180) }}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} style={styles.th}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${table.id}-${rowIndex}`}>
                {columns.map((column) => (
                  <td key={column} style={styles.td}>
                    {isAttachmentColumn(column) ? (
                      <div style={styles.attachmentCell}>
                        <input
                          type="file"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            onChange(rowIndex, column, {
                              name: file.name,
                              url: URL.createObjectURL(file),
                            });
                          }}
                          style={styles.fileInput}
                          aria-label={`${table.title} ${column}`}
                        />
                        {row[column]?.url && (
                          <a href={row[column].url} target="_blank" rel="noreferrer" style={styles.attachmentLink}>
                            View attachment
                          </a>
                        )}
                        {row[column]?.name && <span style={styles.fileName}>{row[column].name}</span>}
                      </div>
                    ) : (
                      <input
                        value={row[column] ?? ""}
                        onChange={(event) => onChange(rowIndex, column, event.target.value)}
                        style={{
                          ...styles.cellInput,
                          background: serialColumnFor([column]) ? "#f8fafc" : "#fff",
                        }}
                        readOnly={Boolean(serialColumnFor([column]))}
                        aria-label={`${table.title} ${column}`}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td style={styles.emptyCell} colSpan={columns.length}>
                  No rows added.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.footer}>
        <button type="button" style={styles.secondaryButton} onClick={onAddRow}>
          Add Row
        </button>
        <button type="button" style={styles.removeButton} onClick={onDeleteLastRow} disabled={rows.length === 1}>
          Delete Last Row
        </button>
      </div>
    </section>
  );
}

const styles = {
  wrap: {
    border: "1px solid #dbe3ef",
    borderRadius: 6,
    background: "#fff",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px",
    borderBottom: "1px solid #e5edf7",
    background: "#f8fafc",
  },
  title: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.35,
    color: "#0f172a",
  },
  embeddedFields: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 14,
    padding: "12px 14px",
    borderBottom: "1px solid #e5edf7",
    background: "#fff",
  },
  embeddedField: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  embeddedLabel: {
    color: "#334155",
    fontSize: 13,
    fontWeight: 800,
  },
  embeddedInput: {
    width: "100%",
    border: "1px solid #cbd5e1",
    borderRadius: 5,
    padding: "10px 11px",
    color: "#0f172a",
    background: "#fff",
    outline: "none",
  },
  scroller: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "10px 12px",
    borderBottom: "1px solid #dbe3ef",
    borderRight: "1px solid #e5edf7",
    color: "#334155",
    background: "#f1f5f9",
    fontSize: 12,
    fontWeight: 700,
    textAlign: "left",
    whiteSpace: "normal",
  },
  td: {
    padding: 8,
    borderBottom: "1px solid #edf2f7",
    borderRight: "1px solid #edf2f7",
    verticalAlign: "top",
  },
  cellInput: {
    width: "100%",
    minWidth: 120,
    border: "1px solid #cbd5e1",
    borderRadius: 4,
    padding: "8px 9px",
    color: "#0f172a",
    background: "#fff",
    outline: "none",
  },
  secondaryButton: {
    flex: "0 0 auto",
    border: "1px solid #2563eb",
    borderRadius: 8,
    color: "#2563eb",
    background: "#fff",
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
  },
  removeButton: {
    border: "1px solid #dc2626",
    borderRadius: 8,
    color: "#dc2626",
    background: "#fff",
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    padding: "12px 14px",
    borderTop: "1px solid #e5edf7",
    background: "#f8fafc",
  },
  attachmentCell: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    minWidth: 180,
  },
  fileInput: {
    width: "100%",
    color: "#334155",
    fontSize: 12,
  },
  attachmentLink: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: 800,
    textDecoration: "none",
  },
  fileName: {
    color: "#64748b",
    fontSize: 11,
    wordBreak: "break-word",
  },
  emptyCell: {
    padding: 18,
    textAlign: "center",
    color: "#64748b",
    fontSize: 13,
  },
};
