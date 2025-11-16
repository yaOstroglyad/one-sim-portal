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
   * Export data to Excel file with proper number formatting
   * @param data Array of objects to export
   * @param fileName Name of the file (without extension)
   * @param sheetName Name of the worksheet
   */
  public exportToExcel(data: any[], fileName: string, sheetName: string = 'Sheet1'): void {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // Data should already have proper types from mapDataForExcel
    // No automatic string-to-number conversion to avoid precision loss for long numeric strings like ICCID

    // Create worksheet from data
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    // Apply number format to numeric cells
    this.applyNumberFormats(worksheet, data);

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
   * Apply number formats to numeric cells
   * Sets Excel cell format for proper number display
   */
  private applyNumberFormats(worksheet: XLSX.WorkSheet, data: any[]): void {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);

    // Start from row 2 (row 1 is headers)
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];

      headers.forEach((header, colIndex) => {
        const value = row[header];

        // Skip non-numeric values
        if (typeof value !== 'number' || !isFinite(value)) {
          return;
        }

        // Calculate cell reference (A2, B2, etc.)
        const cellRef = XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex });
        const cell = worksheet[cellRef];

        if (cell) {
          // Set number format
          // Check if it's a decimal number
          if (value % 1 !== 0) {
            // Decimal number - use 2 decimal places
            cell.z = '0.00';
          } else {
            // Integer - no decimal places
            cell.z = '0';
          }
        }
      });
    }
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
