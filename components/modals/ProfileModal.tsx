"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Repeat2, Star } from "lucide-react";
import { useState } from "react";
import { bouquets, formatPrice } from "@/lib/mock-data";
import { Field, Modal, PrimaryButton, SecondaryButton, Textarea } from "@/components/ui";
import type { Order, User } from "@/types/shop";

type ProfileModalProps = {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onUpdate: (patch: Partial<User>) => void;
  onLogout: () => void;
  onRepeat: (order: Order) => void;
  onReview: (productId: string, rating: number, text: string) => void;
};

const tabs = ["Личные данные", "Адреса", "История заказов", "Отзывы", "Настройки"];

export function ProfileModal({ open, user, onClose, onUpdate, onLogout, onRepeat, onReview }: ProfileModalProps) {
  const [tab, setTab] = useState(tabs[0]);

  if (!user) {
    return null;
  }

  return (
    <Modal open={open} title="Профиль" onClose={onClose} wide>
      <div className="grid gap-4 p-4 lg:grid-cols-[250px_1fr] lg:gap-5 lg:p-6">
        <aside className="scrollbar-none flex gap-2 overflow-x-auto pb-1 lg:grid lg:content-start lg:overflow-visible lg:pb-0">
          {tabs.map((item) => (
            <button
              className={`shrink-0 rounded-[8px] px-4 py-3 text-left text-sm transition ${tab === item ? "bg-wine text-white" : "bg-white text-ink hover:bg-rose/15"}`}
              key={item}
              onClick={() => setTab(item)}
              type="button"
            >
              {item}
            </button>
          ))}
          <button
            className="inline-flex shrink-0 items-center gap-2 rounded-[8px] bg-milk px-4 py-3 text-left text-sm text-wine lg:mt-3"
            onClick={() => {
              onLogout();
              onClose();
            }}
            type="button"
          >
            <LogOut size={16} />
            Выйти
          </button>
        </aside>

        <AnimatePresence mode="wait">
          <motion.section
            animate={{ opacity: 1, y: 0 }}
            className="min-h-[360px] rounded-[8px] bg-milk p-4 sm:p-5 lg:min-h-[420px]"
            exit={{ opacity: 0, y: 8 }}
            initial={{ opacity: 0, y: 8 }}
            key={tab}
            transition={{ duration: 0.18 }}
          >
            {tab === "Личные данные" ? <Personal user={user} onUpdate={onUpdate} /> : null}
            {tab === "Адреса" ? <Addresses user={user} onUpdate={onUpdate} /> : null}
            {tab === "История заказов" ? <Orders orders={user.orders} onRepeat={onRepeat} /> : null}
            {tab === "Отзывы" ? (
              <Reviews user={user} onReview={onReview} />
            ) : null}
            {tab === "Настройки" ? <Settings user={user} /> : null}
          </motion.section>
        </AnimatePresence>
      </div>
    </Modal>
  );
}

function Personal({ user, onUpdate }: { user: User; onUpdate: (patch: Partial<User>) => void }) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email);

  return (
    <form
      className="grid max-w-xl gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onUpdate({ name, phone, email });
      }}
    >
      <h3 className="font-serif text-3xl text-ink">Личные данные</h3>
      <Field label="Имя" onChange={setName} value={name} />
      <Field label="Телефон" onChange={setPhone} value={phone} />
      <Field label="Email" onChange={setEmail} type="email" value={email} />
      <PrimaryButton type="submit">Сохранить</PrimaryButton>
    </form>
  );
}

function Addresses({ user, onUpdate }: { user: User; onUpdate: (patch: Partial<User>) => void }) {
  const [address, setAddress] = useState("");

  return (
    <div className="grid gap-4">
      <h3 className="font-serif text-3xl text-ink">Адреса доставки</h3>
      {user.addresses.map((item) => (
        <div className="rounded-[8px] bg-white p-4 text-sm text-ink/70" key={item}>
          {item}
        </div>
      ))}
      <Textarea label="Новый адрес" onChange={setAddress} value={address} />
      <PrimaryButton
        onClick={() => {
          if (address.trim()) {
            onUpdate({ addresses: [...user.addresses, address.trim()] });
            setAddress("");
          }
        }}
      >
        Добавить адрес
      </PrimaryButton>
    </div>
  );
}

function Orders({ orders, onRepeat }: { orders: Order[]; onRepeat: (order: Order) => void }) {
  return (
    <div className="grid gap-4">
      <h3 className="font-serif text-3xl text-ink">История заказов</h3>
      {orders.length ? (
        orders.map((order) => (
          <article className="rounded-[8px] bg-white p-4" key={order.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h4 className="font-semibold text-ink">{order.id}</h4>
                <p className="text-sm text-ink/55">
                  {order.date} · {order.status} · {order.deliveryAddress}
                </p>
              </div>
              <strong className="text-wine">{formatPrice(order.total)}</strong>
            </div>
            <p className="mt-3 text-sm text-ink/65">{order.items.map((item) => `${item.title} x${item.quantity}`).join(", ")}</p>
            <SecondaryButton onClick={() => onRepeat(order)}>
              <Repeat2 size={16} />
              Повторить заказ
            </SecondaryButton>
          </article>
        ))
      ) : (
        <p className="rounded-[8px] bg-white p-5 text-sm text-ink/60">Заказов пока нет.</p>
      )}
    </div>
  );
}

function Reviews({ user, onReview }: { user: User; onReview: (productId: string, rating: number, text: string) => void }) {
  const reviewed = new Set(user.reviews.map((review) => review.bouquetId));
  const purchasedIds = Array.from(
    new Set(
      user.orders
        .filter((order) => order.status === "Завершен")
        .flatMap((order) => order.items.map((item) => item.bouquetId).filter(Boolean) as string[])
    )
  );
  const reviewable = purchasedIds
    .filter((id) => !reviewed.has(id))
    .map((id) => bouquets.find((bouquet) => bouquet.id === id))
    .filter(Boolean) as typeof bouquets;
  const [selected, setSelected] = useState(reviewable[0]?.id || "");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  return (
    <div className="grid gap-4">
      <h3 className="font-serif text-3xl text-ink">Отзывы</h3>
      {user.reviews.length ? (
        user.reviews.map((review) => (
          <article className="rounded-[8px] bg-white p-4" key={review.id}>
            <p className="flex items-center gap-2 text-sm text-wine">
              <Star size={16} fill="currentColor" /> {review.rating}
            </p>
            <p className="mt-2 text-sm text-ink/65">{review.text}</p>
          </article>
        ))
      ) : (
        <p className="rounded-[8px] bg-white p-5 text-sm text-ink/60">Вы еще не оставляли отзывы.</p>
      )}

      {reviewable.length ? (
        <form
          className="grid gap-3 rounded-[8px] bg-white p-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (selected && text.trim()) {
              onReview(selected, rating, text.trim());
              setText("");
            }
          }}
        >
          <label className="grid gap-2 text-sm font-medium text-ink">
            Купленный товар
            <select
              className="h-12 rounded-[8px] border border-wine/10 bg-milk px-4 text-sm outline-none transition focus:border-wine/35 focus:ring-4 focus:ring-rose/15"
              onChange={(event) => setSelected(event.target.value)}
              value={selected}
            >
              {reviewable.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                aria-label={`Оценка ${value}`}
                className={value <= rating ? "text-wine" : "text-ink/25"}
                key={value}
                onClick={() => setRating(value)}
                type="button"
              >
                <Star size={20} fill="currentColor" />
              </button>
            ))}
          </div>
          <Textarea label="Отзыв" onChange={setText} value={text} />
          <PrimaryButton type="submit">Оставить отзыв</PrimaryButton>
        </form>
      ) : (
        <p className="rounded-[8px] bg-rose/10 p-4 text-sm text-ink/65">
          Нет купленных товаров без отзыва. На каждый товар можно оставить только один отзыв.
        </p>
      )}
    </div>
  );
}

function Settings({ user }: { user: User }) {
  return (
    <div className="grid gap-4">
      <h3 className="font-serif text-3xl text-ink">Настройки</h3>
      <div className="rounded-[8px] bg-white p-4 text-sm leading-6 text-ink/65">
        Аккаунт: {user.email}. Уведомления о заказах и обновлениях бутика включены в mock-режиме.
      </div>
    </div>
  );
}
