export const serialColumnFor = (columns) =>
  columns.find((column) => /^(sr\.?\s*no\.?|s\.?no|sn|sl\.?\s*no\.?)$/i.test(column.trim()));

export const columnsWithSerial = (columns) => {
  if (serialColumnFor(columns)) return columns;
  return ["Sr No", ...columns];
};
