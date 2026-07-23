"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Catalog } from "@/components/Catalog";
import { CookieBanner } from "@/components/CookieBanner";
import { AuthModal } from "@/components/modals/AuthModal";
import { BuilderModal } from "@/components/modals/BuilderModal";
import { CartDrawer } from "@/components/modals/CartDrawer";
import { ChatModal, ChatPickerModal } from "@/components/modals/ChatModal";
import { CheckoutModal } from "@/components/modals/CheckoutModal";
import { FavoritesModal } from "@/components/modals/FavoritesModal";
import { ProductModal } from "@/components/modals/ProductModal";
import { ProfileModal } from "@/components/modals/ProfileModal";
import { SellerModal } from "@/components/modals/SellerModal";
import { useShop } from "@/lib/use-shop";
import type { Bouquet, CartItem, CatalogFilters, Order } from "@/types/shop";

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
  const [sellerOpen, setSellerOpen] = useState(false);
  const [chatOrderId, setChatOrderId] = useState<string | null>(null);
  const [chatRole, setChatRole] = useState<"customer" | "seller">("customer");
  const [chatPickerOpen, setChatPickerOpen] = useState(false);
  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);
  const [cartPulse, setCartPulse] = useState(0);
  const pendingAction = useRef<PendingAction>(null);

  const filteredBouquets = useMemo(() => {
    return shop.bouquets.filter((bouquet) => {
      if (shop.getAvailableQuantity(bouquet.id) <= 0) return false;
      if (filters.productType !== "all" && bouquet.type !== filters.productType) return false;
      if (filters.category !== "Все" && bouquet.category !== filters.category) return false;
      if (filters.flowerType !== "Все" && bouquet.flowerType !== filters.flowerType) return false;
      if (filters.occasion !== "Все" && bouquet.occasion !== filters.occasion) return false;
      if (filters.palette !== "Все" && bouquet.palette !== filters.palette) return false;
      if (bouquet.price < filters.minPrice || bouquet.price > filters.maxPrice) return false;
      return true;
    });
  }, [filters, shop.bouquets, shop.getAvailableQuantity]);

  const chatOrder = useMemo(() => {
    if (!chatOrderId) {
      return null;
    }

    const orders = chatRole === "seller" ? shop.sellerOrders : shop.user?.orders || [];
    return orders.find((order) => order.id === chatOrderId) || null;
  }, [chatOrderId, chatRole, shop.sellerOrders, shop.user?.orders]);
  const chatOrders = shop.user?.role === "seller"
    ? shop.sellerOrders
    : shop.user?.orders || [];

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
    if (item.bouquetId && shop.getAvailableQuantity(item.bouquetId) < item.quantity) {
      return;
    }

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
          bouquet.type === "flowers"
            ? `${bouquet.stemOptions?.[0] || 1} стеблей`
            : bouquet.type === "composition"
              ? "Композиция"
              : "Готовый букет",
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

    const bouquet = shop.bouquets.find((entry) => entry.id === item.bouquetId);
    if (!bouquet) {
      return;
    }

    setCartOpen(false);
    setEditingCartItem(item);
    setSelectedBouquet(bouquet);
    window.history.pushState({}, "", `${basePath}/catalog/bouquet/${bouquet.slug}`);
  };

  const openChat = (order: Order, role: "customer" | "seller") => {
    setChatOrderId(order.id);
    setChatRole(role);
  };

  return (
    <div className="min-h-screen bg-milk text-ink">
      <Header
        cartCount={shop.cartCount}
        favoriteCount={shop.user?.favorites.length || 0}
        isSeller={shop.user?.role === "seller"}
        onBuilder={() => requireAuth(() => setBuilderOpen(true))}
        onCart={() => setCartOpen(true)}
        onFavorites={() => requireAuth(() => setFavoritesOpen(true))}
        onProfile={() => requireAuth(() => setProfileOpen(true))}
        onSeller={() => requireAuth(() => {
          if (shop.user?.role === "seller") {
            setSellerOpen(true);
          }
        })}
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

      {chatOrders.length ? (
        <button
          aria-label="Открыть чат по последнему заказу"
          className="fixed bottom-5 right-5 z-30 grid size-14 place-items-center rounded-full bg-wine text-white shadow-petal transition hover:bg-[#844b5f] focus:outline-none focus:ring-2 focus:ring-wine/35"
          onClick={() => setChatPickerOpen(true)}
          type="button"
        >
          <MessageCircle size={24} />
        </button>
      ) : null}

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
        bouquet={selectedBouquet ? shop.bouquets.find((bouquet) => bouquet.id === selectedBouquet.id) || selectedBouquet : null}
        editingItem={editingCartItem}
        availableQuantity={selectedBouquet ? shop.getAvailableQuantity(selectedBouquet.id) : 0}
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
        promoCodes={shop.promoCodes}
        products={shop.bouquets}
        getAvailableQuantity={shop.getAvailableQuantity}
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
        products={shop.bouquets}
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
        onChat={(order) => openChat(order, "customer")}
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

      <SellerModal
        deliveries={shop.deliveries}
        orders={shop.sellerOrders}
        onAddProduct={shop.addProduct}
        onChat={(order) => openChat(order, "seller")}
        onClose={() => setSellerOpen(false)}
        onCreatePromoCode={shop.createPromoCode}
        onReceiveDelivery={shop.receiveDelivery}
        onTogglePromoCode={shop.togglePromoCode}
        onUpdateProduct={shop.updateProduct}
        open={sellerOpen}
        products={shop.bouquets}
        promoCodes={shop.promoCodes}
      />

      <ChatModal
        onClose={() => setChatOrderId(null)}
        onSend={shop.sendChatMessage}
        open={Boolean(chatOrder)}
        order={chatOrder}
        role={chatRole}
      />

      <ChatPickerModal
        onClose={() => setChatPickerOpen(false)}
        onSelect={(order, role) => {
          setChatPickerOpen(false);
          openChat(order, role);
        }}
        open={chatPickerOpen}
        orders={chatOrders}
        role={shop.user?.role === "seller" ? "seller" : "customer"}
      />

      <CookieBanner onSave={shop.setCookies} settings={shop.cookies} />
    </div>
  );
}
