import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

/**
 * Service for exporting data to Excel format
 */
@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {
  /**
   * Export data to Excel file
   * @param data Array of objects to export
   * @param fileName Name of the file (without extension)
   * @param sheetName Name of the worksheet
   */
  public exportToExcel(data: any[], fileName: string, sheetName: string = 'Sheet1'): void {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // Create worksheet from data
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    // Auto-size columns based on content
    const columnWidths = this.calculateColumnWidths(data);
    worksheet['!cols'] = columnWidths;

    // Create workbook and add worksheet
    const workbook: XLSX.WorkBook = {
      Sheets: { [sheetName]: worksheet },
      SheetNames: [sheetName]
    };

    // Generate file and trigger download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, fileName);
  }

  /**
   * Calculate optimal column widths based on content
   */
  private calculateColumnWidths(data: any[]): { wch: number }[] {
    if (!data || data.length === 0) {
      return [];
    }

    const keys = Object.keys(data[0]);
    return keys.map(key => {
      // Find max length for this column
      const maxLength = data.reduce((max, row) => {
        const value = String(row[key] || '');
        return Math.max(max, value.length);
      }, key.length);

      // Add some padding and limit max width
      return { wch: Math.min(Math.max(maxLength + 2, 10), 50) };
    });
  }

  /**
   * Save Excel buffer as file
   */
  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // Create download link
    const link = document.createElement('a');
    const url = window.URL.createObjectURL(data);
    link.href = url;
    link.download = `${fileName}.xlsx`;
    link.click();

    // Cleanup
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 100);
  }
}
