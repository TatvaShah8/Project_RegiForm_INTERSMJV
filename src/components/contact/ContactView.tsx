"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  User,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  LifeBuoy,
  FileQuestion,
} from "lucide-react";
import { TournamentNav } from "@/components/navigation/TournamentNav";
import { SectionErrorBoundary } from "@/components/common/ErrorBoundary";
import {
  createTicket,
  type SupportTicket,
} from "@/lib/support-tickets";
import { useToast } from "@/hooks/use-toast";

export function ContactView() {
  const { toast } = useToast();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [issue, setIssue] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submittedTicket, setSubmittedTicket] = React.useState<SupportTicket | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({ title: "NAME REQUIRED", description: "Please enter your full name." });
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast({ title: "VALID EMAIL REQUIRED", description: "Please enter a valid email address so we can reply." });
      return;
    }
    if (!issue.trim()) {
      toast({ title: "ISSUE REQUIRED", description: "Please describe your question or issue." });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create and save ticket to built-in Admin Helpdesk Dashboard
      const newTicket = await createTicket(name, email, issue);
      setSubmittedTicket(newTicket);

      toast({
        title: "ISSUE LOGGED SUCCESSFULLY!",
        description: `Ticket ${newTicket.id} created. Our committee will review and reply via email.`,
      });

      // Reset fields
      setName("");
      setEmail("");
      setIssue("");
    } catch (err) {
      toast({
        title: "SUBMISSION FAILED",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col" suppressHydrationWarning>
      <TournamentNav activeNav="contact" />

      <main className="fest-scroll mx-auto w-full max-w-4xl flex-1 px-4 pb-16 md:px-6" suppressHydrationWarning>
        {/* ── Title Header ── */}
        <section className="mb-8 text-center md:mb-10">
          <div className="mb-2 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-fest-orange/30 bg-white/70 px-3.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-fest-orange shadow-xs backdrop-blur-md">
              <LifeBuoy className="h-3.5 w-3.5 text-fest-orange" />
              SMJV YOUTH FESTIVAL 2026 SUPPORT HELPDESK
            </span>
          </div>

          <h1 className="font-display text-3xl uppercase leading-tight tracking-wide text-fest-deep sm:text-5xl">
            CONTACT <span className="fest-gradient-text">US</span>
          </h1>

          <p className="mx-auto mt-2.5 max-w-xl text-sm font-medium leading-relaxed text-fest-deep sm:text-base">
            Have a question regarding matches, schedule, ID passes, or reel submissions? Write your issue below and our organizing committee will reply back to your email.
          </p>
        </section>

        {/* ── Main Form Card or Success Screen ── */}
        <div className="relative mx-auto w-full max-w-xl">
          {/* Ambient Glow */}
          <div className="pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-r from-fest-yellow/20 via-fest-orange/20 to-fest-gold/20 blur-xl" />

          <div className="relative overflow-hidden rounded-3xl border border-white/90 bg-white/80 p-6 shadow-[0_16px_48px_rgba(28,36,56,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl sm:p-8">
            <AnimatePresence mode="wait">
              {submittedTicket ? (
                <motion.div
                  key="success-screen"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="py-4 text-center"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/15 text-green-600 shadow-inner">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>

                  <span className="mt-4 inline-block rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-green-700">
                    ISSUE LOGGED SUCCESSFULLY
                  </span>

                  <h3 className="mt-2 font-display text-2xl uppercase tracking-wide text-fest-deep sm:text-3xl">
                    THANK YOU, {submittedTicket.name}!
                  </h3>

                  <div className="mx-auto mt-4 max-w-sm rounded-2xl border border-fest-orange/25 bg-fest-bg/70 p-4">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-fest-deep">
                      YOUR TICKET REFERENCE NUMBER
                    </span>
                    <p className="mt-0.5 font-mono text-xl font-bold tracking-wider text-fest-orange">
                      {submittedTicket.id}
                    </p>
                    <p className="mt-2 text-xs font-medium text-fest-deep">
                      Reply will be delivered to: <span className="font-semibold text-fest-deep">{submittedTicket.email}</span>
                    </p>
                  </div>

                  <p className="mx-auto mt-4 max-w-md text-sm font-medium leading-relaxed text-fest-deep">
                    Your inquiry has been registered. Our team will review the issue and respond directly to your email address.
                  </p>

                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setSubmittedTicket(null)}
                      className="inline-flex items-center justify-center rounded-xl bg-fest-deep px-6 py-2.5 font-display text-xs uppercase tracking-wider text-fest-yellow shadow-md transition hover:bg-fest-deep/90 active:scale-95"
                    >
                      SUBMIT ANOTHER ISSUE
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="contact-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  {/* Field 1: Name */}
                  <div>
                    <label className="block font-mono text-xs font-bold uppercase tracking-wider text-fest-deep">
                      YOUR FULL NAME <span className="text-fest-orange">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fest-deep/70" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Aarav Mehta"
                        className="w-full rounded-2xl border border-white/85 bg-white/70 py-3 pl-10 pr-4 font-mono text-sm text-fest-deep shadow-inner backdrop-blur-xl placeholder:text-fest-deep/45 focus:border-fest-orange focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Field 2: Email */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block font-mono text-xs font-bold uppercase tracking-wider text-fest-deep">
                        YOUR EMAIL ADDRESS <span className="text-fest-orange">*</span>
                      </label>
                      <span className="font-mono text-xs font-medium text-fest-deep">
                        For receiving our reply
                      </span>
                    </div>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fest-deep/70" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. aarav.mehta@smjv.edu"
                        className="w-full rounded-2xl border border-white/85 bg-white/70 py-3 pl-10 pr-4 font-mono text-sm text-fest-deep shadow-inner backdrop-blur-xl placeholder:text-fest-deep/45 focus:border-fest-orange focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Field 3: Issue */}
                  <div>
                    <label className="block font-mono text-xs font-bold uppercase tracking-wider text-fest-deep">
                      DESCRIBE YOUR ISSUE / COMPLAINT <span className="text-fest-orange">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <textarea
                        required
                        rows={4}
                        value={issue}
                        onChange={(e) => setIssue(e.target.value)}
                        placeholder="Explain your issue, query, or complaint in detail..."
                        className="w-full rounded-2xl border border-white/85 bg-white/70 p-3.5 font-mono text-sm text-fest-deep shadow-inner backdrop-blur-xl placeholder:text-fest-deep/45 focus:border-fest-orange focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fest-yellow to-fest-orange py-3.5 font-display text-sm uppercase tracking-wider text-fest-ink shadow-md shadow-fest-orange/30 transition hover:brightness-110 active:scale-95 disabled:opacity-60"
                    >
                      <Send className="h-4 w-4" />
                      <span>{isSubmitting ? "LOGGING ISSUE..." : "SUBMIT ISSUE & SEND EMAIL"}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
