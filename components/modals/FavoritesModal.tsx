"use client";

import { Heart, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/mock-data";
import { Modal, PrimaryButton } from "@/components/ui";
import type { Bouquet } from "@/types/shop";

type FavoritesModalProps = {
  open: boolean;
  products: Bouquet[];
  favoriteIds: string[];
  onClose: () => void;
  onAdd: (bouquet: Bouquet) => void;
  onOpen: (bouquet: Bouquet) => void;
  onToggle: (bouquet: Bouquet) => void;
};

export function FavoritesModal({ open, products, favoriteIds, onClose, onAdd, onOpen, onToggle }: FavoritesModalProps) {
  const items = products.filter((bouquet) => favoriteIds.includes(bouquet.id));

  return (
    <Modal open={open} title="Избранное" onClose={onClose} wide>
      <div className="grid gap-3 p-4 min-[520px]:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:p-6">
        {items.length ? (
          items.map((item) => (
            <article className="overflow-hidden rounded-[8px] bg-white shadow-soft" key={item.id}>
              <div className="relative aspect-[4/5]">
                <img alt={item.title} className="size-full object-cover" decoding="async" loading="lazy" src={item.image} />
                <button
                  aria-label={`Открыть ${item.title}`}
                  className="absolute inset-0 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-wine/30"
                  onClick={() => onOpen(item)}
                  type="button"
                />
                <button
                  aria-label="Убрать из избранного"
                  className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-cream/90 text-wine"
                  onClick={() => onToggle(item)}
                  type="button"
                >
                  <Heart size={17} fill="currentColor" />
                </button>
              </div>
              <div className="grid gap-3 p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate font-serif text-xl text-ink sm:text-2xl" title={item.title}>{item.title}</h3>
                  <strong className="text-sm text-wine">{formatPrice(item.price)}</strong>
                </div>
                <PrimaryButton onClick={() => onAdd(item)}>
                  <ShoppingBag size={16} />
                  В корзину
                </PrimaryButton>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[8px] bg-white p-8 text-center sm:col-span-2 lg:col-span-3">
            <p className="font-serif text-3xl text-ink">Пока пусто</p>
            <p className="mt-2 text-sm text-ink/60">Нажимайте сердечко на карточках каталога, чтобы сохранить товары здесь.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
