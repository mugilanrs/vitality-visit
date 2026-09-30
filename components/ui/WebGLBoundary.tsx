"use client";

import React from "react";

/**
 * PHASE 6 — graceful WebGL fallback.
 *
 * If the R3F canvas throws (WebGL unavailable, asset failure, mobile
 * limitation), we render a static fallback with the campus name and a
 * short message instead of a blank page.
 */

type State = { error: boolean };

export default class WebGLBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { error: false };

  static getDerivedStateFromError(): State {
    return { error: true };
  }

  componentDidCatch(err: unknown) {
    // eslint-disable-next-line no-console
    console.error("[campus] WebGL error boundary caught:", err);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{
            background:
              "linear-gradient(180deg, #edf2f8 0%, #e4ebf1 55%, #dbe2e8 100%)",
          }}
        >
          <div className="max-w-md p-8 text-center">
            <div className="text-[10px] uppercase tracking-[0.42em] text-slate-500">
              Vitality
            </div>
            <div className="mt-2 text-4xl font-extralight uppercase tracking-[0.18em] text-slate-900">
              Campus
            </div>
            <p className="mt-6 text-sm leading-relaxed text-slate-600">
              The interactive campus needs WebGL to render. Try opening this
              page in an updated desktop browser or enable hardware
              acceleration.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
