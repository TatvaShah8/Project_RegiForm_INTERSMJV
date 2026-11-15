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

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: "SMJV-TK-1001",
    name: "Devam Shah",
    email: "devam.shah@smjv.edu",
    issue: "Need clarification regarding the Table Tennis doubles match timings on 25th December afternoon session.",
    status: "OPEN",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "SMJV-TK-1002",
    name: "Karan Parikh",
    email: "karan.p@smjv.edu",
    issue: "Uploaded the Reel for the Reel Making Competition but want to confirm if the hostel tag was properly captured.",
    status: "RESOLVED",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    adminNotes: "Confirmed and verified from Vadodara hostel media team.",
    repliedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

const LOCAL_STORAGE_KEY = "smjv_support_tickets";

export function getClientTickets(): SupportTicket[] {
  if (typeof window === "undefined") return INITIAL_TICKETS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_TICKETS));
      return INITIAL_TICKETS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_TICKETS;
  } catch {
    return INITIAL_TICKETS;
  }
}

export function saveClientTickets(tickets: SupportTicket[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tickets));
  } catch (e) {
    console.error("Failed to save tickets to localStorage", e);
  }
}

export function createTicket(name: string, email: string, issue: string): SupportTicket {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const newTicket: SupportTicket = {
    id: `SMJV-TK-${randomNum}`,
    name: name.trim(),
    email: email.trim(),
    issue: issue.trim(),
    status: "OPEN",
    createdAt: new Date().toISOString(),
  };

  const existing = getClientTickets();
  const updated = [newTicket, ...existing];
  saveClientTickets(updated);

  return newTicket;
}

export function updateTicketStatus(
  id: string,
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED",
  adminNotes?: string
): SupportTicket[] {
  const existing = getClientTickets();
  const updated = existing.map((t) => {
    if (t.id === id) {
      return {
        ...t,
        status,
        ...(adminNotes !== undefined ? { adminNotes } : {}),
        repliedAt: new Date().toISOString(),
      };
    }
    return t;
  });
  saveClientTickets(updated);
  return updated;
}

export function deleteTicket(id: string): SupportTicket[] {
  const existing = getClientTickets();
  const updated = existing.filter((t) => t.id !== id);
  saveClientTickets(updated);
  return updated;
}

export function generateMailtoReplyUrl(ticket: SupportTicket): string {
  const subject = encodeURIComponent(`Re: [SMJV Youth Festival 2026 Support #${ticket.id}] Helpdesk Resolution`);
  const body = encodeURIComponent(
    `Hello ${ticket.name},\n\nThank you for reaching out to the SMJV Youth Festival 2026 Organizing Committee.\n\nRegarding your issue:\n"${ticket.issue}"\n\n[Type your resolution / response here]\n\nWarm regards,\nSMJV Youth Festival 2026 Organizing Committee\nVadodara Host Branch\nEmail: ${ADMIN_SUPPORT_EMAIL}`
  );
  return `mailto:${ticket.email}?subject=${subject}&body=${body}`;
}
