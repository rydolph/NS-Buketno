"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
  fullScreen?: boolean;
};

export function Modal({ open, title, onClose, children, wide, fullScreen }: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          aria-modal="true"
          className={`fixed inset-0 z-50 grid bg-ink/45 ${
            fullScreen ? "place-items-stretch p-0" : "place-items-end p-0 sm:place-items-center sm:p-6"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="dialog"
          onMouseDown={onClose}
        >
          <motion.div
            className={`flex w-full flex-col overflow-hidden bg-cream shadow-soft outline-none will-change-transform ${
              fullScreen
                ? "h-dvh max-h-none rounded-none sm:h-dvh sm:max-h-none sm:max-w-none sm:rounded-none"
                : `max-h-[96vh] rounded-t-[8px] sm:max-h-[92vh] sm:rounded-[8px] ${
                    wide ? "sm:max-w-6xl" : "sm:max-w-xl"
                  }`
            }`}
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 18, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onMouseDown={(event) => event.stopPropagation()}
            tabIndex={-1}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-wine/10 bg-cream px-4 py-3 sm:px-6 sm:py-4">
              <h2 className="truncate pr-4 font-serif text-2xl text-ink">{title}</h2>
              <button
                aria-label="Закрыть"
                className="grid size-10 place-items-center rounded-full text-ink transition hover:bg-rose/15 focus:outline-none focus:ring-2 focus:ring-wine/30"
                onClick={onClose}
                type="button"
              >
                <X size={20} />
              </button>
            </div>
            <div
              className={
                fullScreen
                  ? "min-h-0 flex-1 overflow-y-auto"
                  : "max-h-[calc(96vh-65px)] overflow-y-auto sm:max-h-[calc(92vh-73px)]"
              }
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function PillButton({
  children,
  active,
  onClick,
  ariaLabel
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className={`rounded-full px-4 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-wine/30 ${
        active ? "bg-wine text-white shadow-petal" : "bg-white/70 text-ink hover:bg-rose/15"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full bg-wine px-3 py-2 text-[12px] font-semibold leading-tight text-white shadow-petal transition hover:bg-[#844b5f] focus:outline-none focus:ring-2 focus:ring-wine/35 disabled:cursor-not-allowed disabled:opacity-55 sm:min-h-11 sm:gap-2 sm:px-5 sm:text-sm"
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  type = "button",
  disabled
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-wine/15 bg-white/70 px-3 py-2 text-[12px] font-semibold leading-tight text-ink transition hover:bg-rose/15 focus:outline-none focus:ring-2 focus:ring-wine/30 disabled:cursor-not-allowed disabled:opacity-55 sm:min-h-11 sm:gap-2 sm:px-5 sm:text-sm"
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-ink">
      {label}
      <input
        className="h-12 rounded-[8px] border border-wine/10 bg-white/75 px-4 text-sm outline-none transition focus:border-wine/35 focus:ring-4 focus:ring-rose/15"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

export function Textarea({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-ink">
      {label}
      <textarea
        className="min-h-24 rounded-[8px] border border-wine/10 bg-white/75 px-4 py-3 text-sm outline-none transition focus:border-wine/35 focus:ring-4 focus:ring-rose/15"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}
