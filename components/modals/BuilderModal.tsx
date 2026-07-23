"use client";

import { useMemo, useState } from "react";
import { Plus, ShoppingBag } from "lucide-react";
import { addons, constructorPackages, formatPrice, stems } from "@/lib/mock-data";
import { Modal, PrimaryButton } from "@/components/ui";
import type { CartItem } from "@/types/shop";

type BuilderModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (item: CartItem) => void;
};

const wrapPackages = constructorPackages.filter((item) => item.kind === "wrap");

export function BuilderModal({ open, onClose, onAdd }: BuilderModalProps) {
  const [counts, setCounts] = useState<Record<string, number>>({ "rose-blush": 7, eucalyptus: 3 });
  const [packaging, setPackaging] = useState(wrapPackages[0]?.id || "");
  const [selectedPackagingDecorations, setSelectedPackagingDecorations] = useState<string[]>([]);
  const [packagingColors, setPackagingColors] = useState<Record<string, string>>(() =>
    Object.fromEntries(constructorPackages.map((item) => [item.id, item.colors[0]?.id || ""]))
  );
  const [selectedAddons, setSelectedAddons] = useState<string[]>(["card"]);

  const total = useMemo(() => {
    const flowersTotal = stems.reduce((sum, stem) => sum + (counts[stem.id] || 0) * stem.price, 0);
    const packageTotal = constructorPackages
      .filter((item) =>
        item.kind === "wrap" ? item.id === packaging : selectedPackagingDecorations.includes(item.id)
      )
      .reduce((sum, item) => sum + item.price, 0);
    const addonsTotal = addons
      .filter((item) => selectedAddons.includes(item.id))
      .reduce((sum, item) => sum + item.price, 0);
    return flowersTotal + packageTotal + addonsTotal;
  }, [counts, packaging, selectedAddons, selectedPackagingDecorations]);

  const flowerCount = Object.values(counts).reduce((sum, value) => sum + value, 0);

  const addCustomBouquet = () => {
    const chosenFlowers = stems
      .filter((stem) => counts[stem.id])
      .map((stem) => `${stem.name} x${counts[stem.id]}`);
    const chosenPackages = constructorPackages
      .filter((item) =>
        item.kind === "wrap" ? item.id === packaging : selectedPackagingDecorations.includes(item.id)
      )
      .map((item) => {
        const color = item.colors.find((option) => option.id === packagingColors[item.id]);
        return color ? `${item.name}: ${color.name}` : item.name;
      });
    const chosenAddons = addons.filter((item) => selectedAddons.includes(item.id)).map((item) => item.name);

    onAdd({
      id: `custom-${Date.now()}`,
      title: "Авторский букет",
      image: "https://images.unsplash.com/photo-1470509037663-253afd7f0f51?auto=format&fit=crop&w=1200&q=85",
      price: total,
      quantity: 1,
      meta: [...chosenFlowers, ...chosenPackages, ...chosenAddons]
    });
  };

  return (
    <Modal open={open} title="Собрать букет" onClose={onClose} wide>
      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_0.9fr_0.85fr] lg:gap-5 lg:p-6">
        <section className="grid gap-3">
          <h3 className="font-serif text-2xl text-ink">Цветы</h3>
          <div className="grid gap-2">
            {stems.map((stem) => (
              <article className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-[8px] bg-white p-3 min-[430px]:grid-cols-[auto_1fr_auto]" key={stem.id}>
                <div className="relative size-11 overflow-hidden rounded-[8px] border-4 border-cream sm:size-12">
                  <img alt={stem.name} className="size-full object-cover" decoding="async" loading="lazy" src={stem.image} />
                  <span className="absolute bottom-0 right-0 size-4 rounded-full border border-white" style={{ background: stem.color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{stem.name}</p>
                  <p className="text-xs text-ink/55">
                    {stem.note} · {formatPrice(stem.price)}
                  </p>
                </div>
                <div className="col-span-2 flex w-fit items-center rounded-full bg-milk p-1 min-[430px]:col-span-1">
                  <button
                    aria-label={`Уменьшить ${stem.name}`}
                    className="grid size-8 place-items-center rounded-full bg-white text-ink"
                    onClick={() => setCounts((current) => ({ ...current, [stem.id]: Math.max(0, (current[stem.id] || 0) - 1) }))}
                    type="button"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm">{counts[stem.id] || 0}</span>
                  <button
                    aria-label={`Добавить ${stem.name}`}
                    className="grid size-8 place-items-center rounded-full bg-wine text-white"
                    onClick={() => setCounts((current) => ({ ...current, [stem.id]: (current[stem.id] || 0) + 1 }))}
                    type="button"
                  >
                    +
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid content-start gap-5">
          <div className="grid gap-3">
            <h3 className="font-serif text-2xl text-ink">Упаковка</h3>
            {constructorPackages.map((item) => {
              const active =
                item.kind === "wrap"
                  ? packaging === item.id
                  : selectedPackagingDecorations.includes(item.id);
              const selectedColor = item.colors.find((color) => color.id === packagingColors[item.id]);

              return (
                <article
                  className={`overflow-hidden rounded-[8px] border transition ${active ? "border-wine bg-wine text-white" : "border-wine/10 bg-white text-ink"}`}
                  key={item.id}
                >
                  <button
                    aria-pressed={active}
                    className="w-full p-4 text-left"
                    onClick={() => {
                      if (item.kind === "wrap") {
                        setPackaging(item.id);
                        return;
                      }

                      setSelectedPackagingDecorations((current) =>
                        active ? current.filter((id) => id !== item.id) : [...current, item.id]
                      );
                    }}
                    type="button"
                  >
                    <span className="block font-semibold">{item.name}</span>
                    {item.price > 0 ? <span className="text-sm opacity-75">{formatPrice(item.price)}</span> : null}
                  </button>

                  {active ? (
                    <div className="border-t border-white/20 px-4 pb-4 pt-3">
                      <p className="mb-2 text-xs text-white/75">Цвет: {selectedColor?.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {item.colors.map((color) => {
                          const colorActive = color.id === packagingColors[item.id];
                          return (
                            <button
                              aria-label={`${item.name}, цвет ${color.name}`}
                              aria-pressed={colorActive}
                              className={`size-7 rounded-full border-2 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-white ${
                                colorActive
                                  ? "border-white ring-2 ring-white/80 ring-offset-2 ring-offset-wine"
                                  : "border-white/65 hover:scale-110"
                              }`}
                              key={color.id}
                              onClick={() =>
                                setPackagingColors((current) => ({ ...current, [item.id]: color.id }))
                              }
                              style={{ backgroundColor: color.hex }}
                              title={color.name}
                              type="button"
                            />
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          <div className="grid gap-3">
            <h3 className="font-serif text-2xl text-ink">Дополнительно</h3>
            <div className="grid gap-2 min-[420px]:grid-cols-2">
              {addons.map((addon) => {
                const active = selectedAddons.includes(addon.id);
                return (
                  <button
                    className={`rounded-[8px] border p-3 text-left text-sm transition ${active ? "border-wine bg-rose/15 text-wine" : "border-wine/10 bg-white text-ink"}`}
                    key={addon.id}
                    onClick={() =>
                      setSelectedAddons((current) =>
                        active ? current.filter((id) => id !== addon.id) : [...current, addon.id]
                      )
                    }
                    type="button"
                  >
                    <Plus className="mb-2" size={16} />
                    {addon.name}
                    {addon.price > 0 ? (
                      <span className="block text-xs opacity-70">{formatPrice(addon.price)}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="grid content-start gap-4 rounded-[8px] bg-milk p-4">
          <div className="rounded-[8px] bg-white p-4">
            <p className="text-sm text-ink/60">Выбрано цветов</p>
            <p className="font-serif text-4xl text-wine">{flowerCount}</p>
          </div>
          <div className="grid gap-2 rounded-[8px] bg-white p-4">
            {stems.filter((stem) => counts[stem.id]).map((stem) => (
              <div className="flex items-center justify-between gap-3 text-sm" key={stem.id}>
                <span className="flex items-center gap-2 text-ink/70">
                  <img alt={stem.name} className="size-8 rounded-full object-cover" decoding="async" loading="lazy" src={stem.image} />
                  {stem.name}
                </span>
                <strong className="text-ink">x{counts[stem.id]}</strong>
              </div>
            ))}
            {!flowerCount ? <p className="text-sm text-ink/55">Выберите цветы слева.</p> : null}
          </div>
          <div className="rounded-[8px] bg-white p-4">
            <p className="text-sm text-ink/60">Стоимость</p>
            <p className="font-serif text-3xl text-wine">{formatPrice(total)}</p>
          </div>
          <PrimaryButton disabled={flowerCount === 0} onClick={addCustomBouquet}>
            <ShoppingBag size={17} />
            Добавить в корзину
          </PrimaryButton>
        </aside>
      </div>
    </Modal>
  );
}
