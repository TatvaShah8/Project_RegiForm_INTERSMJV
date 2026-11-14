"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  name?: string;
  fallback?: ReactNode;
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * SectionErrorBoundary — Compartmentalizes UI components so that an unhandled
 * runtime exception in one section only affects that component, keeping the rest
 * of the website, navigation, and other sections 100% interactive and safe.
 */
export class SectionErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `[SectionErrorBoundary] Error in "${this.props.name || "Component"}":`,
      error,
      errorInfo
    );
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="my-4 rounded-2xl border border-fest-orange/35 bg-white/60 p-6 text-center shadow-[0_12px_36px_rgba(217,119,6,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-fest-yellow/20 to-fest-orange/20 text-fest-orange shadow-inner">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h4 className="font-display text-sm uppercase tracking-wide text-fest-deep md:text-base">
            {this.props.name ? `${this.props.name} Temporary Issue` : "Section Temporary Issue"}
          </h4>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-fest-label">
            An unexpected error occurred in this specific component. The rest of the page remains fully functional and unaffected.
          </p>
          {this.state.error?.message && (
            <p className="mx-auto mt-2.5 max-w-md truncate rounded-lg border border-fest-orange/20 bg-fest-orange/5 px-3 py-1 font-mono text-[10px] text-fest-label">
              {this.state.error.message}
            </p>
          )}
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-fest-yellow to-fest-orange px-4 py-2 font-display text-xs uppercase tracking-wider text-fest-ink shadow-md shadow-fest-orange/20 transition hover:brightness-110 active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>RETRY COMPONENT</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
