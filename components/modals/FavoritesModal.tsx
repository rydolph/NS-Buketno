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
      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 sm:gap-3 sm:p-4 lg:grid-cols-4 lg:p-6">
        {items.length ? (
          items.map((item) => (
            <article className="min-w-0 overflow-hidden rounded-[8px] bg-white shadow-soft" key={item.id}>
              <div className="relative aspect-square overflow-hidden">
                <img alt={item.title} className="size-full object-cover" decoding="async" loading="lazy" src={item.image} />
                <button
                  aria-label={`Открыть ${item.title}`}
                  className="absolute inset-0 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-wine/30"
                  onClick={() => onOpen(item)}
                  type="button"
                />
                <button
                  aria-label="Убрать из избранного"
                  className="absolute right-1.5 top-1.5 grid size-8 place-items-center rounded-full bg-cream/90 text-wine transition hover:bg-white sm:right-2 sm:top-2"
                  onClick={() => onToggle(item)}
                  type="button"
                >
                  <Heart size={17} fill="currentColor" />
                </button>
              </div>
              <div className="grid gap-1.5 p-2 sm:gap-2 sm:p-3">
                <h3
                  className="line-clamp-2 min-h-[2.1rem] break-words font-serif text-base leading-[1.05] text-ink sm:min-h-[2.6rem] sm:text-xl"
                  title={item.title}
                >
                  {item.title}
                </h3>
                <div className="flex items-center justify-between gap-1.5">
                  <strong className="min-w-0 whitespace-nowrap text-[12px] text-wine sm:text-sm">{formatPrice(item.price)}</strong>
                  <PrimaryButton onClick={() => onAdd(item)}>
                    <ShoppingBag className="shrink-0" size={15} />
                    <span className="sr-only min-[430px]:not-sr-only">В корзину</span>
                  </PrimaryButton>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="col-span-2 rounded-[8px] bg-white p-8 text-center sm:col-span-3 lg:col-span-4">
            <p className="font-serif text-3xl text-ink">Пока пусто</p>
            <p className="mt-2 text-sm text-ink/60">Нажимайте сердечко на карточках каталога, чтобы сохранить товары здесь.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
