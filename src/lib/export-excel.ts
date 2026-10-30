import * as XLSX from 'xlsx';

/**
 * Xuất dữ liệu ra file Excel (.xlsx) với hỗ trợ tiếng Việt và nhiều Sheet
 */
export function exportToExcel(
  filename: string,
  sheets: { sheetName: string; data: Record<string, any>[] }[]
) {
  const wb = XLSX.utils.book_new();

  for (const { sheetName, data } of sheets) {
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31)); // Giới hạn tên sheet 31 ký tự của Excel
  }

  const cleanFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(wb, cleanFilename);
}

/**
 * Xuất dữ liệu ra file CSV với UTF-8 BOM để Excel hiển thị tiếng Việt không bị lỗi font
 */
export function exportToCsv(filename: string, data: Record<string, any>[]) {
  if (!data || data.length === 0) {
    alert('Không có dữ liệu để xuất file CSV.');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];

  // Dòng tiêu đề
  csvRows.push(headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','));

  // Các dòng dữ liệu
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      if (val === null || val === undefined) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  // Thêm UTF-8 BOM (\uFEFF) để Excel trên Windows nhận diện đúng bảng mã tiếng Việt
  const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], {
    type: 'text/csv;charset=utf-8;'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const cleanFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', cleanFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
