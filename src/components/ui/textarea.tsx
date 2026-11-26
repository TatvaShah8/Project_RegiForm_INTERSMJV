"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { QuillCaretSvg, measureTextareaCaret } from "./quill-caret";

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (value: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(value);
      else (ref as React.MutableRefObject<T | null>).current = value;
    }
  };
}

function Textarea({
  className,
  ref,
  onFocus,
  onBlur,
  onClick,
  onKeyUp,
  onInput,
  onSelect,
  onScroll,
  ...props
}: React.ComponentProps<"textarea">) {
  const areaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [focused, setFocused] = React.useState(false);
  const [writeTick, setWriteTick] = React.useState(0);
  const [caret, setCaret] = React.useState<{ left: number; top: number }>({
    left: 12,
    top: 8,
  });

  const syncCaret = React.useCallback(() => {
    const el = areaRef.current;
    if (!el) return;
    setCaret(measureTextareaCaret(el));
  }, []);

  React.useEffect(() => {
    if (focused) {
      syncCaret();
    }
  }, [focused, props.value, syncCaret]);

  return (
    <div className="relative w-full">
      <textarea
        ref={mergeRefs(areaRef, ref)}
        data-slot="textarea"
        className={cn(
          "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none caret-transparent focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        onFocus={(e) => {
          setFocused(true);
          requestAnimationFrame(syncCaret);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        onClick={(e) => {
          syncCaret();
          onClick?.(e);
        }}
        onKeyUp={(e) => {
          syncCaret();
          onKeyUp?.(e);
        }}
        onInput={(e) => {
          setWriteTick((n) => n + 1);
          syncCaret();
          onInput?.(e);
        }}
        onSelect={(e) => {
          syncCaret();
          onSelect?.(e);
        }}
        onScroll={(e) => {
          syncCaret();
          onScroll?.(e);
        }}
        {...props}
      />
      {focused && !props.readOnly && !props.disabled && (
        <QuillCaretSvg left={caret.left} top={caret.top} writeTick={writeTick} />
      )}
    </div>
  );
}

export { Textarea };
