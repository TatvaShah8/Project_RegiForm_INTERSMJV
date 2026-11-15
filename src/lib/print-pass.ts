/**
 * Dedicated utility for printing the INTER SMJV 2026 Accreditation ID Pass.
 * Uses an isolated hidden iframe so that background pages (e.g. schedules, portals)
 * and modal overlays are NEVER included in the print job, guaranteeing a clean,
 * single-page, full-color pass print without extra blank sheets.
 */
export function printAccreditationPass() {
  if (typeof window === "undefined") return;

  const card = document.querySelector(".print-area");
  if (!card) {
    window.print();
    return;
  }

  // Create isolated invisible iframe
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.zIndex = "-9999";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  // Gather stylesheet tags from parent document for tailwind typography/colors
  const styles = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
    .map((el) => el.outerHTML)
    .join("\n");

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>INTER SMJV 2026 - Official Accreditation Pass</title>
        ${styles}
        <style>
          @page {
            size: auto;
            margin: 10mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            box-sizing: border-box;
          }
          html, body {
            margin: 0;
            padding: 10px 0;
            background: #ffffff !important;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .print-wrapper {
            width: 460px;
            max-width: 100%;
            margin: 0 auto;
            border: 2px solid #cbd5e1;
            border-radius: 20px;
            overflow: hidden;
            background: #ffffff !important;
            box-shadow: none !important;
          }
          .print-wrapper button {
            display: none !important;
          }
          .print-wrapper .text-fest-white {
            color: #0f172a !important;
          }
          .print-wrapper .text-fest-label {
            color: #334155 !important;
          }
          .print-wrapper .bg-white\\/60,
          .print-wrapper .bg-white\\/70,
          .print-wrapper .bg-white\\/80 {
            background-color: #f8fafc !important;
            border-color: #cbd5e1 !important;
          }
        </style>
      </head>
      <body>
        <div class="print-wrapper">
          ${card.innerHTML}
        </div>
      </body>
    </html>
  `);
  doc.close();

  // Allow styles and QR image to render inside iframe before triggering print
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.print();
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2500);
    }
  }, 400);
}
