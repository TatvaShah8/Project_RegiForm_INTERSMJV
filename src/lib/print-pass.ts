/**
 * Dedicated utility for printing and exporting the SMJV Youth Festival 2026 Accreditation ID Pass.
 * Generates an isolated, self-contained HTML document inside a hidden iframe.
 * Ensures exact 1-page output, vibrant print colors, scannable QR code, and zero blank sheets.
 */

export interface PassPrintData {
  name: string;
  grNo: string;
  branch: string;
  bloodGroup: string;
  age: string;
  gender: string;
  dob: string;
  mobile: string;
  email: string;
  college: string;
  course: string;
  year: string;
  role: string;
  sports: string[];
  kit: string;
  photo?: string | null;
  qr: string;
}

export function printPassCard(data: PassPrintData) {
  if (typeof window === "undefined") return;

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

  const sportsHtml =
    data.sports.length > 0
      ? data.sports
          .map((s) => `<span class="sport-badge">${s}</span>`)
          .join(" ")
      : `<span class="sport-badge">${data.role}</span>`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SMJV Youth Festival 2026 - Accreditation Pass - ${data.name || "Participant"}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 10px 0;
      background: #ffffff !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      color: #0f172a;
    }
    .pass-container {
      width: 440px;
      max-width: 100%;
      border: 2px solid #cbd5e1;
      border-radius: 20px;
      overflow: hidden;
      background: #ffffff;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      page-break-inside: avoid;
    }
    .pass-header {
      background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #0a0e2a;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .header-logo {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid rgba(0,0,0,0.15);
      object-fit: cover;
    }
    .header-title {
      font-size: 19px;
      font-weight: 900;
      letter-spacing: 0.5px;
      margin: 0;
      line-height: 1.1;
      text-transform: uppercase;
      color: #0a0e2a;
    }
    .header-subtitle {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 2.5px;
      margin: 2px 0 0 0;
      color: rgba(10, 14, 42, 0.85);
      text-transform: uppercase;
    }
    .role-badge {
      background: #000000;
      color: #ffffff;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.5px;
      padding: 4px 12px;
      border-radius: 9999px;
      text-transform: uppercase;
    }
    .pass-body {
      padding: 16px 18px;
    }
    .identity-row {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 12px;
    }
    .photo-wrapper {
      position: relative;
      width: 76px;
      height: 92px;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid #cbd5e1;
      background: #f1f5f9;
      flex-shrink: 0;
    }
    .photo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .photo-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
      color: #64748b;
      letter-spacing: 1px;
    }
    .prov-badge {
      position: absolute;
      bottom: 2px;
      left: 2px;
      right: 2px;
      background: rgba(147, 51, 234, 0.95);
      color: #ffffff;
      font-size: 7px;
      font-weight: 800;
      text-align: center;
      border-radius: 4px;
      padding: 1px 0;
      letter-spacing: 0.5px;
    }
    .identity-details {
      flex: 1;
      min-width: 0;
    }
    .tag-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 4px;
    }
    .tag {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.5px;
      padding: 2px 7px;
      border-radius: 6px;
      text-transform: uppercase;
    }
    .tag-branch {
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
    }
    .tag-blood {
      background: #fee2e2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    }
    .tag-gr {
      background: #f1f5f9;
      color: #0f172a;
      border: 1px solid #cbd5e1;
    }
    .student-name {
      font-size: 18px;
      font-weight: 900;
      color: #0f172a;
      margin: 0;
      line-height: 1.2;
      text-transform: uppercase;
      word-break: break-word;
    }
    .meta-line {
      font-size: 11px;
      color: #475569;
      margin: 3px 0 0 0;
    }
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 9px 12px;
      margin-bottom: 8px;
      font-size: 11px;
      line-height: 1.4;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .info-label {
      font-size: 9px;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }
    .info-value {
      font-weight: 600;
      color: #0f172a;
    }
    .sports-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 8px 12px;
      margin-bottom: 10px;
    }
    .sport-badge {
      display: inline-block;
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
      font-size: 9px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 9999px;
      margin-right: 4px;
      text-transform: uppercase;
    }
    .kit-badge {
      font-size: 11px;
      font-weight: 800;
      color: #ea580c;
    }
    .qr-container {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .qr-img {
      width: 130px;
      height: 130px;
      object-fit: contain;
    }
    .qr-caption {
      font-size: 9px;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.5px;
      margin-top: 6px;
      text-transform: uppercase;
    }
    .pass-footer {
      border-top: 1px dashed #cbd5e1;
      padding: 8px 18px;
      background: #f8fafc;
      font-size: 8px;
      font-weight: 700;
      color: #94a3b8;
      text-align: center;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="pass-container">
    <div class="pass-header">
      <div class="header-left">
        <img src="/logo.jpg" alt="SMJV Youth Festival Logo" class="header-logo" onerror="this.style.display='none'" />
        <div>
          <h1 class="header-title">SMJV YOUTH FESTIVAL 2026</h1>
          <p class="header-subtitle">VADODARA</p>
        </div>
      </div>
      <div class="role-badge">${data.role}</div>
    </div>
    <div class="pass-body">
      <div class="identity-row">
        <div class="photo-wrapper">
          ${
            data.photo
              ? `<img src="${data.photo}" alt="Portrait" class="photo-img" />`
              : `<div class="photo-placeholder">PHOTO</div>`
          }
          <div class="prov-badge">PROVISIONAL</div>
        </div>
        <div class="identity-details">
          <div class="tag-row">
            <span class="tag tag-branch">${data.branch}</span>
            <span class="tag tag-blood">🩸 ${data.bloodGroup}</span>
            <span class="tag tag-gr">GR: ${data.grNo}</span>
          </div>
          <h2 class="student-name">${data.name}</h2>
          <p class="meta-line">Age: ${data.age} · ${data.gender} · DOB: ${data.dob}</p>
        </div>
      </div>

      <div class="info-card">
        <div class="info-row">
          <span class="info-label">CONTACT</span>
          <span class="info-value">+91 ${data.mobile} · ${data.email}</span>
        </div>
        <div style="border-top: 1px solid #e2e8f0; margin-top: 6px; padding-top: 6px;">
          <div class="info-label">COLLEGE / COURSE</div>
          <div class="info-value" style="font-size: 10.5px; margin-top: 2px;">
            ${data.college} · <b style="color: #b45309;">${data.course} (${data.year})</b>
          </div>
        </div>
      </div>

      <div class="sports-row">
        <div>
          <span class="info-label" style="margin-right: 6px;">SPORTS:</span>
          ${sportsHtml}
        </div>
        <div class="kit-badge">
          <span class="info-label">KIT:</span> ${data.kit}
        </div>
      </div>

      <div class="qr-container">
        <img src="${data.qr}" alt="Accreditation QR" class="qr-img" />
        <span class="qr-caption">OFFICIAL ACCREDITATION PASS · SCANNABLE AT ENTRY GATE</span>
      </div>
    </div>
    <div class="pass-footer">
      SHREE MAHAVIRA JAINA VIDYALAYA · SMJV YOUTH FESTIVAL 2026 · VADODARA
    </div>
  </div>
</body>
</html>`;

  doc.open();
  doc.write(html);
  doc.close();

  // Allow images to load in the document before triggering print
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error("Print error:", e);
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2500);
    }
  }, 300);
}
