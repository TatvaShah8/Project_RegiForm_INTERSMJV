"use client";

import * as React from "react";

export function QuillCaretSvg({
  left,
  top,
  writeTick = 0,
}: {
  left: number;
  top: number;
  writeTick?: number;
}) {
  const upperVaneId = React.useId();
  const lowerVaneId = React.useId();
  const shaftId = React.useId();

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute z-10 select-none"
      style={{
        left: `${left}px`,
        top: `${top - 4}px`,
        width: "22px",
        height: "24px",
      }}
    >
      <svg
        key={writeTick}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 36 36"
        className={`h-full w-full drop-shadow-[0_2px_3px_rgba(124,45,18,0.38)]${
          writeTick > 0 ? " fest-quill-caret-write" : ""
        }`}
      >
        <defs>
          {/* Upper sunlit gold-saffron feather vane */}
          <linearGradient id={upperVaneId} x1="10%" y1="90%" x2="90%" y2="10%">
            <stop offset="0%" stopColor="#B45309" />
            <stop offset="40%" stopColor="#E8A317" />
            <stop offset="80%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#FDE68A" />
          </linearGradient>

          {/* Lower deeper saffron-orange feather vane for 3D depth */}
          <linearGradient id={lowerVaneId} x1="10%" y1="90%" x2="90%" y2="10%">
            <stop offset="0%" stopColor="#7C2D12" />
            <stop offset="45%" stopColor="#D97706" />
            <stop offset="85%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          {/* Bright central quill shaft (rachis) */}
          <linearGradient id={shaftId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#431407" />
            <stop offset="18%" stopColor="#FDE68A" />
            <stop offset="60%" stopColor="#FFFBEB" />
            <stop offset="100%" stopColor="#FEF3C7" />
          </linearGradient>
        </defs>

        {/* Upper feather vane with natural notched barbs */}
        <path
          d="M6.2 29.8 C7 24.5 8.5 20.5 11.2 17.5 L12.5 19.2 L12.2 16 C14.5 13.2 17 11 19.8 9.2 L20.4 11.4 L21.2 8.2 C24.5 6.2 28 4.4 33 3.2 C29 9.5 20.5 18 6.2 29.8 Z"
          fill={`url(#${upperVaneId})`}
          stroke="#9A3412"
          strokeWidth="0.65"
          strokeLinejoin="round"
        />

        {/* Lower feather vane with deeper shadow & notched splits */}
        <path
          d="M6.2 29.8 C15 21.5 24 12.5 33 3.2 C31.8 7.5 29.8 11.4 27.4 14.5 L24.6 13.8 L26.5 16.2 C24.4 18.8 21.8 21.2 19 23 L16.5 21.8 L17.8 23.9 C14.5 26 10.6 28 6.2 29.8 Z"
          fill={`url(#${lowerVaneId})`}
          stroke="#7C2D12"
          strokeWidth="0.65"
          strokeLinejoin="round"
        />

        {/* Fine feather barb texture lines */}
        <g
          fill="none"
          stroke="#7C2D12"
          strokeOpacity="0.32"
          strokeWidth="0.55"
          strokeLinecap="round"
        >
          <path d="M13 23 C12.5 20.2 13.2 18 14.4 16.2" />
          <path d="M17.5 18.5 C17.2 15.8 18 13.8 19.4 12.2" />
          <path d="M22.5 13.5 C22.4 11.2 23.2 9.4 24.8 8" />
          <path d="M14.5 22.8 C17.5 22.6 20 21.6 22 20" />
          <path d="M19.5 18 C22.5 17.6 24.8 16.4 26.5 14.6" />
          <path d="M24.2 13.2 C26.6 12.8 28.6 11.8 30 10.2" />
        </g>

        {/* Central quill shaft (rachis) & nib extending to writing point */}
        <path
          d="M2.2 33.8 C4.5 31.5 14.5 21.5 31.5 4.8"
          fill="none"
          stroke="#7C2D12"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        <path
          d="M2.2 33.8 C4.5 31.5 14.5 21.5 31.5 4.8"
          fill="none"
          stroke={`url(#${shaftId})`}
          strokeWidth="1.25"
          strokeLinecap="round"
        />

        {/* Ink-dipped sharp nib point */}
        <path
          d="M2 34 L5.2 31.4 L4.2 30.4 Z"
          fill="#431407"
        />
      </svg>
    </span>
  );
}

let measureCanvas: HTMLCanvasElement | null = null;

export function measureInputCaret(el: HTMLInputElement): { left: number; top: number } {
  const style = window.getComputedStyle(el);
  const padLeft = parseFloat(style.paddingLeft) || 12;
  const padRight = parseFloat(style.paddingRight) || 12;
  const borderLeft = parseFloat(style.borderLeftWidth) || 0;

  const pos = el.selectionStart ?? el.value.length;
  const rawSlice = el.value.slice(0, pos);
  const textSlice = el.type === "password" ? "•".repeat(rawSlice.length) : rawSlice;

  if (!measureCanvas) {
    measureCanvas = document.createElement("canvas");
  }
  const ctx = measureCanvas.getContext("2d");
  let textWidth = 0;
  if (ctx) {
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    textWidth = ctx.measureText(textSlice).width;
  }

  const rawLeft = borderLeft + padLeft + textWidth - el.scrollLeft;
  const maxLeft = el.offsetWidth - padRight;
  const left = Math.max(borderLeft + padLeft, Math.min(rawLeft, maxLeft));
  const top = Math.max(2, (el.offsetHeight - 18) / 2 - 2);
  return { left, top };
}

const MIRROR_PROPS = [
  "direction",
  "boxSizing",
  "width",
  "overflowX",
  "overflowY",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "fontStyle",
  "fontVariant",
  "fontWeight",
  "fontStretch",
  "fontSize",
  "fontSizeAdjust",
  "lineHeight",
  "fontFamily",
  "textAlign",
  "textTransform",
  "textIndent",
  "textDecoration",
  "letterSpacing",
  "wordSpacing",
  "tabSize",
] as const;

export function measureTextareaCaret(el: HTMLTextAreaElement): { left: number; top: number } {
  const style = window.getComputedStyle(el);
  const mirror = document.createElement("div");
  mirror.style.position = "absolute";
  mirror.style.visibility = "hidden";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.wordWrap = "break-word";
  mirror.style.top = "0";
  mirror.style.left = "-9999px";

  for (const prop of MIRROR_PROPS) {
    mirror.style[prop] = style[prop];
  }

  const pos = el.selectionStart ?? el.value.length;
  mirror.textContent = el.value.slice(0, pos);

  const marker = document.createElement("span");
  marker.textContent = "\u200b";
  mirror.appendChild(marker);
  document.body.appendChild(mirror);

  const left = Math.max(4, Math.min(marker.offsetLeft - el.scrollLeft, el.offsetWidth - 16));
  const top = Math.max(2, Math.min(marker.offsetTop - el.scrollTop - 1, el.offsetHeight - 20));
  document.body.removeChild(mirror);
  return { left, top };
}
