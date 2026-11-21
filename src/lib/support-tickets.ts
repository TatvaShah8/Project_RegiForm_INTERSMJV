import { registrationRequest } from "./registration-api";
// SMJV Youth Festival 2026 - Support & Issue Tickets System

export interface SupportTicket {
  id: string;
  name: string;
  email: string;
  issue: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
  adminNotes?: string;
  repliedAt?: string;
}

export const ADMIN_SUPPORT_EMAIL = "inter.smjv.vadodara@gmail.com";

export async function getClientTickets(): Promise<SupportTicket[]> {
  return (await registrationRequest("support", "GET")).tickets;
}
export async function createTicket(name: string, email: string, issue: string): Promise<SupportTicket> {
  const response = await fetch("/api/registration/support", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, issue }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Could not save ticket");
  return result.ticket;
}
export async function updateTicketStatus(id: string, status: SupportTicket["status"], adminNotes?: string): Promise<SupportTicket[]> {
  await registrationRequest("support", "PATCH", { id, status, adminNotes });
  return getClientTickets();
}
export async function deleteTicket(id: string): Promise<SupportTicket[]> {
  await registrationRequest("support", "DELETE", { id });
  return getClientTickets();
}

export function generateMailtoReplyUrl(ticket: SupportTicket): string {
  const subject = encodeURIComponent(`Re: [SMJV Youth Festival 2026 Support #${ticket.id}] Helpdesk Resolution`);
  const body = encodeURIComponent(
    `Hello ${ticket.name},\n\nThank you for reaching out to the SMJV Youth Festival 2026 Organizing Committee.\n\nRegarding your issue:\n"${ticket.issue}"\n\n[Type your resolution / response here]\n\nWarm regards,\nSMJV Youth Festival 2026 Organizing Committee\nVadodara Host Branch\nEmail: ${ADMIN_SUPPORT_EMAIL}`
  );
  return `mailto:${ticket.email}?subject=${subject}&body=${body}`;
}
