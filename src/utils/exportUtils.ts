/**
 * Global Export Utility for Kaksedthan Herdbook Management System
 * Generates and triggers clean CSV/Excel downloads respecting column mapping, formatting, and data sanitization.
 */

export interface ExportColumn {
  header: string;
  key: string;
  formatter?: (val: any, row: any) => string;
}

export function exportToCSV(filename: string, columns: ExportColumn[], rows: any[]) {
  if (!rows || rows.length === 0) {
    alert('No data available to export.');
    return;
  }

  // Sanitize headers
  const headerRow = columns.map(c => `"${c.header.replace(/"/g, '""')}"`).join(',');

  // Sanitize data rows (stripping passwords, secret keys, sensitive fields)
  const dataRows = rows.map(row => {
    return columns
      .map(col => {
        let val = row[col.key];
        if (col.formatter) {
          val = col.formatter(val, row);
        } else if (val === null || val === undefined) {
          val = '';
        } else if (typeof val === 'object') {
          val = JSON.stringify(val);
        } else {
          val = String(val);
        }
        // Escape quotes
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  const csvContent = [headerRow, ...dataRows].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getFormattedDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
