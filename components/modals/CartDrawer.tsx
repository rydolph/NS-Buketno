"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { formatPrice } from "@/lib/mock-data";
import { Field } from "@/components/ui";
import type { CartItem } from "@/types/shop";
import { useEffect, useState } from "react";

type CartDrawerProps = {
  open: boolean;
  cart: CartItem[];
  total: number;
  onClose: () => void;
  onCheckout: () => void;
  onEdit: (item: CartItem) => void;
  onQuantity: (id: string, direction: 1 | -1) => void;
  onRemove: (id: string) => void;
};

export function CartDrawer({ open, cart, total, onClose, onCheckout, onEdit, onQuantity, onRemove }: CartDrawerProps) {
  const [promo, setPromo] = useState("");
  const discount = promo.trim().toUpperCase() === "BUKET10" ? Math.round(total * 0.1) : 0;

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
          className="fixed inset-0 z-40 bg-ink/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.aside
            aria-label="Корзина"
            className="ml-auto flex h-full min-h-0 w-full flex-col bg-cream shadow-soft will-change-transform sm:max-w-md"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-wine/10 p-4 sm:p-5">
              <h2 className="font-serif text-3xl text-ink">Корзина</h2>
              <button
                aria-label="Закрыть корзину"
                className="grid size-10 place-items-center rounded-full hover:bg-rose/15 focus:outline-none focus:ring-2 focus:ring-wine/30"
                onClick={onClose}
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
              {cart.length ? (
                <div className="grid gap-4">
                  {cart.map((item) => (
                    <article
                      className="grid cursor-pointer grid-cols-[72px_1fr] gap-3 rounded-[8px] bg-white p-3 transition hover:bg-rose/10 focus-within:ring-2 focus-within:ring-wine/20 sm:grid-cols-[84px_1fr]"
                      key={item.id}
                      onClick={() => onEdit(item)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onEdit(item);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <img alt={item.title} className="size-[72px] rounded-[8px] object-cover sm:size-20" decoding="async" loading="lazy" src={item.image} />
                      <div className="grid gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-ink">{item.title}</h3>
                            <p className="text-sm text-wine">{formatPrice(item.price)}</p>
                          </div>
                          <button
                            aria-label={`Удалить ${item.title}`}
                            className="text-ink/45 hover:text-wine"
                            onClick={(event) => {
                              event.stopPropagation();
                              onRemove(item.id);
                            }}
                            type="button"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                        <p className="line-clamp-2 text-xs leading-5 text-ink/55">{item.meta.join(" · ")}</p>
                        <div className="flex w-fit items-center rounded-full bg-milk p-1">
                          <button aria-label="Уменьшить" className="grid size-8 place-items-center rounded-full bg-white" onClick={(event) => { event.stopPropagation(); onQuantity(item.id, -1); }} type="button">
                            <Minus size={14} />
                          </button>
                          <span className="w-9 text-center text-sm">{item.quantity}</span>
                          <button aria-label="Увеличить" className="grid size-8 place-items-center rounded-full bg-wine text-white" onClick={(event) => { event.stopPropagation(); onQuantity(item.id, 1); }} type="button">
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="grid h-full place-items-center rounded-[8px] bg-white p-8 text-center">
                  <div>
                    <p className="font-serif text-3xl text-ink">Корзина пуста</p>
                    <p className="mt-2 text-sm text-ink/60">Добавьте букет из каталога или соберите авторский.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="shrink-0 grid gap-3 border-t border-wine/10 bg-cream p-4 sm:gap-4 sm:p-5">
              <Field label="Промокод" onChange={setPromo} placeholder="Попробуйте BUKET10" value={promo} />
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between text-ink/65">
                  <span>Товары</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-ink/65">
                  <span>Скидка</span>
                  <span>{formatPrice(discount)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-ink">
                  <span>Итого</span>
                  <span>{formatPrice(total - discount)}</span>
                </div>
              </div>
              <button
                className="h-12 w-full rounded-[8px] bg-wine px-4 text-sm font-semibold text-white shadow-petal transition hover:bg-[#69233a] focus:outline-none focus:ring-2 focus:ring-wine/35 disabled:cursor-not-allowed disabled:opacity-55"
                disabled={!cart.length}
                onClick={onCheckout}
                type="button"
              >
                Оформить заказ
              </button>
              <button
                className="h-12 w-full rounded-[8px] border border-wine/15 bg-white px-4 text-sm font-semibold text-ink transition hover:bg-rose/15 focus:outline-none focus:ring-2 focus:ring-wine/30"
                onClick={onClose}
                type="button"
              >
                Продолжить покупки
              </button>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
