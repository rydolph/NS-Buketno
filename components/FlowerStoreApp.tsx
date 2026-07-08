"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Catalog } from "@/components/Catalog";
import { CookieBanner } from "@/components/CookieBanner";
import { AuthModal } from "@/components/modals/AuthModal";
import { BuilderModal } from "@/components/modals/BuilderModal";
import { CartDrawer } from "@/components/modals/CartDrawer";
import { CheckoutModal } from "@/components/modals/CheckoutModal";
import { FavoritesModal } from "@/components/modals/FavoritesModal";
import { ProductModal } from "@/components/modals/ProductModal";
import { ProfileModal } from "@/components/modals/ProfileModal";
import { bouquets } from "@/lib/mock-data";
import { useShop } from "@/lib/use-shop";
import type { Bouquet, CartItem, CatalogFilters } from "@/types/shop";

type PendingAction = (() => void) | null;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function FlowerStoreApp() {
  const shop = useShop();
  const [filters, setFilters] = useState<CatalogFilters>({
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
  const [selectedBouquet, setSelectedBouquet] = useState<Bouquet | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);
  const [cartPulse, setCartPulse] = useState(0);
  const pendingAction = useRef<PendingAction>(null);

  const filteredBouquets = useMemo(() => {
    return bouquets.filter((bouquet) => {
      if (filters.productType !== "all" && bouquet.type !== filters.productType) return false;
      if (filters.category !== "Все" && bouquet.category !== filters.category) return false;
      if (filters.flowerType !== "Все" && bouquet.flowerType !== filters.flowerType) return false;
      if (filters.occasion !== "Все" && bouquet.occasion !== filters.occasion) return false;
      if (filters.palette !== "Все" && bouquet.palette !== filters.palette) return false;
      if (bouquet.price < filters.minPrice || bouquet.price > filters.maxPrice) return false;
      return true;
    });
  }, [filters]);

  useEffect(() => {
    if (!cartPulse) return;
    const timer = window.setTimeout(() => setCartPulse(0), 1800);
    return () => window.clearTimeout(timer);
  }, [cartPulse]);

  const requireAuth = (action: () => void) => {
    if (shop.user) {
      action();
      return;
    }

    pendingAction.current = action;
    setAuthOpen(true);
  };

  const runPendingAction = () => {
    setAuthOpen(false);
    window.setTimeout(() => {
      pendingAction.current?.();
      pendingAction.current = null;
    }, 80);
  };

  const openBouquet = (bouquet: Bouquet) => {
    requireAuth(() => {
      setSelectedBouquet(bouquet);
      window.history.pushState({}, "", `${basePath}/catalog/bouquet/${bouquet.slug}`);
    });
  };

  const closeBouquet = () => {
    setSelectedBouquet(null);
    setEditingCartItem(null);
    if (window.location.pathname.startsWith(`${basePath}/catalog/bouquet`)) {
      window.history.pushState({}, "", `${basePath || "/"}`);
    }
  };

  const addItem = (item: CartItem) => {
    shop.addToCart(item);
    setCartPulse((value) => value + 1);
  };

  const addBouquetQuick = (bouquet: Bouquet) => {
    requireAuth(() => {
      addItem({
        id: `${bouquet.id}-quick`,
        bouquetId: bouquet.id,
        title: bouquet.title,
        image: bouquet.image,
        price: bouquet.price,
        quantity: 1,
        meta: [
          bouquet.type === "bouquet" ? "Готовый букет" : `${bouquet.stemOptions?.[0] || 1} стеблей`,
          bouquet.packages[0].label
        ]
      });
    });
  };

  const toggleFavorite = (bouquet: Bouquet) => {
    requireAuth(() => shop.toggleFavorite(bouquet.id));
  };

  const startCheckout = () => {
    setCartOpen(false);
    requireAuth(() => setCheckoutOpen(true));
  };

  const editCartItem = (item: CartItem) => {
    if (!item.bouquetId) {
      return;
    }

    const bouquet = bouquets.find((entry) => entry.id === item.bouquetId);
    if (!bouquet) {
      return;
    }

    setCartOpen(false);
    setEditingCartItem(item);
    setSelectedBouquet(bouquet);
    window.history.pushState({}, "", `${basePath}/catalog/bouquet/${bouquet.slug}`);
  };

  return (
    <div className="min-h-screen bg-milk text-ink">
      <Header
        cartCount={shop.cartCount}
        favoriteCount={shop.user?.favorites.length || 0}
        onBuilder={() => requireAuth(() => setBuilderOpen(true))}
        onCart={() => setCartOpen(true)}
        onFavorites={() => requireAuth(() => setFavoritesOpen(true))}
        onProfile={() => requireAuth(() => setProfileOpen(true))}
        userName={shop.user?.name}
      />

      <AnimatePresence>
        {cartPulse ? (
          <motion.div
            className="pointer-events-none fixed right-5 top-28 z-40 rounded-full bg-wine px-4 py-2 text-sm font-semibold text-white shadow-petal"
            key={cartPulse}
            initial={{ y: -12, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            Добавлено в корзину
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Catalog
        bouquets={filteredBouquets}
        favoriteIds={shop.user?.favorites || []}
        filters={filters}
        onAdd={addBouquetQuick}
        onFavorite={toggleFavorite}
        onFilters={setFilters}
        onOpen={openBouquet}
      />

      <Footer />

      <AuthModal
        onClose={() => {
          pendingAction.current = null;
          setAuthOpen(false);
        }}
        onLogin={shop.login}
        onSuccess={runPendingAction}
        open={authOpen}
      />

      <ProductModal
        bouquet={selectedBouquet}
        editingItem={editingCartItem}
        onAdd={(item) => {
          if (editingCartItem) {
            shop.updateCartItem(editingCartItem.id, item);
            closeBouquet();
            setCartOpen(true);
            return;
          }

          addItem(item);
        }}
        onBuy={(item) => {
          requireAuth(() => {
            addItem(item);
            closeBouquet();
            setCheckoutOpen(true);
          });
        }}
        onClose={closeBouquet}
        userReviews={shop.user?.reviews || []}
      />

      <BuilderModal
        onAdd={(item) => {
          addItem(item);
          setBuilderOpen(false);
          setCartOpen(true);
        }}
        onClose={() => setBuilderOpen(false)}
        open={builderOpen}
      />

      <CartDrawer
        cart={shop.cart}
        onCheckout={startCheckout}
        onClose={() => setCartOpen(false)}
        onEdit={editCartItem}
        onQuantity={shop.changeQuantity}
        onRemove={shop.removeFromCart}
        open={cartOpen}
        total={shop.cartTotal}
      />

      <FavoritesModal
        favoriteIds={shop.user?.favorites || []}
        onAdd={(bouquet) => {
          addBouquetQuick(bouquet);
          setFavoritesOpen(false);
          setCartOpen(true);
        }}
        onClose={() => setFavoritesOpen(false)}
        onOpen={(bouquet) => {
          setFavoritesOpen(false);
          openBouquet(bouquet);
        }}
        onToggle={toggleFavorite}
        open={favoritesOpen}
      />

      <CheckoutModal
        onClose={() => setCheckoutOpen(false)}
        onPay={shop.placeOrder}
        open={checkoutOpen}
        total={shop.cartTotal}
        user={shop.user}
      />

      <ProfileModal
        onClose={() => setProfileOpen(false)}
        onLogout={shop.logout}
        onRepeat={(order) => {
          shop.repeatOrder(order);
          setProfileOpen(false);
          setCartOpen(true);
        }}
        onReview={shop.addReview}
        onUpdate={shop.updateUser}
        open={profileOpen}
        user={shop.user}
      />

      <CookieBanner onSave={shop.setCookies} settings={shop.cookies} />
    </div>
  );
}
