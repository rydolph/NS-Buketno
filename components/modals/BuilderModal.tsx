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

export function BuilderModal({ open, onClose, onAdd }: BuilderModalProps) {
  const [counts, setCounts] = useState<Record<string, number>>({ "rose-blush": 7, eucalyptus: 3 });
  const [packaging, setPackaging] = useState(constructorPackages[0].id);
  const [selectedAddons, setSelectedAddons] = useState<string[]>(["card"]);

  const total = useMemo(() => {
    const flowersTotal = stems.reduce((sum, stem) => sum + (counts[stem.id] || 0) * stem.price, 0);
    const packageTotal = constructorPackages.find((item) => item.id === packaging)?.price || 0;
    const addonsTotal = addons
      .filter((item) => selectedAddons.includes(item.id))
      .reduce((sum, item) => sum + item.price, 0);
    return flowersTotal + packageTotal + addonsTotal;
  }, [counts, packaging, selectedAddons]);

  const flowerCount = Object.values(counts).reduce((sum, value) => sum + value, 0);

  const addCustomBouquet = () => {
    const chosenFlowers = stems
      .filter((stem) => counts[stem.id])
      .map((stem) => `${stem.name} x${counts[stem.id]}`);
    const chosenPackage = constructorPackages.find((item) => item.id === packaging);
    const chosenAddons = addons.filter((item) => selectedAddons.includes(item.id)).map((item) => item.name);

    onAdd({
      id: `custom-${Date.now()}`,
      title: "Авторский букет",
      image: "https://images.unsplash.com/photo-1470509037663-253afd7f0f51?auto=format&fit=crop&w=1200&q=85",
      price: total,
      quantity: 1,
      meta: [...chosenFlowers, chosenPackage?.name || "", ...chosenAddons].filter(Boolean)
    });
  };

  return (
    <Modal open={open} title="Собрать букет" onClose={onClose} wide>
      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_0.9fr_0.85fr] lg:p-6">
        <section className="grid gap-3">
          <h3 className="font-serif text-2xl text-ink">Цветы</h3>
          <div className="grid gap-2">
            {stems.map((stem) => (
              <article className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[8px] bg-white p-3" key={stem.id}>
                <div className="relative size-12 overflow-hidden rounded-[8px] border-4 border-cream">
                  <img alt={stem.name} className="size-full object-cover" decoding="async" loading="lazy" src={stem.image} />
                  <span className="absolute bottom-0 right-0 size-4 rounded-full border border-white" style={{ background: stem.color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{stem.name}</p>
                  <p className="text-xs text-ink/55">
                    {stem.note} · {formatPrice(stem.price)}
                  </p>
                </div>
                <div className="flex items-center rounded-full bg-milk p-1">
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
            {constructorPackages.map((item) => (
              <button
                className={`rounded-[8px] border p-4 text-left transition ${packaging === item.id ? "border-wine bg-wine text-white" : "border-wine/10 bg-white text-ink"}`}
                key={item.id}
                onClick={() => setPackaging(item.id)}
                type="button"
              >
                <span className="block font-semibold">{item.name}</span>
                <span className="text-sm opacity-75">{formatPrice(item.price)}</span>
              </button>
            ))}
          </div>

          <div className="grid gap-3">
            <h3 className="font-serif text-2xl text-ink">Дополнительно</h3>
            <div className="grid grid-cols-2 gap-2">
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
                    <span className="block text-xs opacity-70">{formatPrice(addon.price)}</span>
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
