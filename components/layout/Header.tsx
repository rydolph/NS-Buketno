"use client";

import { Heart, ShoppingBag, Sparkles, UserRound } from "lucide-react";
import { PrimaryButton } from "@/components/ui";

type HeaderProps = {
  cartCount: number;
  favoriteCount: number;
  userName?: string;
  onBuilder: () => void;
  onCart: () => void;
  onFavorites: () => void;
  onProfile: () => void;
};

export function Header({
  cartCount,
  favoriteCount,
  userName,
  onBuilder,
  onCart,
  onFavorites,
  onProfile
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-wine/10 bg-milk/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <button
            className="text-left focus:outline-none focus:ring-2 focus:ring-wine/30"
            type="button"
          >
            <span className="block font-serif text-2xl leading-none text-wine sm:text-3xl">НС Букетно</span>
          </button>

          <div className="flex items-center gap-2">
            <span id="builder">
              <PrimaryButton onClick={onBuilder}>
              <Sparkles size={17} />
              <span className="hidden sm:inline">Собрать букет</span>
              </PrimaryButton>
            </span>
            <button
              aria-label={`Открыть избранное, товаров: ${favoriteCount}`}
              className="relative grid size-11 place-items-center rounded-full bg-white text-ink shadow-sm transition hover:bg-rose/15 focus:outline-none focus:ring-2 focus:ring-wine/30"
              onClick={onFavorites}
              type="button"
            >
              <Heart size={20} />
              {favoriteCount > 0 ? (
                <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-wine px-1 text-xs font-bold text-white">
                  {favoriteCount}
                </span>
              ) : null}
            </button>
            <button
              aria-label={`Открыть корзину, товаров: ${cartCount}`}
              className="relative grid size-11 place-items-center rounded-full bg-white text-ink shadow-sm transition hover:bg-rose/15 focus:outline-none focus:ring-2 focus:ring-wine/30"
              onClick={onCart}
              type="button"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-wine px-1 text-xs font-bold text-white">
                  {cartCount}
                </span>
              ) : null}
            </button>
            <button
              aria-label={userName ? "Открыть профиль" : "Войти"}
              className="grid size-11 place-items-center rounded-full bg-white text-ink shadow-sm transition hover:bg-rose/15 focus:outline-none focus:ring-2 focus:ring-wine/30"
              onClick={onProfile}
              title={userName || "Вход"}
              type="button"
            >
              <UserRound size={20} />
            </button>
          </div>
      </div>
    </header>
  );
}
