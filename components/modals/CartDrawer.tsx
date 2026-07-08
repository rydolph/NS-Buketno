"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { formatPrice } from "@/lib/mock-data";
import { Field, PrimaryButton, SecondaryButton } from "@/components/ui";
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
            className="ml-auto flex h-full w-full max-w-md flex-col bg-cream shadow-soft will-change-transform"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-wine/10 p-5">
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

            <div className="flex-1 overflow-y-auto p-5">
              {cart.length ? (
                <div className="grid gap-4">
                  {cart.map((item) => (
                    <article
                      className="grid cursor-pointer grid-cols-[84px_1fr] gap-3 rounded-[8px] bg-white p-3 transition hover:bg-rose/10 focus-within:ring-2 focus-within:ring-wine/20"
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
                      <img alt={item.title} className="size-20 rounded-[8px] object-cover" decoding="async" loading="lazy" src={item.image} />
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

            <div className="grid gap-4 border-t border-wine/10 p-5">
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
              <PrimaryButton disabled={!cart.length} onClick={onCheckout}>Оформить заказ</PrimaryButton>
              <SecondaryButton onClick={onClose}>Продолжить покупки</SecondaryButton>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
