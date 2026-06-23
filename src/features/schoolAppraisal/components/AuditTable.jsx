//academic & administrative table add rows and delete last row functionality , sr no, table heading(blue)
import { columnsWithSerial, serialColumnFor } from "./tableHelpers";

const isAttachmentColumn = (column) => /\b(link|proof|attachment|document|mom)\b/i.test(column);

export default function AuditTable({
  table,
  rows,
  values = {},
  onFieldChange,
  onChange,
  onCellChange,
  onAddRow,
  onDeleteLastRow,
}) {
  const columns = columnsWithSerial(table.columns);

  const handleCellChange = (rowIndex, column, value) => {
    if (onChange) {
      onChange(rowIndex, column, value);
      return;
    }

    onCellChange?.(table.id, rowIndex, column, value);
  };

  return (
    <section className="audit-table-card">
      {table.showTitle !== false && (
        <div className="audit-table-card__header">
          <h3 className="audit-table-card__title">{table.title}</h3>
        </div>
      )}

      {!!table.notes?.length && (
        <div className="audit-table-card__notes">
          {table.notes.map((note) => (
            <div key={note} className="audit-table-card__note">
              {note}
            </div>
          ))}
        </div>
      )}

      {!!table.fields?.length && (
        <div className="audit-table-card__embedded-fields">
          {table.fields.map((field) => (
            <label key={field.id} className="audit-table-card__embedded-field">
              <span className="audit-table-card__embedded-label">{field.label}</span>
              <input
                value={values[field.id] ?? ""}
                onChange={(event) => onFieldChange(field.id, event.target.value)}
                className="audit-control audit-table-card__embedded-input"
                type={field.type || "text"}
              />
            </label>
          ))}
        </div>
      )}

      <div className="audit-table-card__scroller">
        <table className="audit-table-card__table" style={{ minWidth: Math.max(760, columns.length * 180) }}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} className={`audit-table-card__th${serialColumnFor([column]) ? " audit-table-card__serial" : ""}`}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${table.id}-${rowIndex}`}>
                {columns.map((column) => (
                  <td key={column} className={`audit-table-card__td${serialColumnFor([column]) ? " audit-table-card__serial" : ""}`}>
                    {isAttachmentColumn(column) ? (
                      <div className="audit-table-card__attachment-cell">
                        <label className="btn btn-outline">
                          Add Attachment
                          <input
                            type="file"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (!file) return;
                              handleCellChange(rowIndex, column, {
                                name: file.name,
                                url: URL.createObjectURL(file),
                              });
                            }}
                            className="audit-table-card__file-input"
                            aria-label={`${table.title} ${column}`}
                          />
                        </label>
                        {row[column]?.url && (
                          <a href={row[column].url} target="_blank" rel="noreferrer" className="audit-table-card__attachment-link">
                            View Attachment
                          </a>
                        )}
                        {row[column]?.name && <span className="audit-table-card__file-name">{row[column].name}</span>}
                      </div>
                    ) : (
                      <input
                        className={`audit-table-input audit-table-card__cell-input${serialColumnFor([column]) ? " audit-table-card__serial-input" : ""}`}
                        value={row[column] ?? ""}
                        onChange={(event) => handleCellChange(rowIndex, column, event.target.value)}
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
                <td className="audit-table-card__empty" colSpan={columns.length}>
                  No rows added.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="audit-table-card__footer">
        <button type="button" className="btn btn-secondary" onClick={onAddRow}>
          Add Row
        </button>
        <button type="button" className="btn btn-danger" onClick={onDeleteLastRow} disabled={rows.length === 1}>
          Delete Last Row
        </button>
      </div>
    </section>
  );
}
