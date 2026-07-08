"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ShoppingBag, Star } from "lucide-react";
import { formatPrice } from "@/lib/mock-data";
import { Modal, PrimaryButton, SecondaryButton } from "@/components/ui";
import type { Bouquet, CartItem, Review } from "@/types/shop";

type ProductModalProps = {
  bouquet: Bouquet | null;
  editingItem?: CartItem | null;
  userReviews: Review[];
  onClose: () => void;
  onAdd: (item: CartItem) => void;
  onBuy: (item: CartItem) => void;
};

export function ProductModal({
  bouquet,
  editingItem,
  userReviews,
  onClose,
  onAdd,
  onBuy
}: ProductModalProps) {
  const [pack, setPack] = useState(0);
  const [stemOption, setStemOption] = useState(0);

  useEffect(() => {
    if (!bouquet) {
      return;
    }

    if (!editingItem) {
      setPack(0);
      setStemOption(0);
      return;
    }

    const nextPack = bouquet.packages.findIndex((option) => editingItem.meta.includes(option.label));
    setPack(nextPack >= 0 ? nextPack : 0);

    if (bouquet.stemOptions) {
      const nextStem = bouquet.stemOptions.findIndex((option) =>
        editingItem.meta.some((line) => line.includes(String(option)))
      );
      setStemOption(nextStem >= 0 ? nextStem : 0);
    }
  }, [bouquet, editingItem]);

  const price = useMemo(() => {
    if (!bouquet) {
      return 0;
    }

    const stems = bouquet.stemOptions?.[stemOption];
    const firstStemOption = bouquet.stemOptions?.[0];
    const flowersPrice = stems && firstStemOption ? Math.round((bouquet.price / firstStemOption) * stems) : bouquet.price;
    return flowersPrice + bouquet.packages[pack].price;
  }, [bouquet, pack, stemOption]);

  if (!bouquet) {
    return null;
  }

  const item: CartItem = {
    id: `${bouquet.id}-${stemOption}-${pack}`,
    bouquetId: bouquet.id,
    title: bouquet.title,
    image: bouquet.image,
    price,
    quantity: editingItem?.quantity || 1,
    meta: [
      bouquet.type === "flowers" && bouquet.stemOptions ? `${bouquet.stemOptions[stemOption]} стеблей` : "Готовый букет",
      bouquet.packages[pack].label
    ]
  };

  const reviews = [...bouquet.reviews, ...userReviews.filter((review) => review.bouquetId === bouquet.id)];

  return (
    <Modal open={Boolean(bouquet)} title={bouquet.title} onClose={onClose} wide>
      <div className="grid gap-4 p-4 lg:grid-cols-[0.95fr_1.05fr] lg:gap-6 lg:p-6">
        <div className="overflow-hidden rounded-[8px] bg-milk">
          <img alt={bouquet.title} className="h-72 w-full object-cover sm:h-96 lg:h-full lg:min-h-[420px]" decoding="async" fetchPriority="high" src={bouquet.image} />
        </div>

        <div className="grid gap-4 sm:gap-5">
          <div>
            <p className="mb-2 text-sm uppercase text-wine/70">
              {bouquet.type === "bouquet" ? "Готовый букет" : "Цветы"} · {bouquet.category}
            </p>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h3 className="font-serif text-3xl text-ink sm:text-4xl">{bouquet.title}</h3>
              <strong className="text-2xl text-wine">{formatPrice(price)}</strong>
            </div>
            <p className="mt-3 leading-7 text-ink/68">{bouquet.description}</p>
          </div>

          <div className="rounded-[8px] bg-milk p-4">
            <p className="mb-2 text-sm font-semibold text-ink">Состав</p>
            <div className="flex flex-wrap gap-2">
              {bouquet.composition.map((item) => (
                <span className="rounded-full bg-white px-3 py-1 text-sm text-ink/70" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className={`grid gap-4 ${bouquet.type === "flowers" ? "md:grid-cols-2" : ""}`}>
            {bouquet.type === "flowers" && bouquet.stemOptions ? (
              <fieldset className="grid gap-2">
                <legend className="text-sm font-semibold text-ink">Количество цветов</legend>
                <div className="grid grid-cols-3 gap-2">
                  {bouquet.stemOptions.map((option, index) => (
                  <button
                    className={`rounded-[8px] border px-3 py-3 text-sm transition ${stemOption === index ? "border-wine bg-wine text-white" : "border-wine/10 bg-white text-ink"}`}
                    key={option}
                    onClick={() => setStemOption(index)}
                    type="button"
                  >
                    {option}
                  </button>
                  ))}
                </div>
              </fieldset>
            ) : null}
            <fieldset className="grid gap-2">
              <legend className="text-sm font-semibold text-ink">Упаковка</legend>
              <div className="grid gap-2">
                {bouquet.packages.map((option, index) => (
                  <button
                    className={`rounded-[8px] border px-3 py-2 text-left text-sm transition ${pack === index ? "border-wine bg-wine text-white" : "border-wine/10 bg-white text-ink"}`}
                    key={option.label}
                    onClick={() => setPack(index)}
                    type="button"
                  >
                    {option.label} · {formatPrice(option.price)}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="grid gap-2 sm:flex-row md:flex">
            <PrimaryButton onClick={() => onAdd(item)}>
              <ShoppingBag size={17} />
              {editingItem ? "Сохранить изменения" : "Добавить в корзину"}
            </PrimaryButton>
            <SecondaryButton onClick={() => onBuy(item)}>
              <CalendarDays size={17} />
              Купить сейчас
            </SecondaryButton>
          </div>

          <section className="grid gap-4 border-t border-wine/10 pt-5">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-serif text-2xl text-ink">Отзывы</h4>
              <span className="text-sm text-ink/55">{reviews.length || "нет отзывов"}</span>
            </div>
            {reviews.length ? (
              <div className="grid gap-3">
                {reviews.map((review) => (
                  <article className="rounded-[8px] bg-white p-4" key={review.id}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <strong className="text-sm text-ink">{review.author}</strong>
                      <span className="flex items-center gap-1 text-sm text-wine">
                        <Star size={15} fill="currentColor" /> {review.rating}
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-ink/68">{review.text}</p>
                    <time className="mt-2 block text-xs text-ink/45">{review.date}</time>
                  </article>
                ))}
              </div>
            ) : (
              <p className="rounded-[8px] bg-white p-4 text-sm text-ink/60">На этот букет пока нет отзывов.</p>
            )}
          </section>
        </div>
      </div>
    </Modal>
  );
}
