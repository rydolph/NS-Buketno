"use client";

import { SlidersHorizontal, Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { categories, flowerTypes, formatPrice, occasions, palettes } from "@/lib/mock-data";
import { PrimaryButton } from "@/components/ui";
import type { Bouquet, CatalogFilters } from "@/types/shop";

type CatalogProps = {
  bouquets: Bouquet[];
  filters: CatalogFilters;
  favoriteIds: string[];
  onOpen: (bouquet: Bouquet) => void;
  onAdd: (bouquet: Bouquet) => void;
  onFavorite: (bouquet: Bouquet) => void;
  onFilters: (filters: CatalogFilters) => void;
};

export function Catalog({ bouquets, filters, favoriteIds, onOpen, onAdd, onFavorite, onFilters }: CatalogProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const hasActiveFilters =
    filters.productType !== "all" ||
    filters.category !== "Все" ||
    filters.flowerType !== "Все" ||
    filters.occasion !== "Все" ||
    filters.palette !== "Все" ||
    filters.minPrice !== 0 ||
    filters.maxPrice !== 16000;

  const update = <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) => {
    onFilters({ ...filters, [key]: value });
  };

  const reset = () => {
    onFilters({
      productType: "all",
      category: "Все",
      flowerType: "Все",
      occasion: "Все",
      palette: "Все",
      minPrice: 0,
      maxPrice: 16000,
      premiumOnly: false,
      withReviews: false
    });
  };

  return (
    <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8" id="catalog">
      <div className="grid gap-4 lg:grid-cols-[282px_1fr] lg:items-start">
        <aside className="rounded-[8px] bg-white p-3 shadow-soft sm:p-4 lg:sticky lg:top-24">
          <button
            aria-expanded={mobileFiltersOpen}
            className="flex w-full items-center justify-between gap-3 rounded-[8px] bg-milk px-3 py-2 text-sm font-semibold text-ink lg:hidden"
            onClick={() => setMobileFiltersOpen((value) => !value)}
            type="button"
          >
            <span className="inline-flex items-center gap-2">
              <SlidersHorizontal size={16} />
              Фильтры
            </span>
            <span className="text-xs text-wine">{mobileFiltersOpen ? "Скрыть" : "Показать"}</span>
          </button>

          <div className={`${mobileFiltersOpen ? "mt-3 grid" : "hidden"} gap-4 lg:grid`}>
            <FilterGroup title="Тип товара">
              <Segment
                active={filters.productType === "all"}
                label="Все"
                onClick={() => update("productType", "all")}
              />
              <Segment
                active={filters.productType === "bouquet"}
                label="Букеты"
                onClick={() => update("productType", "bouquet")}
              />
              <Segment
                active={filters.productType === "flowers"}
                label="Цветы"
                onClick={() => update("productType", "flowers")}
              />
              <Segment
                active={filters.productType === "composition"}
                label="Композиции"
                onClick={() => update("productType", "composition")}
              />
            </FilterGroup>

            <FilterSelect label="Категория" value={filters.category} values={categories} onChange={(value) => update("category", value as CatalogFilters["category"])} />
            <FilterSelect label="Тип цветов" value={filters.flowerType} values={flowerTypes} onChange={(value) => update("flowerType", value)} />
            <FilterSelect label="Повод" value={filters.occasion} values={occasions} onChange={(value) => update("occasion", value)} />
            <FilterSelect label="Гамма" value={filters.palette} values={palettes} onChange={(value) => update("palette", value)} />

            <FilterGroup title="Цена">
              <div className="grid grid-cols-2 gap-2">
                <label className="grid gap-1 text-xs text-ink/60">
                  От
                  <input
                    className="h-10 rounded-[8px] border border-wine/10 bg-milk px-3 text-sm text-ink outline-none focus:border-wine/35 focus:ring-4 focus:ring-rose/15"
                    min={0}
                    max={filters.maxPrice}
                    onChange={(event) => update("minPrice", Math.max(0, Number(event.target.value) || 0))}
                    step={500}
                    type="number"
                    value={filters.minPrice}
                  />
                </label>
                <label className="grid gap-1 text-xs text-ink/60">
                  До
                  <input
                    className="h-10 rounded-[8px] border border-wine/10 bg-milk px-3 text-sm text-ink outline-none focus:border-wine/35 focus:ring-4 focus:ring-rose/15"
                    min={filters.minPrice}
                    max={30000}
                    onChange={(event) => update("maxPrice", Math.max(filters.minPrice, Number(event.target.value) || 0))}
                    step={500}
                    type="number"
                    value={filters.maxPrice}
                  />
                </label>
              </div>
              <p className="text-xs text-ink/45">
                {formatPrice(filters.minPrice)} - {formatPrice(filters.maxPrice)}
              </p>
            </FilterGroup>

            {hasActiveFilters ? (
              <button
                aria-label="Сбросить фильтры"
                className="rounded-full bg-milk px-4 py-2 text-sm font-semibold text-wine transition hover:bg-rose/15"
                onClick={reset}
                type="button"
              >
                Сбросить
              </button>
            ) : null}
          </div>
        </aside>

        <section className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4" aria-label="Каталог цветов, букетов и композиций">
          {bouquets.map((bouquet, index) => {
            const favorite = favoriteIds.includes(bouquet.id);

            return (
            <article
              className="catalog-card overflow-hidden rounded-[8px] bg-white shadow-soft"
              key={bouquet.id}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  alt={bouquet.title}
                  className="size-full object-cover"
                  decoding="async"
                  fetchPriority={index < 4 ? "high" : "auto"}
                  loading={index < 4 ? "eager" : "lazy"}
                  src={bouquet.image}
                />
                <button
                  aria-label={`Открыть ${bouquet.title}`}
                  className="absolute inset-0 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-wine/30"
                  onClick={() => onOpen(bouquet)}
                  type="button"
                />
                <button
                  aria-label={favorite ? "Убрать из избранного" : "Добавить в избранное"}
                  className={`absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-cream/90 transition hover:bg-white sm:right-3 sm:top-3 sm:size-9 ${favorite ? "text-wine" : "text-ink/55"}`}
                  onClick={() => onFavorite(bouquet)}
                  type="button"
                >
                  <Heart size={17} fill={favorite ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="grid gap-2 p-2.5 sm:gap-3 sm:p-4">
                <h3 className="truncate whitespace-nowrap font-serif text-[1.05rem] leading-tight text-ink sm:text-[1.34rem]" title={bouquet.title}>{bouquet.title}</h3>
                <div className="flex items-center justify-between gap-2">
                  <strong className="whitespace-nowrap text-[12px] text-wine sm:text-sm">{formatPrice(bouquet.price)}</strong>
                  <PrimaryButton onClick={() => onAdd(bouquet)}>
                  <ShoppingBag size={15} />
                  <span className="hidden min-[430px]:inline">Купить</span>
                  </PrimaryButton>
                </div>
              </div>
            </article>
            );
          })}

          {!bouquets.length ? (
            <div className="rounded-[8px] bg-white p-8 text-center shadow-soft sm:col-span-2 lg:col-span-3 xl:col-span-4">
              <p className="font-serif text-3xl text-ink">Ничего не найдено</p>
              <p className="mt-2 text-sm text-ink/60">Попробуйте убрать часть фильтров или расширить цену.</p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1 text-sm font-semibold text-ink">{title}</legend>
      <div className="grid gap-2">{children}</div>
    </fieldset>
  );
}

function Segment({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      className={`rounded-[8px] px-3 py-2 text-left text-sm transition ${active ? "bg-wine text-white" : "bg-milk text-ink hover:bg-rose/15"}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function FilterSelect({
  label,
  value,
  values,
  onChange
}: {
  label: string;
  value: string;
  values: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink">
      {label}
      <select
        className="h-10 rounded-[8px] border border-wine/10 bg-milk px-3 text-sm font-normal outline-none transition focus:border-wine/35 focus:ring-4 focus:ring-rose/15"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {values.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </label>
  );
}
