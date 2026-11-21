import type { RegisterState } from "./store";
import { registrationRequest } from "./registration-api";
export const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23F59E0B"/><stop offset="100%" stop-color="%23EA580C"/></linearGradient></defs><circle cx="60" cy="60" r="60" fill="%23FFF5EA"/><circle cx="60" cy="45" r="24" fill="%231E293B"/><circle cx="60" cy="47" r="21" fill="%23F6D5B8"/><path d="M42 38 C42 22 78 22 78 38 C75 30 65 30 60 32 C55 30 45 30 42 38 Z" fill="%231E293B"/><ellipse cx="53" cy="47" rx="2.5" ry="3" fill="%231E293B"/><ellipse cx="67" cy="47" rx="2.5" ry="3" fill="%231E293B"/><path d="M55 56 Q60 60 65 56" stroke="%23B45309" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M24 106 C24 82 40 76 60 76 C80 76 96 82 96 106 Z" fill="url(%23g)"/><path d="M52 76 L60 88 L68 76 Z" fill="%23FFF5EA"/></svg>`;


// Only an in-memory view of records returned by an authorized server request.
let accounts: Partial<RegisterState>[] = [];
export function getSavedAccounts() { return accounts; }
export async function fetchSavedAccounts(): Promise<Partial<RegisterState>[]> {
  const result = await registrationRequest("admin", "GET");
  accounts = result.accounts.map((account: Partial<RegisterState>) => ({
    ...account, dob: account.dob ? new Date(account.dob) : null,
  }));
  return accounts;
}
export async function setStudentVerification(identifier: string, isVerified: boolean) {
  await registrationRequest("admin", "PATCH", { identifier, isVerified });
  return isVerified;
}
