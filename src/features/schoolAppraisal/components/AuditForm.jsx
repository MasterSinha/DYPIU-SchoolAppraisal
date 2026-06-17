import { useMemo, useState } from "react";
import AuditSection from "./AuditSection";
import { columnsWithSerial, serialColumnFor } from "./tableHelpers";

const draftKeyFor = (schemaId) => `dypiu-school-appraisal:${schemaId}:draft`;

const emptyRowFor = (columns) =>
  columnsWithSerial(columns).reduce((row, column) => {
    row[column] = "";
    return row;
  }, {});

const numberedRowFor = (columns, index) => {
  const row = emptyRowFor(columns);
  const serialColumn = serialColumnFor(Object.keys(row));
  if (serialColumn) row[serialColumn] = String(index + 1);
  return row;
};

const withSerialNumbers = (columns, rows) => {
  const normalizedColumns = columnsWithSerial(columns);
  const serialColumn = serialColumnFor(normalizedColumns);

  return rows.map((row, index) => ({
    ...numberedRowFor(columns, index),
    ...row,
    ...(serialColumn && !row[serialColumn] ? { [serialColumn]: String(index + 1) } : {}),
  }));
};

function buildInitialValues(schema) {
  return schema.sections.reduce((values, section) => {
    const fields = [
      ...(section.fields || []),
      ...(section.blocks || []).flatMap((block) => (block.type === "fields" ? block.fields : [])),
    ];

    fields.forEach((field) => {
      if (field.kind === "heading") return;
      values[field.id] = "";
    });
    return values;
  }, {});
}

function buildInitialTables(schema) {
  return schema.sections.reduce((tables, section) => {
    const tableDefinitions = [
      ...(section.tables || []),
      ...(section.blocks || []).flatMap((block) => (block.type === "tables" ? block.tables : [])),
    ];

    tableDefinitions.forEach((table) => {
      const rows = table.initialRows?.length ? table.initialRows : [numberedRowFor(table.columns, 0)];
      tables[table.id] = withSerialNumbers(table.columns, rows);
    });
    return tables;
  }, {});
}

export default function AuditForm({ schema, activeSectionId }) {
  const initialValues = useMemo(() => buildInitialValues(schema), [schema]);
  const initialTables = useMemo(() => buildInitialTables(schema), [schema]);
  const [values, setValues] = useState(() => {
    const saved = window.localStorage.getItem(draftKeyFor(schema.id));
    if (!saved) return initialValues;
    try {
      return { ...initialValues, ...JSON.parse(saved).values };
    } catch {
      return initialValues;
    }
  });
  const [tables, setTables] = useState(() => {
    const saved = window.localStorage.getItem(draftKeyFor(schema.id));
    if (!saved) return initialTables;
    try {
      return { ...initialTables, ...JSON.parse(saved).tables };
    } catch {
      return initialTables;
    }
  });
  const [status, setStatus] = useState("");

  const handleFieldChange = (fieldId, value) => {
    setValues((current) => ({ ...current, [fieldId]: value }));
    setStatus("");
  };

  const handleTableChange = (tableId, rowIndex, column, value) => {
    setTables((current) => ({
      ...current,
      [tableId]: current[tableId].map((row, index) => (index === rowIndex ? { ...row, [column]: value } : row)),
    }));
    setStatus("");
  };

  const handleAddRow = (table) => {
    setTables((current) => ({
      ...current,
      [table.id]: [...(current[table.id] || []), numberedRowFor(table.columns, current[table.id]?.length || 0)],
    }));
  };

  const handleDeleteLastRow = (table) => {
    setTables((current) => {
      const nextRows = (current[table.id] || []).slice(0, -1);
      return {
        ...current,
        [table.id]: nextRows.length ? withSerialNumbers(table.columns, nextRows) : [numberedRowFor(table.columns, 0)],
      };
    });
  };

  const handleSaveDraft = () => {
    window.localStorage.setItem(draftKeyFor(schema.id), JSON.stringify({ values, tables }));
    setStatus("Draft saved in this browser.");
  };

  const handleClear = () => {
    window.localStorage.removeItem(draftKeyFor(schema.id));
    setValues(initialValues);
    setTables(initialTables);
    setStatus("Form cleared.");
  };

  return (
    <form style={styles.form} onSubmit={(event) => event.preventDefault()}>
      <header style={styles.header}>
        <div>
          <p style={styles.kicker}>{schema.header.university}</p>
          <h1 style={styles.title}>{schema.title}</h1>
          <p style={styles.meta}>{schema.header.address}</p>
          <p style={styles.meta}>{schema.header.act}</p>
          <p style={styles.year}>Academic Year {schema.academicYear}</p>
        </div>
        <div style={styles.actions}>
          <button type="button" style={styles.secondaryButton} onClick={handleClear}>
            Clear
          </button>
          <button type="button" style={styles.secondaryButton} onClick={() => window.print()}>
            Print
          </button>
          <button type="button" style={styles.primaryButton} onClick={handleSaveDraft}>
            Save Draft
          </button>
        </div>
      </header>

      {status && <div style={styles.status}>{status}</div>}

      <div style={styles.sections}>
        {schema.sections
          .filter((section) => !activeSectionId || section.id === activeSectionId)
          .map((section) => (
          <AuditSection
            key={section.id}
            section={section}
            values={values}
            tables={tables}
            onFieldChange={handleFieldChange}
            onTableChange={handleTableChange}
            onAddRow={handleAddRow}
            onDeleteLastRow={handleDeleteLastRow}
          />
        ))}
      </div>
    </form>
  );
}

const styles = {
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 18,
    padding: 22,
    border: "1px solid #dbe3ef",
    borderRadius: 8,
    background: "#fff",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
  },
  kicker: {
    margin: "0 0 8px",
    color: "#1d4ed8",
    fontSize: 13,
    fontWeight: 800,
    textTransform: "uppercase",
  },
  title: {
    margin: "0 0 8px",
    color: "#0f172a",
    fontSize: 28,
    lineHeight: 1.2,
  },
  meta: {
    margin: "3px 0",
    color: "#64748b",
    fontSize: 13,
    lineHeight: 1.45,
  },
  year: {
    margin: "10px 0 0",
    color: "#334155",
    fontSize: 14,
    fontWeight: 700,
  },
  actions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  primaryButton: {
    border: "1px solid #2563eb",
    borderRadius: 5,
    color: "#fff",
    background: "#2563eb",
    padding: "10px 13px",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
  },
  secondaryButton: {
    border: "1px solid #cbd5e1",
    borderRadius: 5,
    color: "#334155",
    background: "#fff",
    padding: "10px 13px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  status: {
    padding: "10px 12px",
    border: "1px solid #bbf7d0",
    borderRadius: 6,
    color: "#166534",
    background: "#f0fdf4",
    fontSize: 13,
    fontWeight: 700,
  },
  sections: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
};
