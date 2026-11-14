"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Inbox,
  Mail,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  ExternalLink,
  Trash2,
  Send,
  ArrowLeft,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  FileText,
  Lock,
  Key,
} from "lucide-react";
import {
  type SupportTicket,
  getClientTickets,
  updateTicketStatus,
  deleteTicket,
  generateMailtoReplyUrl,
  ADMIN_SUPPORT_EMAIL,
} from "@/lib/support-tickets";
import { useToast } from "@/hooks/use-toast";
import { SectionErrorBoundary } from "@/components/common/ErrorBoundary";

export function AdminSupportDashboard() {
  const { toast } = useToast();
  const [tickets, setTickets] = React.useState<SupportTicket[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "OPEN" | "IN_PROGRESS" | "RESOLVED">("ALL");
  const [selectedTicket, setSelectedTicket] = React.useState<SupportTicket | null>(null);
  const [adminNoteInput, setAdminNoteInput] = React.useState("");
  const [mounted, setMounted] = React.useState(false);

  // Simple passkey lock for privacy (can be unlocked instantly)
  const [isAuthenticated, setIsAuthenticated] = React.useState(true);
  const [enteredPasskey, setEnteredPasskey] = React.useState("");
  const [passkeyError, setPasskeyError] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setTickets(getClientTickets());
  }, []);

  const refreshTickets = () => {
    const list = getClientTickets();
    setTickets(list);
    if (selectedTicket) {
      const refreshedSelected = list.find((t) => t.id === selectedTicket.id) || null;
      setSelectedTicket(refreshedSelected);
    }
    toast({
      title: "INBOX REFRESHED",
      description: "Fetched the latest support complaints.",
    });
  };

  const handleStatusChange = (ticketId: string, newStatus: "OPEN" | "IN_PROGRESS" | "RESOLVED") => {
    const updated = updateTicketStatus(ticketId, newStatus, adminNoteInput || undefined);
    setTickets(updated);
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(updated.find((t) => t.id === ticketId) || null);
    }
    toast({
      title: "STATUS UPDATED",
      description: `Ticket ${ticketId} marked as ${newStatus.replace("_", " ")}.`,
    });
  };

  const handleDelete = (ticketId: string) => {
    if (confirm(`Are you sure you want to delete ticket ${ticketId}?`)) {
      const updated = deleteTicket(ticketId);
      setTickets(updated);
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(null);
      }
      toast({
        title: "TICKET REMOVED",
        description: `Ticket ${ticketId} has been deleted.`,
      });
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.issue.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const inProgressCount = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED").length;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  if (!mounted) return null;

  return (
    <SectionErrorBoundary name="Admin Support Dashboard">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
        {/* ── Top Header Navigation ── */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/80 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="flex items-center gap-1.5 rounded-xl border border-white/80 bg-white/70 px-3.5 py-1.5 font-mono text-xs font-bold text-fest-label shadow-xs transition hover:border-fest-orange/50 hover:bg-white hover:text-fest-deep"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>BACK TO CONTACT US</span>
            </Link>
            <span className="rounded-full bg-fest-orange/15 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-fest-orange">
              ORGANIZER HELPDESK
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshTickets}
              className="flex items-center gap-1.5 rounded-xl border border-white/80 bg-white/70 px-3.5 py-1.5 font-mono text-xs font-bold text-fest-deep shadow-xs transition hover:bg-white active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5 text-fest-orange" />
              <span>REFRESH INBOX</span>
            </button>
            <Link
              href="/"
              className="flex items-center gap-1 rounded-xl bg-fest-deep px-3.5 py-1.5 font-display text-xs uppercase tracking-wider text-fest-yellow shadow-xs transition hover:bg-fest-deep/90"
            >
              <span>HOME</span>
            </Link>
          </div>
        </div>

        {/* ── Dashboard Title & Stats ── */}
        <div className="mb-8">
          <h1 className="font-display text-3xl uppercase tracking-wide text-fest-deep sm:text-4xl">
            COMPLAINTS & ISSUES <span className="fest-gradient-text">HELPDESK</span>
          </h1>
          <p className="mt-1 text-sm text-fest-label">
            Review incoming student queries and complaints. Reply directly to any student via email with pre-filled ticket details.
          </p>

          {/* Stat Cards */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
            <div className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur-xl">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-fest-label">
                TOTAL COMPLAINTS
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold text-fest-deep">{totalCount}</span>
                <Inbox className="h-4 w-4 text-fest-label" />
              </div>
            </div>

            <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-white/80 p-4 shadow-sm backdrop-blur-xl">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-700">
                PENDING / OPEN
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold text-amber-600">{openCount}</span>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-500/10 to-white/80 p-4 shadow-sm backdrop-blur-xl">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-blue-700">
                IN PROGRESS
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold text-blue-600">{inProgressCount}</span>
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
            </div>

            <div className="rounded-2xl border border-green-500/40 bg-gradient-to-br from-green-500/10 to-white/80 p-4 shadow-sm backdrop-blur-xl">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-green-700">
                RESOLVED
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold text-green-600">{resolvedCount}</span>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Search & Filter Controls ── */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fest-label" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, email, ticket ID..."
              className="w-full rounded-2xl border border-white/80 bg-white/75 py-2.5 pl-10 pr-4 font-mono text-xs text-fest-deep shadow-xs backdrop-blur-xl placeholder:text-fest-label/60 focus:border-fest-orange focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-white/80 bg-white/60 p-1 shadow-xs backdrop-blur-xl">
            {(["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-xl px-3 py-1 font-mono text-[11px] font-bold tracking-wider transition ${
                  statusFilter === st
                    ? "bg-fest-deep text-fest-yellow shadow-xs"
                    : "text-fest-label hover:text-fest-deep"
                }`}
              >
                {st === "IN_PROGRESS" ? "IN PROGRESS" : st}
              </button>
            ))}
          </div>
        </div>

        {/* ── Two Column Layout: Ticket List & Detail Preview ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Tickets List (7 cols) */}
          <div className="space-y-3 lg:col-span-7">
            {filteredTickets.length === 0 ? (
              <div className="rounded-3xl border border-white/80 bg-white/70 p-8 text-center shadow-xs backdrop-blur-xl">
                <Inbox className="mx-auto h-12 w-12 text-fest-label/50" />
                <h3 className="mt-3 font-display text-lg uppercase tracking-wide text-fest-deep">
                  NO COMPLAINTS FOUND
                </h3>
                <p className="mt-1 text-xs text-fest-label">
                  {searchQuery || statusFilter !== "ALL"
                    ? "Try clearing your search or filter."
                    : "Inbox is clean. No active issues submitted yet."}
                </p>
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isSelected = selectedTicket?.id === ticket.id;
                return (
                  <div
                    key={ticket.id}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setAdminNoteInput(ticket.adminNotes || "");
                    }}
                    className={`cursor-pointer rounded-2xl border p-4 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 ${
                      isSelected
                        ? "border-fest-orange bg-white shadow-md shadow-fest-orange/10"
                        : "border-white/85 bg-white/70 hover:border-fest-orange/40 hover:bg-white/90"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-fest-orange">
                            {ticket.id}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${
                              ticket.status === "OPEN"
                                ? "bg-amber-500/15 text-amber-700"
                                : ticket.status === "IN_PROGRESS"
                                ? "bg-blue-500/15 text-blue-700"
                                : "bg-green-500/15 text-green-700"
                            }`}
                          >
                            {ticket.status.replace("_", " ")}
                          </span>
                        </div>
                        <h4 className="mt-1 font-display text-base tracking-wide text-fest-deep">
                          {ticket.name}
                        </h4>
                        <p className="font-mono text-xs text-fest-label">{ticket.email}</p>
                      </div>

                      <span className="shrink-0 font-mono text-[10px] text-fest-label">
                        {formatDate(ticket.createdAt)}
                      </span>
                    </div>

                    <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-fest-label/90">
                      {ticket.issue}
                    </p>

                    <div className="mt-3 flex items-center justify-between border-t border-fest-orange/10 pt-2.5">
                      <span className="font-mono text-[10px] text-fest-label">
                        Click to review & reply
                      </span>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <a
                          href={generateMailtoReplyUrl(ticket)}
                          className="inline-flex items-center gap-1 rounded-lg bg-fest-deep px-2.5 py-1 font-display text-[10px] uppercase tracking-wider text-fest-yellow shadow-xs transition hover:bg-fest-deep/90"
                          title="Open mail client to reply"
                        >
                          <Mail className="h-3 w-3" />
                          <span>REPLY EMAIL</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleDelete(ticket.id)}
                          className="rounded-lg p-1 text-fest-label transition hover:bg-red-50 hover:text-red-600"
                          title="Delete ticket"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Ticket Inspection & Direct Email Reply Panel (5 cols) */}
          <div className="lg:col-span-5">
            {selectedTicket ? (
              <div className="sticky top-20 rounded-3xl border border-white/90 bg-white/80 p-5 shadow-[0_12px_36px_rgba(28,36,56,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl sm:p-6">
                <div className="flex items-start justify-between border-b border-fest-orange/15 pb-4">
                  <div>
                    <span className="font-mono text-xs font-bold text-fest-orange">
                      {selectedTicket.id}
                    </span>
                    <h3 className="mt-0.5 font-display text-xl uppercase tracking-wide text-fest-deep">
                      {selectedTicket.name}
                    </h3>
                    <p className="font-mono text-xs text-fest-label">{selectedTicket.email}</p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                      selectedTicket.status === "OPEN"
                        ? "bg-amber-500/15 text-amber-700"
                        : selectedTicket.status === "IN_PROGRESS"
                        ? "bg-blue-500/15 text-blue-700"
                        : "bg-green-500/15 text-green-700"
                    }`}
                  >
                    {selectedTicket.status.replace("_", " ")}
                  </span>
                </div>

                {/* Complaint Body */}
                <div className="mt-4">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-fest-label">
                    STUDENT ISSUE DESCRIPTION:
                  </span>
                  <div className="mt-1.5 rounded-2xl border border-white/80 bg-white/70 p-3.5 text-xs sm:text-sm leading-relaxed text-fest-deep shadow-inner whitespace-pre-wrap">
                    {selectedTicket.issue}
                  </div>
                  <span className="mt-1 block font-mono text-[10px] text-fest-label">
                    Logged: {formatDate(selectedTicket.createdAt)}
                  </span>
                </div>

                {/* Direct Email Reply Button (Primary User Requirement) */}
                <div className="mt-6">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-fest-label">
                    DIRECT EMAIL RESOLUTION:
                  </span>
                  <a
                    href={generateMailtoReplyUrl(selectedTicket)}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fest-yellow to-fest-orange py-3 font-display text-xs uppercase tracking-wider text-fest-ink shadow-md shadow-fest-orange/25 transition hover:brightness-110 active:scale-95"
                  >
                    <Mail className="h-4 w-4" />
                    <span>REPLY DIRECTLY TO STUDENT EMAIL</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <p className="mt-1.5 text-center font-mono text-[10px] text-fest-label">
                    Opens your email client with student recipient & pre-filled ticket context
                  </p>
                </div>

                {/* Status Toggle & Notes */}
                <div className="mt-6 border-t border-fest-orange/15 pt-4">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-fest-label">
                    UPDATE TICKET STATUS:
                  </span>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedTicket.id, "OPEN")}
                      className={`rounded-xl border py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition ${
                        selectedTicket.status === "OPEN"
                          ? "border-amber-500 bg-amber-500 text-white"
                          : "border-white/80 bg-white/70 text-fest-label hover:border-amber-400"
                      }`}
                    >
                      OPEN
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedTicket.id, "IN_PROGRESS")}
                      className={`rounded-xl border py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition ${
                        selectedTicket.status === "IN_PROGRESS"
                          ? "border-blue-500 bg-blue-500 text-white"
                          : "border-white/80 bg-white/70 text-fest-label hover:border-blue-400"
                      }`}
                    >
                      IN PROGRESS
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedTicket.id, "RESOLVED")}
                      className={`rounded-xl border py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition ${
                        selectedTicket.status === "RESOLVED"
                          ? "border-green-600 bg-green-600 text-white"
                          : "border-white/80 bg-white/70 text-fest-label hover:border-green-400"
                      }`}
                    >
                      RESOLVED
                    </button>
                  </div>

                  {/* Internal Admin Note */}
                  <div className="mt-4">
                    <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-fest-label">
                      RESOLUTION / INTERNAL NOTES:
                    </label>
                    <textarea
                      rows={2}
                      value={adminNoteInput}
                      onChange={(e) => setAdminNoteInput(e.target.value)}
                      placeholder="Add an internal note or resolution summary..."
                      className="mt-1 w-full rounded-xl border border-white/80 bg-white/70 p-2.5 font-mono text-xs text-fest-deep shadow-inner placeholder:text-fest-label/60 focus:border-fest-orange focus:bg-white focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedTicket.id, selectedTicket.status)}
                      className="mt-2 inline-flex items-center gap-1 rounded-xl bg-fest-deep px-3 py-1.5 font-display text-[10px] uppercase tracking-wider text-fest-yellow shadow-xs transition hover:bg-fest-deep/90 active:scale-95"
                    >
                      <FileText className="h-3 w-3" />
                      <span>SAVE NOTES</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-white/80 bg-white/60 p-8 text-center shadow-xs backdrop-blur-xl">
                <FileText className="mx-auto h-10 w-10 text-fest-label/50" />
                <h4 className="mt-2 font-display text-sm uppercase tracking-wide text-fest-deep">
                  SELECT A TICKET
                </h4>
                <p className="mt-1 text-xs text-fest-label">
                  Click on any complaint on the left to inspect details and reply directly via email.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </SectionErrorBoundary>
  );
}
