"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { PrimaryButton, SecondaryButton } from "@/components/ui";
import type { CookieSettings } from "@/types/shop";

type CookieBannerProps = {
  settings: CookieSettings | null;
  onSave: (settings: CookieSettings) => void;
};

export function CookieBanner({ settings, onSave }: CookieBannerProps) {
  const [customize, setCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  return (
    <AnimatePresence>
      {!settings ? (
        <motion.div
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-4xl rounded-[8px] border border-wine/10 bg-cream p-4 shadow-soft sm:p-5"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="font-serif text-2xl text-ink">Cookies</h2>
              <p className="mt-1 text-sm leading-6 text-ink/65">
                Мы используем cookies, чтобы сайт работал корректно, сохранял корзину и помогал улучшать сервис.
              </p>
              {customize ? (
                <div className="mt-4 grid gap-2 text-sm">
                  <label className="flex items-center justify-between rounded-[8px] bg-milk p-3">
                    <span>Обязательные cookies</span>
                    <input checked disabled type="checkbox" />
                  </label>
                  <label className="flex items-center justify-between rounded-[8px] bg-milk p-3">
                    <span>Аналитика</span>
                    <input checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} type="checkbox" />
                  </label>
                  <label className="flex items-center justify-between rounded-[8px] bg-milk p-3">
                    <span>Маркетинг</span>
                    <input checked={marketing} onChange={(event) => setMarketing(event.target.checked)} type="checkbox" />
                  </label>
                </div>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <PrimaryButton onClick={() => onSave({ required: true, analytics: true, marketing: true })}>
                Принять все
              </PrimaryButton>
              <SecondaryButton onClick={() => onSave({ required: true, analytics: false, marketing: false })}>
                Отклонить необязательные
              </SecondaryButton>
              {customize ? (
                <SecondaryButton onClick={() => onSave({ required: true, analytics, marketing })}>Сохранить</SecondaryButton>
              ) : (
                <SecondaryButton onClick={() => setCustomize(true)}>Настроить</SecondaryButton>
              )}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
