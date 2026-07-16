"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { bouquets as mockBouquets, testUser } from "@/lib/mock-data";
import { readStorage, writeStorage } from "@/lib/storage";
import type { Bouquet, CartItem, ChatMessage, CookieSettings, InventoryDelivery, Order, PromoCode, Review, User } from "@/types/shop";

const cartKey = (userId: string) => `ns-buketno.cart.${userId}`;
const USER_KEY = "lumiere.user";
const USERS_KEY = "lumiere.users";
const COOKIE_KEY = "lumiere.cookies";
const PRODUCTS_KEY = "lumiere.seller.products";
const DELIVERIES_KEY = "lumiere.seller.deliveries";
const PROMOS_KEY = "lumiere.seller.promos";
const SELLER_ORDERS_KEY = "lumiere.seller.orders";

const withStock = (items: Bouquet[]) =>
  items.map((item, index) => ({
    ...item,
    stock: typeof item.stock === "number" ? item.stock : 12 + index * 3
  }));

const defaultPromos: PromoCode[] = [
  {
    id: "promo-welcome",
    code: "WELCOME10",
    discount: 10,
    expiresAt: "2026-12-31",
    usageLimit: 100,
    used: 18,
    active: true,
    description: "Стартовая скидка для новых клиентов"
  }
];

const createOrderChat = (orderId: string) => ({
  id: `chat-${orderId}`,
  orderId,
  messages: [
    {
      id: `msg-${orderId}-welcome`,
      orderId,
      authorRole: "seller" as const,
      authorName: "Флорист",
      text: "Чат по заказу открыт. Здесь можно уточнить детали и отправить фото.",
      date: new Date().toISOString()
    }
  ]
});

const withChat = (order: Order): Order => ({
  ...order,
  chat: order.chat || createOrderChat(order.id)
});

const withUserDefaults = (nextUser: User | null): User | null =>
  nextUser
    ? {
        ...nextUser,
        role: nextUser.role || (nextUser.email.toLowerCase() === testUser.email.toLowerCase() || nextUser.email.toLowerCase().includes("seller") ? "seller" : "customer"),
        orders: nextUser.orders.map(withChat)
      }
    : null;

const userKey = (email: string) => email.trim().toLowerCase();
const testOrderIds = new Set(testUser.orders.map((order) => order.id));

const readUsers = () => readStorage<Record<string, User>>(USERS_KEY, {});

const writeUserProfile = (nextUser: User) => {
  const users = readUsers();
  writeStorage(USERS_KEY, {
    ...users,
    [userKey(nextUser.email)]: {
      ...nextUser,
      orders: nextUser.orders.map(withChat)
    }
  });
};

const replaceOrderInStoredUser = (email: string | undefined, nextOrder: Order) => {
  if (!email) {
    return;
  }

  const users = readUsers();
  const savedUser = users[userKey(email)];

  if (!savedUser) {
    return;
  }

  writeStorage(USERS_KEY, {
    ...users,
    [userKey(email)]: {
      ...savedUser,
      orders: savedUser.orders.map((order) => (order.id === nextOrder.id ? nextOrder : order))
    }
  });
};

const createUser = (payload: LoginPayload, role: "customer" | "seller"): User => {
  const email = payload.email.trim() || testUser.email;

  return {
    ...testUser,
    id: `user-${userKey(email).replace(/[^a-z0-9]+/g, "-")}`,
    name: payload.name?.trim() || testUser.name,
    email,
    phone: payload.phone?.trim() || testUser.phone,
    role,
    favorites: role === "seller" ? testUser.favorites : [],
    reviews: [],
    orders: role === "seller" ? testUser.orders.map(withChat) : []
  };
};

const flowerProducts = (items: Bouquet[]) => items.filter((product) => product.type === "flowers");

const defaultIngredients = (product: Bouquet, items: Bouquet[]) => {
  if (product.type !== "bouquet" || product.ingredients !== undefined) {
    return product.ingredients || [];
  }

  const flowers = flowerProducts(items);
  const sameType = flowers.find((flower) => flower.flowerType === product.flowerType);
  const fallback = flowers[0];
  const source = sameType || fallback;

  return source ? [{ productId: source.id, quantity: 3 }] : [];
};

const getIngredientCapacity = (product: Bouquet, items: Bouquet[]) => {
  const ingredients = defaultIngredients(product, items);

  if (product.type !== "bouquet") {
    return product.stock || 0;
  }

  if (!ingredients.length) {
    return 0;
  }

  return ingredients.reduce((available, ingredient) => {
    const flower = items.find((entry) => entry.id === ingredient.productId);
    const flowerStock = flower?.stock || 0;
    return Math.min(available, Math.floor(flowerStock / Math.max(1, ingredient.quantity)));
  }, Number.POSITIVE_INFINITY);
};

const getAvailableQuantityFrom = (productId: string | undefined, items: Bouquet[]) => {
  if (!productId) {
    return Number.POSITIVE_INFINITY;
  }

  const product = items.find((entry) => entry.id === productId);
  if (!product) {
    return 0;
  }

  if (product.type === "bouquet") {
    return Math.min(product.stock || 0, getIngredientCapacity(product, items));
  }

  return product.stock || 0;
};

const orderRequirements = (items: CartItem[], products: Bouquet[]) => {
  const requirements = new Map<string, number>();

  items.forEach((item) => {
    if (!item.bouquetId) {
      return;
    }

    const product = products.find((entry) => entry.id === item.bouquetId);
    if (!product) {
      return;
    }

    const ingredients = defaultIngredients(product, products);
    const sources = product.type === "bouquet" && ingredients.length
      ? [
          { productId: product.id, quantity: item.quantity },
          ...ingredients.map((ingredient) => ({
            productId: ingredient.productId,
            quantity: ingredient.quantity * item.quantity
          }))
        ]
      : [{ productId: product.id, quantity: item.quantity }];

    sources.forEach((source) => {
      requirements.set(source.productId, (requirements.get(source.productId) || 0) + source.quantity);
    });
  });

  return requirements;
};

type LoginPayload = {
  name?: string;
  email: string;
  phone?: string;
};

export function useShop() {
  const [products, setProducts] = useState<Bouquet[]>(() => withStock(mockBouquets));
  const [deliveries, setDeliveries] = useState<InventoryDelivery[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(defaultPromos);
  const [sellerOrders, setSellerOrders] = useState<Order[]>(() => testUser.orders.map(withChat));
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [cookies, setCookies] = useState<CookieSettings | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [activeCartUserId, setActiveCartUserId] = useState<string | null>(null);

  useEffect(() => {
    setProducts(withStock(readStorage<Bouquet[]>(PRODUCTS_KEY, mockBouquets)));
    setDeliveries(
      readStorage<InventoryDelivery[]>(DELIVERIES_KEY, []).map((delivery) => ({
        ...delivery,
        unitCost: delivery.unitCost || 0,
        totalCost: delivery.totalCost || 0,
        priceInputMode: delivery.priceInputMode || "unit"
      }))
    );
    setPromoCodes(readStorage<PromoCode[]>(PROMOS_KEY, defaultPromos));
    setSellerOrders(readStorage<Order[]>(SELLER_ORDERS_KEY, testUser.orders).map(withChat));
    setUser(withUserDefaults(readStorage<User | null>(USER_KEY, null)));
    setCookies(readStorage<CookieSettings | null>(COOKIE_KEY, null));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!user) {
      setCart([]);
      setActiveCartUserId(null);
      return;
    }

    if (activeCartUserId !== user.id) {
      setCart(readStorage<CartItem[]>(cartKey(user.id), []));
      setActiveCartUserId(user.id);
    }
  }, [activeCartUserId, hydrated, user]);

  useEffect(() => {
    if (hydrated && user && activeCartUserId === user.id) {
      writeStorage(cartKey(user.id), cart);
    }
  }, [activeCartUserId, cart, hydrated, user]);

  useEffect(() => {
    if (hydrated) {
      writeStorage(USER_KEY, user);
      if (user) {
        writeUserProfile(user);
      }
    }
  }, [user, hydrated]);

  useEffect(() => {
    if (hydrated && cookies) {
      writeStorage(COOKIE_KEY, cookies);
    }
  }, [cookies, hydrated]);

  useEffect(() => {
    if (hydrated) {
      writeStorage(PRODUCTS_KEY, products);
    }
  }, [hydrated, products]);

  useEffect(() => {
    if (hydrated) {
      writeStorage(DELIVERIES_KEY, deliveries);
    }
  }, [deliveries, hydrated]);

  useEffect(() => {
    if (hydrated) {
      writeStorage(PROMOS_KEY, promoCodes);
    }
  }, [hydrated, promoCodes]);

  useEffect(() => {
    if (hydrated) {
      writeStorage(SELLER_ORDERS_KEY, sellerOrders);
    }
  }, [hydrated, sellerOrders]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const getAvailableQuantity = useCallback(
    (productId: string) => getAvailableQuantityFrom(productId, products),
    [products]
  );

  const addToCart = useCallback((item: CartItem) => {
    if (!user) {
      return;
    }

    const availableQuantity = getAvailableQuantityFrom(item.bouquetId, products);
    if (availableQuantity < item.quantity) {
      return;
    }

    setCart((current) => {
      const existing = current.find((cartItem) => cartItem.id === item.id);
      if (!existing) {
        return [...current, item];
      }

      if (availableQuantity < existing.quantity + item.quantity) {
        return current;
      }

      return current.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
          : cartItem
      );
    });
  }, [products, user]);

  const changeQuantity = useCallback((id: string, direction: 1 | -1) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + direction) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((current) => current.filter((item) => item.id !== id));
  }, []);

  const updateCartItem = useCallback((oldId: string, nextItem: CartItem) => {
    setCart((current) =>
      current.map((item) => (item.id === oldId ? nextItem : item))
    );
  }, []);

  const login = useCallback((payload: LoginPayload) => {
    const email = payload.email.trim() || testUser.email;
    const role = email.toLowerCase() === testUser.email.toLowerCase() || email.toLowerCase().includes("seller")
      ? "seller"
      : "customer";
    const users = readUsers();
    const savedUser = withUserDefaults(users[userKey(email)] || null);
    const orphanOrders = sellerOrders
      .filter((order) => !order.customerEmail && !testOrderIds.has(order.id))
      .map((order) => ({ ...withChat(order), customerEmail: email }));
    const nextUser: User = savedUser
      ? {
          ...savedUser,
          name: payload.name?.trim() || savedUser.name,
          phone: payload.phone?.trim() || savedUser.phone,
          role,
          orders: [
            ...orphanOrders.filter((order) => !savedUser.orders.some((savedOrder) => savedOrder.id === order.id)),
            ...savedUser.orders
          ]
        }
      : {
          ...createUser(payload, role),
          orders: role === "customer" ? orphanOrders : testUser.orders.map(withChat)
        };

    setUser(nextUser);
    writeUserProfile(nextUser);
    if (orphanOrders.length) {
      setSellerOrders((current) =>
        current.map((order) =>
          orphanOrders.some((orphan) => orphan.id === order.id)
            ? { ...order, customerEmail: email }
            : order
        )
      );
    }
    setActiveCartUserId(null);
    return nextUser;
  }, [sellerOrders]);

  const logout = useCallback(() => {
    setUser(null);
    setCart([]);
    setActiveCartUserId(null);
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const placeOrder = useCallback(
    (details: { address: string }) => {
      if (!user || cart.length === 0) {
        return null;
      }

      const hasStockIssue = cart.some((item) => getAvailableQuantityFrom(item.bouquetId, products) < item.quantity);

      if (hasStockIssue) {
        return null;
      }

      const orderId = `LF-${Date.now().toString().slice(-6)}`;
      const order: Order = {
        id: orderId,
        customerEmail: user.email,
        date: new Date().toISOString().slice(0, 10),
        status: "Завершен",
        deliveryAddress: details.address,
        total: cartTotal,
        items: cart,
        chat: createOrderChat(orderId)
      };

      setUser((current) =>
        current ? { ...current, orders: [order, ...current.orders] } : current
      );
      setSellerOrders((current) => [order, ...current]);
      setProducts((current) => {
        const requirements = orderRequirements(cart, current);
        return current.map((product) => {
          const ordered = requirements.get(product.id) || 0;
          return ordered ? { ...product, stock: Math.max(0, (product.stock || 0) - ordered) } : product;
        });
      });
      setCart([]);
      return order;
    },
    [cart, cartTotal, products, user]
  );

  const repeatOrder = useCallback((order: Order) => {
    setCart((current) => [...current, ...order.items.map((item) => ({ ...item, id: `${item.id}-repeat-${Date.now()}` }))]);
  }, []);

  const canReview = useCallback(
    (bouquetId: string) =>
      Boolean(
        user?.orders.some(
          (order) =>
            order.status === "Завершен" && order.items.some((item) => item.bouquetId === bouquetId)
        ) && !user.reviews.some((review) => review.bouquetId === bouquetId)
      ),
    [user]
  );

  const addReview = useCallback(
    (bouquetId: string, rating: number, text: string) => {
      if (!user || !canReview(bouquetId)) {
        return;
      }

      const bouquet = products.find((item) => item.id === bouquetId);
      const review: Review = {
        id: `rv-${Date.now()}`,
        bouquetId,
        author: user.name,
        rating,
        text,
        date: new Date().toISOString().slice(0, 10)
      };

      setUser((current) =>
        current
          ? {
              ...current,
              reviews: [review, ...current.reviews],
              favorites: bouquet ? Array.from(new Set([...current.favorites, bouquet.id])) : current.favorites
            }
          : current
      );
    },
    [canReview, products, user]
  );

  const toggleFavorite = useCallback((bouquetId: string) => {
    setUser((current) => {
      if (!current) {
        return current;
      }

      const exists = current.favorites.includes(bouquetId);
      return {
        ...current,
        favorites: exists
          ? current.favorites.filter((id) => id !== bouquetId)
          : [...current.favorites, bouquetId]
      };
    });
  }, []);

  const addProduct = useCallback((product: Bouquet) => {
    setProducts((current) => {
      const normalizedProduct = {
        ...product,
        flowerType: product.type === "bouquet" ? "" : product.flowerType,
        stock: product.stock || 0
      };
      const cappedProduct = normalizedProduct.type === "bouquet"
        ? {
            ...normalizedProduct,
            stock: Math.min(normalizedProduct.stock || 0, getIngredientCapacity(normalizedProduct, current))
          }
        : normalizedProduct;

      return [cappedProduct, ...current];
    });
  }, []);

  const updateProduct = useCallback((id: string, patch: Partial<Bouquet>) => {
    setProducts((current) =>
      current.map((product) => {
        if (product.id !== id) {
          return product;
        }

        const nextProduct = {
          ...product,
          ...patch,
          flowerType: (patch.type || product.type) === "bouquet" ? "" : (patch.flowerType ?? product.flowerType),
          stock: patch.stock ?? product.stock ?? 0
        };
        const productList = current.map((entry) => (entry.id === id ? nextProduct : entry));

        return nextProduct.type === "bouquet"
          ? {
              ...nextProduct,
              stock: Math.min(nextProduct.stock || 0, getIngredientCapacity(nextProduct, productList))
            }
          : nextProduct;
      })
    );
  }, []);

  const receiveDelivery = useCallback((payload: { productId: string; quantity: number; purchasePrice: number; priceInputMode: "unit" | "total"; note: string }) => {
    const quantity = Math.max(0, Math.round(payload.quantity));
    const purchasePrice = Math.max(0, Number(payload.purchasePrice) || 0);

    const deliveryProduct = products.find((product) => product.id === payload.productId);

    if (!payload.productId || quantity <= 0 || deliveryProduct?.type !== "flowers") {
      return;
    }

    const unitCost = payload.priceInputMode === "unit"
      ? purchasePrice
      : Math.round((purchasePrice / quantity) * 100) / 100;
    const totalCost = payload.priceInputMode === "total"
      ? purchasePrice
      : Math.round(purchasePrice * quantity * 100) / 100;

    const delivery: InventoryDelivery = {
      id: `dlv-${Date.now()}`,
      productId: payload.productId,
      quantity,
      unitCost,
      totalCost,
      priceInputMode: payload.priceInputMode,
      date: new Date().toISOString().slice(0, 10),
      note: payload.note.trim()
    };

    setDeliveries((current) => [delivery, ...current]);
    setProducts((current) =>
      current.map((product) =>
        product.id === payload.productId
          ? { ...product, stock: (product.stock || 0) + quantity }
          : product
      )
    );
  }, [products]);

  const createPromoCode = useCallback((promo: Omit<PromoCode, "id" | "used">) => {
    const normalizedCode = promo.code.trim().toUpperCase();

    if (!normalizedCode) {
      return;
    }

    setPromoCodes((current) => [
      {
        ...promo,
        id: `promo-${Date.now()}`,
        code: normalizedCode,
        discount: Math.min(90, Math.max(1, Math.round(promo.discount))),
        usageLimit: Math.max(1, Math.round(promo.usageLimit)),
        used: 0
      },
      ...current
    ]);
  }, []);

  const togglePromoCode = useCallback((id: string) => {
    setPromoCodes((current) =>
      current.map((promo) => (promo.id === id ? { ...promo, active: !promo.active } : promo))
    );
  }, []);

  const sendChatMessage = useCallback(
    (orderId: string, payload: { text: string; image?: string; authorRole?: "customer" | "seller" }) => {
      if (!user) {
        return;
      }

      const text = payload.text.trim();
      if (!text && !payload.image) {
        return;
      }

      const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        orderId,
        authorRole: payload.authorRole || user.role,
        authorName: payload.authorRole === "seller" ? "Продавец" : user.name,
        text,
        image: payload.image,
        date: new Date().toISOString()
      };

      const appendMessage = (order: Order) => {
        if (order.id !== orderId) {
          return order;
        }

        const orderWithChat = withChat(order);
        return {
          ...orderWithChat,
          chat: {
            ...orderWithChat.chat,
            messages: [...orderWithChat.chat.messages, message]
          }
        };
      };

      setUser((current) =>
        current ? { ...current, orders: current.orders.map(appendMessage) } : current
      );
      setSellerOrders((current) =>
        current.map((order) => {
          const nextOrder = appendMessage(order);
          if (nextOrder !== order) {
            replaceOrderInStoredUser(nextOrder.customerEmail, nextOrder);
          }
          return nextOrder;
        })
      );
    },
    [user]
  );

  return {
    hydrated,
    bouquets: products,
    deliveries,
    promoCodes,
    sellerOrders,
    cart,
    cartCount,
    cartTotal,
    getAvailableQuantity,
    user,
    cookies,
    setCookies,
    addToCart,
    updateCartItem,
    changeQuantity,
    removeFromCart,
    login,
    logout,
    updateUser,
    placeOrder,
    repeatOrder,
    canReview,
    addReview,
    toggleFavorite,
    addProduct,
    updateProduct,
    receiveDelivery,
    createPromoCode,
    togglePromoCode,
    sendChatMessage
  };
}
