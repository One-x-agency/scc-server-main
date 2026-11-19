import { Response } from 'express';

export function toCsv(rows: any[]): string {
  if (!rows || rows.length === 0) return '';

  // Collect ALL unique keys across all rows
  const headerSet = new Set<string>();
  rows.forEach((row) => {
    Object.keys(row).forEach((key) => headerSet.add(key));
  });

  const headers = Array.from(headerSet);

  const escape = (val: any) => {
    if (val === null || val === undefined) return '';
    const str = typeof val === 'object'
      ? JSON.stringify(val)
      : String(val);
    const needsQuote = /[",\n]/.test(str);
    const escaped = str.replace(/"/g, '""');
    return needsQuote ? `"${escaped}"` : escaped;
  };

  const headerLine = headers.map(escape).join(',');
  const lines = rows.map((row) => headers.map((h) => escape(row[h])).join(','));

  return [headerLine, ...lines].join('\n');
}

export function sendCsv(res: Response, filename: string, rows: any[]) {
  const csv = toCsv(rows);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).send(csv);
}
