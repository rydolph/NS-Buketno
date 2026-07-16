"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BadgePercent, Boxes, MessageCircle, PackagePlus, Pencil, Plus, Power, Trash2, Truck, Wand2 } from "lucide-react";
import { categories, flowerTypes, formatPrice, occasions, palettes } from "@/lib/mock-data";
import { Field, Modal, PrimaryButton, SecondaryButton, Textarea } from "@/components/ui";
import type { Bouquet, BouquetCategory, InventoryDelivery, Order, ProductType, PromoCode } from "@/types/shop";

type SellerModalProps = {
  open: boolean;
  products: Bouquet[];
  deliveries: InventoryDelivery[];
  promoCodes: PromoCode[];
  orders: Order[];
  onClose: () => void;
  onAddProduct: (product: Bouquet) => void;
  onUpdateProduct: (id: string, patch: Partial<Bouquet>) => void;
  onReceiveDelivery: (payload: { productId: string; quantity: number; purchasePrice: number; priceInputMode: "unit" | "total"; note: string }) => void;
  onCreatePromoCode: (promo: Omit<PromoCode, "id" | "used">) => void;
  onTogglePromoCode: (id: string) => void;
  onChat: (order: Order) => void;
};

type ProductDraft = {
  title: string;
  type: ProductType;
  category: BouquetCategory;
  flowerType: string;
  occasion: string;
  palette: string;
  description: string;
  composition: string;
  ingredients: Array<{ productId: string; quantity: string }>;
  price: string;
  stock: string;
  image: string;
  tags: string;
};

const tabs = ["Остатки", "Поставки", "Товары", "Промокоды", "Чаты"] as const;
const defaultImage = "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=85";
const defaultPackages = [
  { label: "Матовая калька", price: 0 },
  { label: "Шелковая бумага", price: 450 },
  { label: "Премиум-коробка", price: 1200 }
];

const emptyDraft = (): ProductDraft => ({
  title: "",
  type: "bouquet",
  category: categories[1] as BouquetCategory,
  flowerType: flowerTypes[1],
  occasion: occasions[1],
  palette: palettes[1],
  description: "",
  composition: "",
  ingredients: [],
  price: "5000",
  stock: "0",
  image: defaultImage,
  tags: ""
});

const toDraft = (product: Bouquet): ProductDraft => ({
  title: product.title,
  type: product.type,
  category: product.category,
  flowerType: product.flowerType,
  occasion: product.occasion,
  palette: product.palette,
  description: product.description,
  composition: product.composition.join(", "),
  ingredients: product.ingredients?.map((ingredient) => ({
    productId: ingredient.productId,
    quantity: String(ingredient.quantity)
  })) || [],
  price: String(product.price),
  stock: String(product.stock || 0),
  image: product.image,
  tags: product.tags.join(", ")
});

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-z0-9а-я]+/gi, "-")
    .replace(/^-+|-+$/g, "");

const generatePromoCode = () => {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  const pick = (source: string, count: number) =>
    Array.from({ length: count }, () => source[Math.floor(Math.random() * source.length)]).join("");

  return `FLOWER-${pick(letters, 3)}${pick(digits, 2)}`;
};

const bouquetAvailability = (product: Bouquet, products: Bouquet[]) => {
  if (product.type !== "bouquet") {
    return product.stock || 0;
  }

  const ingredients = product.ingredients || [];
  if (!ingredients.length) {
    return 0;
  }

  const capacity = ingredients.reduce((available, ingredient) => {
    const flower = products.find((item) => item.id === ingredient.productId);
    const flowerStock = flower?.stock || 0;
    return Math.min(available, Math.floor(flowerStock / Math.max(1, ingredient.quantity)));
  }, Number.POSITIVE_INFINITY);

  return Math.min(product.stock || 0, capacity);
};

const bouquetCapacity = (product: Bouquet, products: Bouquet[]) => {
  if (product.type !== "bouquet") {
    return product.stock || 0;
  }

  const ingredients = product.ingredients || [];
  if (!ingredients.length) {
    return 0;
  }

  return ingredientCapacity(ingredients, products);
};

const ingredientCapacity = (ingredients: Array<{ productId: string; quantity: number }>, products: Bouquet[]) => {
  if (!ingredients.length) {
    return 0;
  }

  return ingredients.reduce((available, ingredient) => {
    const flower = products.find((item) => item.id === ingredient.productId);
    const flowerStock = flower?.stock || 0;
    return Math.min(available, Math.floor(flowerStock / Math.max(1, ingredient.quantity)));
  }, Number.POSITIVE_INFINITY);
};

export function SellerModal({
  open,
  products,
  deliveries,
  promoCodes,
  orders,
  onClose,
  onAddProduct,
  onUpdateProduct,
  onReceiveDelivery,
  onCreatePromoCode,
  onTogglePromoCode,
  onChat
}: SellerModalProps) {
  const [tab, setTab] = useState<(typeof tabs)[number]>(tabs[0]);
  const activePromos = promoCodes.filter((promo) => promo.active).length;
  const openChats = orders.filter((order) => order.chat?.messages.length).length;

  return (
    <Modal open={open} title="Личный кабинет продавца" onClose={onClose} wide>
      <div className="grid gap-4 p-4 lg:grid-cols-[250px_1fr] lg:gap-5 lg:p-6">
        <aside className="scrollbar-none flex gap-2 overflow-x-auto pb-1 lg:grid lg:content-start lg:overflow-visible lg:pb-0">
          {tabs.map((item) => (
            <button
              className={`inline-flex shrink-0 items-center gap-2 rounded-[8px] px-4 py-3 text-left text-sm transition ${tab === item ? "bg-wine text-white" : "bg-white text-ink hover:bg-rose/15"}`}
              key={item}
              onClick={() => setTab(item)}
              type="button"
            >
              {item === "Остатки" ? <Boxes size={16} /> : null}
              {item === "Поставки" ? <Truck size={16} /> : null}
              {item === "Товары" ? <PackagePlus size={16} /> : null}
              {item === "Промокоды" ? <BadgePercent size={16} /> : null}
              {item === "Чаты" ? <MessageCircle size={16} /> : null}
              {item}
            </button>
          ))}

          <div className="hidden rounded-[8px] bg-white p-4 text-sm leading-6 text-ink/65 lg:block">
            <strong className="block text-ink">Сводка</strong>
            {products.length} товаров, {activePromos} активных промокодов, {openChats} чатов по заказам.
          </div>
        </aside>

        <AnimatePresence mode="wait">
          <motion.section
            animate={{ opacity: 1, y: 0 }}
            className="min-h-[420px] rounded-[8px] bg-milk p-4 sm:p-5"
            exit={{ opacity: 0, y: 8 }}
            initial={{ opacity: 0, y: 8 }}
            key={tab}
            transition={{ duration: 0.18 }}
          >
            {tab === "Остатки" ? <Stock products={products} /> : null}
            {tab === "Поставки" ? <Deliveries products={products} deliveries={deliveries} onReceive={onReceiveDelivery} /> : null}
            {tab === "Товары" ? <Products products={products} onAdd={onAddProduct} onUpdate={onUpdateProduct} /> : null}
            {tab === "Промокоды" ? (
              <Promos promoCodes={promoCodes} onCreate={onCreatePromoCode} onToggle={onTogglePromoCode} />
            ) : null}
            {tab === "Чаты" ? <SellerChats orders={orders} onChat={onChat} /> : null}
          </motion.section>
        </AnimatePresence>
      </div>
    </Modal>
  );
}

function Stock({ products }: { products: Bouquet[] }) {
  const riskyProducts = products.filter((product) => bouquetAvailability(product, products) <= 5);
  const emptyProducts = products.filter((product) => bouquetAvailability(product, products) <= 0);
  const missingToMinimum = riskyProducts.reduce((sum, product) => sum + Math.max(0, 8 - bouquetAvailability(product, products)), 0);
  const riskyGroups = Array.from(
    riskyProducts.reduce((groups, product) => {
      const groupName = product.type === "bouquet" ? "Букеты" : product.flowerType;
      const current = groups.get(groupName) || { count: 0, missing: 0 };
      groups.set(groupName, {
        count: current.count + 1,
        missing: current.missing + Math.max(0, 8 - bouquetAvailability(product, products))
      });
      return groups;
    }, new Map<string, { count: number; missing: number }>())
  ).sort(([, first], [, second]) => second.missing - first.missing);
  const sortedProducts = [...products].sort((first, second) => {
    const firstStock = bouquetAvailability(first, products);
    const secondStock = bouquetAvailability(second, products);
    const firstRank = firstStock <= 0 ? 0 : firstStock <= 5 ? 1 : 2;
    const secondRank = secondStock <= 0 ? 0 : secondStock <= 5 ? 1 : 2;

    if (firstRank !== secondRank) {
      return firstRank - secondRank;
    }

    return firstStock - secondStock;
  });

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Риск дефицита" value={`${riskyProducts.length} товаров`} />
        <Metric label="Без остатка" value={`${emptyProducts.length} товаров`} />
        <Metric label="Довести до минимума" value={`${missingToMinimum} шт.`} />
      </div>
      {riskyGroups.length ? (
        <details className="rounded-[8px] bg-white p-4 text-sm leading-6 text-ink/65">
          <summary className="cursor-pointer font-semibold text-ink">
            Внимание требуют {riskyGroups.length} групп. Минимальный рабочий остаток принят как 8 шт. на товар.
          </summary>
          <div className="mt-3 grid gap-2">
            {riskyGroups.map(([group, value]) => (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-[8px] bg-milk px-3 py-2" key={group}>
                <span>{group}</span>
                <span className="text-ink/55">{value.count} товаров · довести +{value.missing} шт.</span>
              </div>
            ))}
          </div>
        </details>
      ) : null}

      <div className="overflow-hidden rounded-[8px] bg-white">
        {sortedProducts.map((product) => {
          const stock = bouquetAvailability(product, products);
          const capacity = bouquetCapacity(product, products);
          const tone = stock <= 0 ? "text-wine" : stock <= 5 ? "text-[#9a6b18]" : "text-sage";

          return (
            <article className="grid gap-3 border-b border-wine/10 p-4 last:border-b-0 md:grid-cols-[72px_1fr_auto]" key={product.id}>
              <img alt={product.title} className="size-[72px] rounded-[8px] object-cover" decoding="async" loading="lazy" src={product.image} />
              <div>
                <h3 className="font-semibold text-ink">{product.title}</h3>
                <p className="text-sm text-ink/55">
                  {product.type === "bouquet" ? `Букет · остаток ${product.stock || 0} шт. · максимум по составу ${capacity} шт.` : `${product.flowerType} · ${formatPrice(product.price)}`}
                </p>
              </div>
              <strong className={`self-center text-sm ${tone}`}>
                {product.type === "bouquet" ? `доступно ${stock} шт.` : `${stock} шт.`}
              </strong>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Deliveries({
  products,
  deliveries,
  onReceive
}: {
  products: Bouquet[];
  deliveries: InventoryDelivery[];
  onReceive: (payload: { productId: string; quantity: number; purchasePrice: number; priceInputMode: "unit" | "total"; note: string }) => void;
}) {
  const flowerProducts = products.filter((product) => product.type === "flowers");
  const [productId, setProductId] = useState(flowerProducts[0]?.id || "");
  const [quantity, setQuantity] = useState("10");
  const [priceInputMode, setPriceInputMode] = useState<"unit" | "total">("unit");
  const [purchasePrice, setPurchasePrice] = useState("250");
  const [note, setNote] = useState("");
  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const normalizedQuantity = Math.max(1, Number(quantity) || 1);
  const normalizedPrice = Math.max(0, Number(purchasePrice) || 0);
  const unitCost = priceInputMode === "unit" ? normalizedPrice : normalizedPrice / normalizedQuantity;
  const totalCost = priceInputMode === "total" ? normalizedPrice : normalizedPrice * normalizedQuantity;

  useEffect(() => {
    if (!productId && flowerProducts[0]) {
      setProductId(flowerProducts[0].id);
    }
  }, [flowerProducts, productId]);

  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <form
        className="grid content-start gap-4 rounded-[8px] bg-white p-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!productId) {
            return;
          }
          onReceive({ productId, quantity: Number(quantity), purchasePrice: Number(purchasePrice), priceInputMode, note });
          setQuantity("10");
          setPurchasePrice("250");
          setPriceInputMode("unit");
          setNote("");
        }}
      >
        <h3 className="font-serif text-3xl text-ink">Новая поставка</h3>
        {flowerProducts.length ? (
          <Select label="Цветок" onChange={setProductId} value={productId} values={flowerProducts.map((product) => ({ label: product.title, value: product.id }))} />
        ) : (
          <p className="rounded-[8px] bg-rose/15 p-4 text-sm text-wine">
            Для поставки сначала создайте товар с типом “Цветы”.
          </p>
        )}
        <Field label="Количество" onChange={setQuantity} required type="number" value={quantity} />
        <Select
          label="Как указана закупочная цена"
          onChange={(value) => setPriceInputMode(value as "unit" | "total")}
          value={priceInputMode}
          values={[
            { label: "За штуку", value: "unit" },
            { label: "За поставку целиком", value: "total" }
          ]}
        />
        <Field
          label={priceInputMode === "unit" ? "Закупочная цена за штуку" : "Закупочная цена за поставку"}
          onChange={setPurchasePrice}
          required
          type="number"
          value={purchasePrice}
        />
        <div className="rounded-[8px] bg-milk p-3 text-sm leading-6 text-ink/65">
          За 1 цветок: {formatPrice(unitCost)} · всего закуп: {formatPrice(totalCost)}
        </div>
        <Textarea label="Комментарий" onChange={setNote} placeholder="Например: утренний привоз с базы" value={note} />
        <PrimaryButton type="submit" disabled={!productId}>
          <Truck size={17} />
          Оприходовать
        </PrimaryButton>
      </form>

      <div className="grid content-start gap-3">
        <h3 className="font-serif text-3xl text-ink">История поставок</h3>
        {deliveries.length ? (
          deliveries.map((delivery) => {
            const product = productById.get(delivery.productId);

            return (
              <article className="rounded-[8px] bg-white p-4" key={delivery.id}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-ink">{product?.title || "Товар удален"}</h4>
                    <p className="text-sm text-ink/55">
                      {delivery.date} · {formatPrice(delivery.unitCost)} за шт. · всего {formatPrice(delivery.totalCost)}
                      {delivery.note ? ` · ${delivery.note}` : ""}
                    </p>
                  </div>
                  <strong className="text-sage">+{delivery.quantity} шт.</strong>
                </div>
              </article>
            );
          })
        ) : (
          <p className="rounded-[8px] bg-white p-5 text-sm text-ink/60">Поставок пока нет.</p>
        )}
      </div>
    </div>
  );
}

function Products({
  products,
  onAdd,
  onUpdate
}: {
  products: Bouquet[];
  onAdd: (product: Bouquet) => void;
  onUpdate: (id: string, patch: Partial<Bouquet>) => void;
}) {
  const [editingId, setEditingId] = useState(products[0]?.id || "");
  const [draft, setDraft] = useState<ProductDraft>(() => (products[0] ? toDraft(products[0]) : emptyDraft()));
  const editingProduct = products.find((product) => product.id === editingId);

  const startNew = () => {
    setEditingId("");
    setDraft(emptyDraft());
  };

  const startEdit = (id: string) => {
    const product = products.find((item) => item.id === id);

    if (product) {
      setEditingId(id);
      setDraft(toDraft(product));
    }
  };

  const updateDraft = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
      <div className="grid content-start gap-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-serif text-3xl text-ink">Товары</h3>
          <SecondaryButton onClick={startNew}>
            <Plus size={16} />
            Новый
          </SecondaryButton>
        </div>
        <div className="grid gap-2">
          {products.map((product) => (
            <button
              className={`grid grid-cols-[56px_1fr_auto] items-center gap-3 rounded-[8px] p-3 text-left transition ${editingId === product.id ? "bg-wine text-white" : "bg-white text-ink hover:bg-rose/15"}`}
              key={product.id}
              onClick={() => startEdit(product.id)}
              type="button"
            >
              <img alt={product.title} className="size-14 rounded-[8px] object-cover" decoding="async" loading="lazy" src={product.image} />
              <span className="min-w-0">
                <strong className="block truncate">{product.title}</strong>
                <span className={`text-sm ${editingId === product.id ? "text-white/75" : "text-ink/55"}`}>{formatPrice(product.price)}</span>
              </span>
              <Pencil size={16} />
            </button>
          ))}
        </div>
      </div>

      <ProductForm
        draft={draft}
        editingProduct={editingProduct}
        products={products}
        onChange={updateDraft}
        onSubmit={() => {
          const product = draftToProduct(draft, products, editingProduct);

          if (editingProduct) {
            onUpdate(editingProduct.id, product);
          } else {
            onAdd(product);
            setEditingId(product.id);
          }
        }}
      />
    </div>
  );
}

function ProductForm({
  draft,
  editingProduct,
  products,
  onChange,
  onSubmit
}: {
  draft: ProductDraft;
  editingProduct?: Bouquet;
  products: Bouquet[];
  onChange: <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) => void;
  onSubmit: () => void;
}) {
  const flowerOptions = products.filter((product) => product.type === "flowers");
  const draftCapacity = draft.type === "bouquet"
    ? ingredientCapacity(
        draft.ingredients.map((ingredient) => ({
          productId: ingredient.productId,
          quantity: Math.max(1, Math.round(Number(ingredient.quantity) || 1))
        })),
        products
      )
    : 0;

  return (
    <form
      className="grid gap-4 rounded-[8px] bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <h3 className="font-serif text-3xl text-ink">{editingProduct ? "Изменить товар" : "Новый товар"}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Название" onChange={(value) => onChange("title", value)} required value={draft.title} />
        <Field label="Цена" onChange={(value) => onChange("price", value)} required type="number" value={draft.price} />
        <Field label={draft.type === "bouquet" ? "Остаток букетов" : "Остаток"} onChange={(value) => onChange("stock", value)} required type="number" value={draft.stock} />
        {draft.type === "bouquet" ? (
          <p className="text-sm text-ink/55 sm:col-span-2">
            Максимум по текущему складу цветов: {draftCapacity} шт. При сохранении большее значение будет ограничено.
          </p>
        ) : null}
        <Select
          label="Тип"
          onChange={(value) => onChange("type", value as ProductType)}
          value={draft.type}
          values={[
            { label: "Букет", value: "bouquet" },
            { label: "Цветы", value: "flowers" }
          ]}
        />
        <Select label="Категория" onChange={(value) => onChange("category", value as BouquetCategory)} value={draft.category} values={categories.slice(1).map((item) => ({ label: item, value: item }))} />
        {draft.type === "flowers" ? (
          <Select label="Тип цветов" onChange={(value) => onChange("flowerType", value)} value={draft.flowerType} values={flowerTypes.slice(1).map((item) => ({ label: item, value: item }))} />
        ) : null}
        <Select label="Повод" onChange={(value) => onChange("occasion", value)} value={draft.occasion} values={occasions.slice(1).map((item) => ({ label: item, value: item }))} />
        <Select label="Гамма" onChange={(value) => onChange("palette", value)} value={draft.palette} values={palettes.slice(1).map((item) => ({ label: item, value: item }))} />
      </div>
      <Field label="Ссылка на фото" onChange={(value) => onChange("image", value)} required value={draft.image} />
      <Textarea label="Описание" onChange={(value) => onChange("description", value)} value={draft.description} />
      {draft.type === "bouquet" ? (
        <div className="grid gap-3 rounded-[8px] bg-milk p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="font-semibold text-ink">Состав букета со склада</h4>
              <p className="text-sm text-ink/55">Эти цветы будут списываться при продаже букета.</p>
            </div>
            <SecondaryButton
              onClick={() => {
                const firstFlower = flowerOptions[0];
                if (firstFlower) {
                  onChange("ingredients", [...draft.ingredients, { productId: firstFlower.id, quantity: "1" }]);
                }
              }}
              disabled={!flowerOptions.length}
            >
              <Plus size={16} />
              Добавить цветок
            </SecondaryButton>
          </div>
          {draft.ingredients.length ? (
            <div className="grid gap-2">
              {draft.ingredients.map((ingredient, index) => (
                <div className="grid gap-2 rounded-[8px] bg-white p-3 sm:grid-cols-[1fr_120px_auto]" key={`${ingredient.productId}-${index}`}>
                  <Select
                    label="Цветок"
                    onChange={(value) =>
                      onChange(
                        "ingredients",
                        draft.ingredients.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, productId: value } : item
                        )
                      )
                    }
                    value={ingredient.productId}
                    values={flowerOptions.map((product) => ({ label: product.title, value: product.id }))}
                  />
                  <Field
                    label="Штук"
                    onChange={(value) =>
                      onChange(
                        "ingredients",
                        draft.ingredients.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, quantity: value } : item
                        )
                      )
                    }
                    type="number"
                    value={ingredient.quantity}
                  />
                  <button
                    aria-label="Удалить цветок из состава"
                    className="self-end grid size-12 place-items-center rounded-[8px] bg-rose/15 text-wine"
                    onClick={() =>
                      onChange(
                        "ingredients",
                        draft.ingredients.filter((_, itemIndex) => itemIndex !== index)
                      )
                    }
                    type="button"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-[8px] bg-white p-4 text-sm text-ink/60">
              Добавьте цветы в состав, чтобы остаток букета считался по складу цветов.
            </p>
          )}
        </div>
      ) : null}
      <Textarea label="Состав через запятую" onChange={(value) => onChange("composition", value)} value={draft.composition} />
      <Field label="Теги через запятую" onChange={(value) => onChange("tags", value)} value={draft.tags} />
      <PrimaryButton type="submit">
        <PackagePlus size={17} />
        {editingProduct ? "Сохранить изменения" : "Добавить товар"}
      </PrimaryButton>
    </form>
  );
}

function Promos({
  promoCodes,
  onCreate,
  onToggle
}: {
  promoCodes: PromoCode[];
  onCreate: (promo: Omit<PromoCode, "id" | "used">) => void;
  onToggle: (id: string) => void;
}) {
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("10");
  const [expiresAt, setExpiresAt] = useState("2026-12-31");
  const [usageLimit, setUsageLimit] = useState("50");
  const [description, setDescription] = useState("");

  return (
    <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
      <form
        className="grid content-start gap-4 rounded-[8px] bg-white p-4"
        onSubmit={(event) => {
          event.preventDefault();
          onCreate({
            code,
            discount: Number(discount),
            expiresAt,
            usageLimit: Number(usageLimit),
            active: true,
            description
          });
          setCode("");
          setDescription("");
        }}
      >
        <h3 className="font-serif text-3xl text-ink">Новый промокод</h3>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
          <Field label="Код" onChange={setCode} placeholder="SPRING15" required value={code} />
          <SecondaryButton onClick={() => setCode(generatePromoCode())}>
            <Wand2 size={16} />
            Сгенерировать
          </SecondaryButton>
        </div>
        <Field label="Скидка, %" onChange={setDiscount} required type="number" value={discount} />
        <Field label="Действует до" onChange={setExpiresAt} required type="date" value={expiresAt} />
        <Field label="Лимит использований" onChange={setUsageLimit} required type="number" value={usageLimit} />
        <Textarea label="Описание" onChange={setDescription} value={description} />
        <PrimaryButton type="submit">
          <BadgePercent size={17} />
          Выпустить
        </PrimaryButton>
      </form>

      <div className="grid content-start gap-3">
        <h3 className="font-serif text-3xl text-ink">Промокоды</h3>
        {promoCodes.map((promo) => (
          <article className="rounded-[8px] bg-white p-4" key={promo.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-ink">{promo.code}</strong>
                  <span className={`rounded-full px-2 py-1 text-xs ${promo.active ? "bg-sage/15 text-sage" : "bg-ink/10 text-ink/55"}`}>
                    {promo.active ? "Активен" : "Выключен"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink/60">
                  {promo.discount}% · до {promo.expiresAt} · {promo.used}/{promo.usageLimit}
                </p>
                {promo.description ? <p className="mt-2 text-sm text-ink/55">{promo.description}</p> : null}
              </div>
              <SecondaryButton onClick={() => onToggle(promo.id)}>
                <Power size={16} />
                {promo.active ? "Отключить" : "Включить"}
              </SecondaryButton>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function SellerChats({ orders, onChat }: { orders: Order[]; onChat: (order: Order) => void }) {
  const ordersWithChat = orders.filter((order) => order.chat);

  return (
    <div className="grid gap-4">
      <h3 className="font-serif text-3xl text-ink">Чаты по заказам</h3>
      {ordersWithChat.length ? (
        <div className="grid gap-3">
          {ordersWithChat.map((order) => {
            const lastMessage = order.chat.messages.at(-1);

            return (
              <article className="rounded-[8px] bg-white p-4" key={order.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-ink">{order.id}</h4>
                    <p className="mt-1 text-sm text-ink/55">
                      {order.date} · {order.items.map((item) => `${item.title} x${item.quantity}`).join(", ")}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-ink/65">
                      {lastMessage?.text || "В чате пока только фото"}
                    </p>
                  </div>
                  <SecondaryButton onClick={() => onChat(order)}>
                    <MessageCircle size={16} />
                    Открыть
                  </SecondaryButton>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="rounded-[8px] bg-white p-5 text-sm text-ink/60">Чаты появятся после оформления заказов.</p>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] bg-white p-4">
      <p className="text-sm text-ink/55">{label}</p>
      <strong className="mt-1 block text-xl text-ink">{value}</strong>
    </div>
  );
}

function Select({
  label,
  value,
  values,
  onChange
}: {
  label: string;
  value: string;
  values: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-ink">
      {label}
      <select
        className="h-12 rounded-[8px] border border-wine/10 bg-white/75 px-4 text-sm outline-none transition focus:border-wine/35 focus:ring-4 focus:ring-rose/15"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {values.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function draftToProduct(draft: ProductDraft, products: Bouquet[], existing?: Bouquet): Bouquet {
  const title = draft.title.trim() || "Новый букет";
  const slug = slugify(title) || `product-${Date.now()}`;
  const composition = draft.composition
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const tags = draft.tags
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const ingredients = draft.type === "bouquet"
    ? draft.ingredients
        .map((ingredient) => ({
          productId: ingredient.productId,
          quantity: Math.max(1, Math.round(Number(ingredient.quantity) || 1))
        }))
        .filter((ingredient) => Boolean(products.find((product) => product.id === ingredient.productId && product.type === "flowers")))
    : [];
  const ingredientComposition = ingredients.map((ingredient) => {
    const flower = products.find((product) => product.id === ingredient.productId);
    return `${flower?.title || "Цветок"} x${ingredient.quantity}`;
  });
  const requestedStock = Math.max(0, Math.round(Number(draft.stock) || 0));
  const cappedStock = draft.type === "bouquet"
    ? Math.min(requestedStock, ingredientCapacity(ingredients, products))
    : requestedStock;

  return {
    id: existing?.id || `seller-${Date.now()}`,
    slug: existing?.slug || slug,
    title,
    type: draft.type,
    category: draft.category,
    flowerType: draft.type === "bouquet" ? "" : draft.flowerType,
    occasion: draft.occasion,
    palette: draft.palette,
    description: draft.description.trim(),
    composition: composition.length ? composition : ingredientComposition.length ? ingredientComposition : ["Авторская сборка"],
    ingredients: draft.type === "bouquet" ? ingredients : undefined,
    price: Math.max(0, Math.round(Number(draft.price) || 0)),
    stock: cappedStock,
    image: draft.image.trim() || defaultImage,
    stemOptions: draft.type === "flowers" ? existing?.stemOptions || [9, 15, 21] : undefined,
    packages: existing?.packages?.length ? existing.packages : defaultPackages,
    reviews: existing?.reviews || [],
    tags
  };
}
