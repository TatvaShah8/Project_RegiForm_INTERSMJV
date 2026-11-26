"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { QuillCaretSvg, measureInputCaret } from "./quill-caret";

const NON_CARET_TYPES = new Set([
  "file",
  "date",
  "datetime-local",
  "time",
  "month",
  "week",
  "checkbox",
  "radio",
  "range",
  "color",
  "hidden",
  "submit",
  "button",
  "reset",
]);

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (value: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(value);
      else (ref as React.MutableRefObject<T | null>).current = value;
    }
  };
}

function Input({
  className,
  type,
  ref,
  onFocus,
  onBlur,
  onClick,
  onKeyUp,
  onInput,
  onSelect,
  ...props
}: React.ComponentProps<"input">) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [focused, setFocused] = React.useState(false);
  const [writeTick, setWriteTick] = React.useState(0);
  const [caret, setCaret] = React.useState<{ left: number; top: number }>({
    left: 12,
    top: 8,
  });

  const isTextLike = !type || !NON_CARET_TYPES.has(type);

  const syncCaret = React.useCallback(() => {
    const el = inputRef.current;
    if (!el || !isTextLike) return;
    setCaret(measureInputCaret(el));
  }, [isTextLike]);

  React.useEffect(() => {
    if (focused && isTextLike) {
      syncCaret();
    }
  }, [focused, isTextLike, props.value, syncCaret]);

  if (!isTextLike) {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        onFocus={onFocus}
        onBlur={onBlur}
        onClick={onClick}
        onKeyUp={onKeyUp}
        onInput={onInput}
        onSelect={onSelect}
        {...props}
      />
    );
  }

  return (
    <div className="relative flex w-full items-center">
      <input
        ref={mergeRefs(inputRef, ref)}
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none caret-transparent file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
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
        {...props}
      />
      {focused && !props.readOnly && !props.disabled && (
        <QuillCaretSvg left={caret.left} top={caret.top} writeTick={writeTick} />
      )}
    </div>
  );
}

export { Input };
