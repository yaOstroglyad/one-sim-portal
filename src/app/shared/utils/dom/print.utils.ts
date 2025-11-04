/**
 * Print utilities for DOM operations
 * Provides functions for printing QR codes and other content
 */

/**
 * QR Code print options
 */
export interface QrCodePrintOptions {
  qrCodeValue: string;
  iccid: string;
  title?: string;
  qrCodeSize?: number;
  autoClose?: boolean;
}

/**
 * Print QR code in a new window
 * Opens a new window with only the QR code and ICCID, then triggers print dialog
 *
 * @param options - QR code print configuration
 * @returns true if print window was opened successfully, false otherwise
 *
 * @example
 * ```typescript
 * printQrCode({
 *   qrCodeValue: 'LPA:1$smdp.example.com$...',
 *   iccid: '8937103100001477492',
 *   title: 'eSIM QR Code'
 * });
 * ```
 */
export function printQrCode(options: QrCodePrintOptions): boolean {
  const {
    qrCodeValue,
    iccid,
    title = `QR Code - ${iccid}`,
    qrCodeSize = 300,
    autoClose = false
  } = options;

  if (!qrCodeValue || !iccid) {
    console.error('printQrCode: qrCodeValue and iccid are required');
    return false;
  }

  const printWindow = window.open('', '_blank', 'width=600,height=600');

  if (!printWindow) {
    console.error('printQrCode: Failed to open print window. Popup might be blocked.');
    return false;
  }

  const htmlContent = generateQrCodePrintHtml({
    qrCodeValue,
    iccid,
    title,
    qrCodeSize,
    autoClose
  });

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  return true;
}

/**
 * Generate HTML content for QR code printing
 * @internal
 */
function generateQrCodePrintHtml(options: Required<QrCodePrintOptions>): string {
  const { qrCodeValue, iccid, title, qrCodeSize, autoClose } = options;

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(title)}</title>
        <style>
          ${getQrCodePrintStyles()}
        </style>
        <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
      </head>
      <body>
        <div class="qr-container">
          <canvas id="qrcode" class="qr-code"></canvas>
          <div class="iccid-info">
            <div class="iccid-label">ICCID:</div>
            <div class="iccid-value">${escapeHtml(iccid)}</div>
          </div>
        </div>
        <script>
          ${getQrCodeGenerationScript(qrCodeValue, qrCodeSize, autoClose)}
        </script>
      </body>
    </html>
  `;
}

/**
 * Get CSS styles for QR code print page
 * @internal
 */
function getQrCodePrintStyles(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
      background: white;
    }

    .qr-container {
      text-align: center;
      max-width: 400px;
    }

    .qr-code {
      margin: 0 auto 1.5rem;
      display: block;
    }

    .iccid-info {
      font-size: 1rem;
      color: #000;
      margin-top: 1rem;
    }

    .iccid-label {
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .iccid-value {
      font-family: 'Courier New', Consolas, Monaco, monospace;
      font-weight: 600;
      font-size: 1.1rem;
      background-color: #f5f5f5;
      padding: 0.5rem 1rem;
      border: 1px solid #ddd;
      border-radius: 0.25rem;
      display: inline-block;
      word-break: break-all;
    }

    @media print {
      body {
        padding: 0;
      }

      .qr-container {
        page-break-inside: avoid;
      }
    }
  `;
}

/**
 * Get JavaScript code for QR code generation
 * @internal
 */
function getQrCodeGenerationScript(
  qrCodeValue: string,
  qrCodeSize: number,
  autoClose: boolean
): string {
  // Escape qrCodeValue for safe injection into script
  const escapedValue = qrCodeValue.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  return `
    (function() {
      // Generate QR code
      QRCode.toCanvas(
        document.getElementById('qrcode'),
        '${escapedValue}',
        {
          width: ${qrCodeSize},
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        },
        function(error) {
          if (error) {
            console.error('QR Code generation error:', error);
            document.body.innerHTML = '<div style="padding: 2rem; text-align: center;">Error generating QR code. Please try again.</div>';
            return;
          }

          // Auto-print after QR code is generated
          setTimeout(function() {
            window.print();
            ${autoClose ? 'setTimeout(function() { window.close(); }, 100);' : ''}
          }, 500);
        }
      );
    })();
  `;
}

/**
 * Escape HTML special characters to prevent XSS
 * @internal
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
