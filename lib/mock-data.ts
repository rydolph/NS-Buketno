import type { Addon, Bouquet, FlowerStem, Order, Packaging, User } from "@/types/shop";

export const categories = ["Все", "Розы", "Пионы", "Сезонные", "Авторские", "Премиум"] as const;
export const flowerTypes = ["Все", "Розы", "Пионы", "Лилии", "Орхидеи", "Полевые", "Смешанные"] as const;
export const occasions = ["Все", "День рождения", "Романтика", "Свадьба", "Благодарность", "Дом"] as const;
export const palettes = ["Все", "Розовая", "Белая", "Бордовая", "Зеленая", "Яркая"] as const;

const packages = [
  { label: "Матовая калька", price: 0 },
  { label: "Шелковая бумага", price: 450 },
  { label: "Премиум-коробка", price: 1200 }
];

export const bouquets: Bouquet[] = [
  {
    id: "bq-rose-premium",
    slug: "rose-premium",
    title: "Розовый Премиум",
    type: "bouquet",
    category: "Розы",
    flowerType: "Розы",
    occasion: "Романтика",
    palette: "Розовая",
    description: "Пудровые розы, эвкалипт и шелковая лента для тихого вау-эффекта.",
    composition: ["25 пионовидных роз", "эвкалипт", "матовая калька", "шелковая лента"],
    price: 8200,
    image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=85",
    packages,
    reviews: [
      {
        id: "rv-1",
        bouquetId: "bq-rose-premium",
        author: "Анна",
        rating: 5,
        text: "Букет приехал свежий, очень аккуратно собран. Цвет совпал с фото.",
        date: "2026-06-18"
      }
    ],
    tags: ["хит", "нежный"]
  },
  {
    id: "bq-peony-cloud",
    slug: "peony-cloud",
    title: "Пионовое Облако",
    type: "flowers",
    category: "Пионы",
    flowerType: "Пионы",
    occasion: "Свадьба",
    palette: "Белая",
    description: "Объемный букет из белых и розовых пионов в молочной упаковке.",
    composition: ["17 пионов", "ранункулюсы", "декоративная зелень"],
    price: 9400,
    image: "https://images.unsplash.com/photo-1559563362-c667ba5f5480?auto=format&fit=crop&w=1200&q=85",
    stemOptions: [9, 15, 21],
    packages,
    reviews: [
      {
        id: "rv-2",
        bouquetId: "bq-peony-cloud",
        author: "Мария",
        rating: 5,
        text: "Пахнет невероятно, упаковка выглядит дорого и спокойно.",
        date: "2026-06-24"
      }
    ],
    tags: ["премиум", "ароматный"]
  },
  {
    id: "bq-sage-garden",
    slug: "sage-garden",
    title: "Шалфейный Сад",
    type: "bouquet",
    category: "Сезонные",
    flowerType: "Смешанные",
    occasion: "Дом",
    palette: "Зеленая",
    description: "Садовая композиция с шалфейной зеленью, маттиолой и кремовыми розами.",
    composition: ["кремовые розы", "маттиола", "эвкалипт", "озотамнус"],
    price: 7600,
    image: "https://images.unsplash.com/photo-1487070183336-b863922373d4?auto=format&fit=crop&w=1200&q=85",
    packages,
    reviews: [],
    tags: ["сезонный"]
  },
  {
    id: "bq-bordeaux-evening",
    slug: "bordeaux-evening",
    title: "Бордовый Вечер",
    type: "bouquet",
    category: "Премиум",
    flowerType: "Розы",
    occasion: "Романтика",
    palette: "Бордовая",
    description: "Глубокий бордовый акцент, темные розы и бархатная лента.",
    composition: ["21 бордовая роза", "скабиоза", "эвкалипт", "бархатная лента"],
    price: 11800,
    image: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=1200&q=85",
    packages,
    reviews: [
      {
        id: "rv-3",
        bouquetId: "bq-bordeaux-evening",
        author: "Екатерина",
        rating: 5,
        text: "Очень выразительный букет, подарили на ужине, выглядел безупречно.",
        date: "2026-05-30"
      }
    ],
    tags: ["вечерний", "премиум"]
  },
  {
    id: "bq-milk-lilies",
    slug: "milk-lilies",
    title: "Молочные Лилии",
    type: "flowers",
    category: "Авторские",
    flowerType: "Лилии",
    occasion: "Благодарность",
    palette: "Белая",
    description: "Лилии, эустома и мягкая зелень в светлой авторской сборке.",
    composition: ["лилии", "эустома", "розы", "рускус"],
    price: 6900,
    image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=85",
    stemOptions: [7, 11, 15],
    packages,
    reviews: [],
    tags: ["светлый"]
  },
  {
    id: "bq-blush-morning",
    slug: "blush-morning",
    title: "Румяное Утро",
    type: "bouquet",
    category: "Розы",
    flowerType: "Смешанные",
    occasion: "День рождения",
    palette: "Розовая",
    description: "Легкий утренний букет с розовыми розами и акцентом гортензии.",
    composition: ["розы", "гортензия", "фрезия", "эвкалипт"],
    price: 7200,
    image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=85",
    packages,
    reviews: [
      {
        id: "rv-4",
        bouquetId: "bq-blush-morning",
        author: "Софья",
        rating: 4,
        text: "Красиво, свежо, доставка приехала в выбранный интервал.",
        date: "2026-05-12"
      }
    ],
    tags: ["подарок"]
  },
  {
    id: "bq-orchid-atelier",
    slug: "orchid-atelier",
    title: "Орхидейное Ателье",
    type: "flowers",
    category: "Авторские",
    flowerType: "Орхидеи",
    occasion: "Благодарность",
    palette: "Розовая",
    description: "Архитектурная композиция с орхидеями и минималистичной упаковкой.",
    composition: ["орхидея цимбидиум", "каллы", "лист аспидистры", "шелковая бумага"],
    price: 13200,
    image: "https://images.unsplash.com/photo-1591886960571-74d43a9d4166?auto=format&fit=crop&w=1200&q=85",
    stemOptions: [3, 5, 7],
    packages,
    reviews: [],
    tags: ["дизайнерский"]
  },
  {
    id: "bq-summer-field",
    slug: "summer-field",
    title: "Летнее Поле",
    type: "bouquet",
    category: "Сезонные",
    flowerType: "Полевые",
    occasion: "Дом",
    palette: "Яркая",
    description: "Свободная полевая сборка с ромашками, маттиолой и солнечной фактурой.",
    composition: ["ромашки", "маттиола", "танацетум", "эвкалипт"],
    price: 5400,
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=85",
    packages,
    reviews: [],
    tags: ["легкий", "сезонный"]
  }
];

export const stems: FlowerStem[] = [
  { id: "rose-blush", name: "Пудровая роза", color: "#d99aaa", image: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?auto=format&fit=crop&w=300&q=80", price: 240, note: "нежный объем" },
  { id: "rose-wine", name: "Бордовая роза", color: "#7b2d43", image: "https://images.unsplash.com/photo-1530906622963-8a60586a49c7?auto=format&fit=crop&w=300&q=80", price: 290, note: "глубокий акцент" },
  { id: "peony-white", name: "Белый пион", color: "#f5eee8", image: "https://images.unsplash.com/photo-1559563362-c667ba5f5480?auto=format&fit=crop&w=300&q=80", price: 520, note: "сезонный аромат" },
  { id: "ranunculus", name: "Ранункулюс", color: "#f1b7b0", image: "https://images.unsplash.com/photo-1523694576729-9a4b225cf557?auto=format&fit=crop&w=300&q=80", price: 360, note: "многослойная фактура" },
  { id: "eustoma", name: "Эустома", color: "#efe4fb", image: "https://images.unsplash.com/photo-1562690868-60bbe7293e94?auto=format&fit=crop&w=300&q=80", price: 210, note: "воздушность" },
  { id: "hydrangea", name: "Гортензия", color: "#cad7c4", image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=300&q=80", price: 690, note: "крупный объем" },
  { id: "lily", name: "Лилия", color: "#fff7ea", image: "https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d?auto=format&fit=crop&w=300&q=80", price: 430, note: "изящный силуэт" },
  { id: "orchid", name: "Орхидея", color: "#e9c8d8", image: "https://images.unsplash.com/photo-1591886960571-74d43a9d4166?auto=format&fit=crop&w=300&q=80", price: 780, note: "премиальный штрих" },
  { id: "matthiola", name: "Маттиола", color: "#c7a5c9", image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=300&q=80", price: 260, note: "мягкий аромат" },
  { id: "eucalyptus", name: "Эвкалипт", color: "#8fa58b", image: "https://images.unsplash.com/photo-1515150144380-bca9f1650ed9?auto=format&fit=crop&w=300&q=80", price: 180, note: "шалфейная зелень" }
];

export const constructorPackages: Packaging[] = [
  { id: "kraft", name: "Молочный крафт", price: 350 },
  { id: "silk", name: "Шелковая бумага", price: 650 },
  { id: "box", name: "Премиум-коробка", price: 1600 }
];

export const addons: Addon[] = [
  { id: "card", name: "Открытка", price: 250 },
  { id: "ribbon", name: "Шелковая лента", price: 300 },
  { id: "toy", name: "Мягкая игрушка", price: 1450 },
  { id: "sweets", name: "Макаруны", price: 1200 }
];

export const testOrders: Order[] = [
  {
    id: "LF-2406",
    date: "2026-06-14",
    status: "Завершен",
    deliveryAddress: "Москва, Патриаршие пруды, 12",
    total: 10350,
    items: [
      {
        id: "past-order-1",
        bouquetId: "bq-rose-premium",
        title: "Розовый Премиум",
        image: bouquets[0].image,
        price: 8200,
        quantity: 1,
        meta: ["Размер M", "Шелковая бумага"]
      }
    ]
    ,
    chat: {
      id: "chat-LF-2406",
      orderId: "LF-2406",
      messages: [
        {
          id: "msg-LF-2406-1",
          orderId: "LF-2406",
          authorRole: "seller",
          authorName: "Флорист",
          text: "Здравствуйте! Чат по заказу открыт, сюда можно прислать уточнения или фото.",
          date: "2026-06-14"
        }
      ]
    }
  }
];

export const testUser: User = {
  id: "user-demo",
  name: "Александра",
  email: "demo@ns-buketno.ru",
  phone: "+7 900 555-44-33",
  role: "seller",
  addresses: ["Москва, Патриаршие пруды, 12", "Москва, Остоженка, 7"],
  favorites: ["bq-rose-premium", "bq-orchid-atelier"],
  reviews: [],
  orders: testOrders
};

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0
  }).format(value);
