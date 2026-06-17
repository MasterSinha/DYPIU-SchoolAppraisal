import { columnsWithSerial, serialColumnFor } from "../components/tableHelpers";

export default function EditableAuditTable({ table, rows, onCellChange, onAddRow, onDeleteRow, onDeleteLastRow }) {
  const columns = columnsWithSerial(table.columns);
  const serialColumn = serialColumnFor(columns);

  return (
    <section style={styles.card}>
      <div style={styles.cardHead}>
        <div>
          <h3 style={styles.title}>{table.title}</h3>
          <p style={styles.sub}>{rows.length} row{rows.length === 1 ? "" : "s"} recorded</p>
        </div>
      </div>

      <div style={styles.tableWrap}>
        <table style={{ ...styles.table, minWidth: Math.max(760, columns.length * 170) }}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} style={styles.th}>
                  {column}
                </th>
              ))}
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${table.id}-${rowIndex}`}>
                {columns.map((column) => (
                  <td key={column} style={styles.td}>
                    <input
                      value={row[column] ?? ""}
                      readOnly={column === serialColumn}
                      onChange={(event) => onCellChange(table.id, rowIndex, column, event.target.value)}
                      style={{
                        ...styles.input,
                        background: column === serialColumn ? "#f8fafc" : "#fff",
                        fontWeight: column === serialColumn ? 800 : 500,
                      }}
                      aria-label={`${table.title} ${column}`}
                    />
                  </td>
                ))}
                <td style={styles.td}>
                  <button type="button" style={styles.rowDelete} onClick={() => onDeleteRow(table.id, rowIndex)} disabled={rows.length === 1}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.footer}>
        <button type="button" style={styles.addButton} onClick={() => onAddRow(table)}>
          Add Row
        </button>
        <button type="button" style={styles.deleteButton} onClick={() => onDeleteLastRow(table)} disabled={rows.length === 1}>
          Delete Last Row
        </button>
      </div>
    </section>
  );
}

const styles = {
  card: {
    border: "1px solid #dbe3ef",
    borderRadius: 10,
    background: "#fff",
    overflow: "hidden",
    boxShadow: "0 12px 26px rgba(15, 23, 42, 0.04)",
  },
  cardHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    borderBottom: "1px solid #e5edf7",
    background: "#f8fafc",
  },
  title: {
    margin: 0,
    color: "#0f172a",
    fontSize: 16,
    lineHeight: 1.35,
  },
  sub: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: 12,
    fontWeight: 700,
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "11px 12px",
    borderBottom: "1px solid #dbe3ef",
    borderRight: "1px solid #e5edf7",
    background: "#eef4fb",
    color: "#334155",
    fontSize: 12,
    fontWeight: 900,
    textAlign: "left",
  },
  td: {
    padding: 8,
    borderBottom: "1px solid #edf2f7",
    borderRight: "1px solid #edf2f7",
    verticalAlign: "top",
  },
  input: {
    width: "100%",
    minWidth: 120,
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    color: "#0f172a",
    padding: "9px 10px",
    outline: "none",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    padding: "12px 16px",
    background: "#f8fafc",
  },
  addButton: {
    border: "1px solid #2563eb",
    borderRadius: 8,
    background: "#fff",
    color: "#2563eb",
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer",
  },
  deleteButton: {
    border: "1px solid #dc2626",
    borderRadius: 8,
    background: "#fff",
    color: "#dc2626",
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer",
  },
  rowDelete: {
    border: "1px solid #fca5a5",
    borderRadius: 7,
    background: "#fff",
    color: "#dc2626",
    padding: "8px 10px",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
  },
};
