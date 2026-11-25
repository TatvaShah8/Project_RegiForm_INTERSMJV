/**
 * Option 2 QR Payload Helper
 * Encodes only an opaque Pass URL (/pass/<passId>) so external scanners
 * (e.g., Google Lens) never see personal details, while authorized staff
 * dashboards can resolve full role-based details from the server.
 */

export function extractPassId(input?: string | null): string {
  if (!input) return "";
  const trimmed = input.trim();
  // Match .../pass/<id> URL
  const urlMatch = trimmed.match(/\/pass\/([a-fA-F0-9]{24})(?:[/?#]|$)/);
  if (urlMatch) return urlMatch[1];
  // Match #<objectId> or raw <objectId>
  return trimmed.replace(/^#/, "");
}

export function isValidPassId(id: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(id);
}

export function buildPassQrPayload(passNo?: string | null, origin?: string): string {
  const cleanId = extractPassId(passNo);
  const base =
    origin ||
    (typeof window !== "undefined" ? window.location.origin : "");

  if (isValidPassId(cleanId)) {
    return base ? `${base}/pass/${cleanId}` : `/pass/${cleanId}`;
  }

  return base ? `${base}/pass/pending` : "SMJV2026:PENDING";
}
