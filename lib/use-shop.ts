"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { bouquets, testUser } from "@/lib/mock-data";
import { readStorage, writeStorage } from "@/lib/storage";
import type { CartItem, CookieSettings, Order, Review, User } from "@/types/shop";

const cartKey = (userId: string) => `ns-buketno.cart.${userId}`;
const USER_KEY = "lumiere.user";
const COOKIE_KEY = "lumiere.cookies";

type LoginPayload = {
  name?: string;
  email: string;
  phone?: string;
};

export function useShop() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [cookies, setCookies] = useState<CookieSettings | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [activeCartUserId, setActiveCartUserId] = useState<string | null>(null);

  useEffect(() => {
    setUser(readStorage<User | null>(USER_KEY, null));
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
    }
  }, [user, hydrated]);

  useEffect(() => {
    if (hydrated && cookies) {
      writeStorage(COOKIE_KEY, cookies);
    }
  }, [cookies, hydrated]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const addToCart = useCallback((item: CartItem) => {
    if (!user) {
      return;
    }

    setCart((current) => {
      const existing = current.find((cartItem) => cartItem.id === item.id);
      if (!existing) {
        return [...current, item];
      }

      return current.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
          : cartItem
      );
    });
  }, [user]);

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
    const nextUser: User = {
      ...testUser,
      name: payload.name?.trim() || testUser.name,
      email: payload.email.trim() || testUser.email,
      phone: payload.phone?.trim() || testUser.phone
    };

    setUser(nextUser);
    setActiveCartUserId(null);
    return nextUser;
  }, []);

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

      const order: Order = {
        id: `LF-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().slice(0, 10),
        status: "Завершен",
        deliveryAddress: details.address,
        total: cartTotal,
        items: cart
      };

      setUser((current) =>
        current ? { ...current, orders: [order, ...current.orders] } : current
      );
      setCart([]);
      return order;
    },
    [cart, cartTotal, user]
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

      const bouquet = bouquets.find((item) => item.id === bouquetId);
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
    [canReview, user]
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

  return {
    hydrated,
    cart,
    cartCount,
    cartTotal,
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
    toggleFavorite
  };
}
