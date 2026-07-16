export type ProductType = "bouquet" | "flowers";

export type BouquetCategory = "Розы" | "Пионы" | "Сезонные" | "Авторские" | "Премиум";

export type Bouquet = {
  id: string;
  slug: string;
  title: string;
  type: ProductType;
  category: BouquetCategory;
  flowerType: string;
  occasion: string;
  palette: string;
  description: string;
  composition: string[];
  ingredients?: Array<{ productId: string; quantity: number }>;
  price: number;
  stock?: number;
  image: string;
  stemOptions?: number[];
  packages: Array<{ label: string; price: number }>;
  reviews: Review[];
  tags: string[];
};

export type InventoryDelivery = {
  id: string;
  productId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  priceInputMode: "unit" | "total";
  date: string;
  note: string;
};

export type PromoCode = {
  id: string;
  code: string;
  discount: number;
  expiresAt: string;
  usageLimit: number;
  used: number;
  active: boolean;
  description: string;
};

export type FlowerStem = {
  id: string;
  name: string;
  color: string;
  image: string;
  price: number;
  note: string;
};

export type Addon = {
  id: string;
  name: string;
  price: number;
};

export type Packaging = {
  id: string;
  name: string;
  price: number;
};

export type Review = {
  id: string;
  bouquetId: string;
  author: string;
  rating: number;
  text: string;
  date: string;
};

export type CartItem = {
  id: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  meta: string[];
  bouquetId?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "seller";
  addresses: string[];
  favorites: string[];
  reviews: Review[];
  orders: Order[];
};

export type ChatMessage = {
  id: string;
  orderId: string;
  authorRole: "customer" | "seller";
  authorName: string;
  text: string;
  image?: string;
  date: string;
};

export type ChatThread = {
  id: string;
  orderId: string;
  messages: ChatMessage[];
};

export type Order = {
  id: string;
  customerEmail?: string;
  date: string;
  status: "Завершен" | "В доставке" | "Ожидает оплаты";
  items: CartItem[];
  total: number;
  deliveryAddress: string;
  chat: ChatThread;
};

export type CookieSettings = {
  required: true;
  analytics: boolean;
  marketing: boolean;
};

export type CatalogFilters = {
  productType: "all" | ProductType;
  category: "Все" | BouquetCategory;
  flowerType: string;
  occasion: string;
  palette: string;
  minPrice: number;
  maxPrice: number;
  premiumOnly: boolean;
  withReviews: boolean;
};
