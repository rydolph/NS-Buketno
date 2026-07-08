"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/lib/mock-data";
import { Field, Modal, PrimaryButton, SecondaryButton, Textarea } from "@/components/ui";
import type { Order, User } from "@/types/shop";

type CheckoutModalProps = {
  open: boolean;
  user: User | null;
  total: number;
  onClose: () => void;
  onPay: (details: { address: string }) => Order | null;
};

export function CheckoutModal({ open, user, total, onClose, onPay }: CheckoutModalProps) {
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [address, setAddress] = useState(user?.addresses[0] || "");
  const [delivery, setDelivery] = useState("");
  const [comment, setComment] = useState("");
  const [payment, setPayment] = useState("Карта онлайн");
  const [success, setSuccess] = useState<Order | null>(null);

  useEffect(() => {
    if (open && user && !success) {
      setName(user.name);
      setPhone(user.phone);
      setEmail(user.email);
      setAddress(user.addresses[0] || "");
    }
  }, [open, success, user]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const order = onPay({ address });
    if (order) {
      setSuccess(order);
    }
  };

  return (
    <Modal open={open} title={success ? "Заказ оформлен" : "Оформление заказа"} onClose={onClose} wide>
      {success ? (
        <div className="grid place-items-center gap-4 p-8 text-center">
          <CheckCircle2 className="text-sage" size={64} />
          <div>
            <h3 className="font-serif text-4xl text-ink">Спасибо за заказ</h3>
            <p className="mt-3 text-ink/65">
              Заказ {success.id} сохранен в истории профиля. Mock-оплата прошла успешно.
            </p>
          </div>
          <PrimaryButton onClick={onClose}>Вернуться в каталог</PrimaryButton>
        </div>
      ) : (
        <form className="grid gap-6 p-5 lg:grid-cols-[1fr_360px] lg:p-6" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Имя" onChange={setName} required value={name} />
            <Field label="Телефон" onChange={setPhone} required value={phone} />
            <Field label="Email" onChange={setEmail} required type="email" value={email} />
            <Field label="Дата и время доставки" onChange={setDelivery} required type="datetime-local" value={delivery} />
            <label className="grid gap-2 text-sm font-medium text-ink sm:col-span-2">
              Способ оплаты
              <select
                className="h-12 rounded-[8px] border border-wine/10 bg-white/75 px-4 text-sm outline-none transition focus:border-wine/35 focus:ring-4 focus:ring-rose/15"
                onChange={(event) => setPayment(event.target.value)}
                value={payment}
              >
                <option>Карта онлайн</option>
                <option>При получении</option>
                <option>Сертификат бутика</option>
              </select>
            </label>
            <Textarea label="Адрес доставки" onChange={setAddress} value={address} />
            <Textarea label="Комментарий к заказу" onChange={setComment} placeholder="Время, домофон, пожелания флористу" value={comment} />
          </div>

          <aside className="grid content-start gap-4 rounded-[8px] bg-milk p-5">
            <h3 className="font-serif text-3xl text-ink">Итог</h3>
            <div className="flex justify-between border-b border-wine/10 pb-3 text-sm text-ink/65">
              <span>Оплата</span>
              <span>{payment}</span>
            </div>
            <div className="flex justify-between text-xl font-semibold text-ink">
              <span>К оплате</span>
              <span>{formatPrice(total)}</span>
            </div>
            <PrimaryButton disabled={!total} type="submit">Оплатить</PrimaryButton>
            <SecondaryButton onClick={onClose}>Отмена</SecondaryButton>
          </aside>
        </form>
      )}
    </Modal>
  );
}
