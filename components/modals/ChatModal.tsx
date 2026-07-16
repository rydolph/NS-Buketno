"use client";

import { useMemo, useRef, useState } from "react";
import { ImagePlus, RotateCcw, Send, X, ZoomIn, ZoomOut } from "lucide-react";
import { Modal, PrimaryButton, SecondaryButton, Textarea } from "@/components/ui";
import type { Order } from "@/types/shop";

type ChatPickerModalProps = {
  open: boolean;
  orders: Order[];
  role: "customer" | "seller";
  onClose: () => void;
  onSelect: (order: Order, role: "customer" | "seller") => void;
};

export function ChatPickerModal({ open, orders, role, onClose, onSelect }: ChatPickerModalProps) {
  return (
    <Modal open={open} title="Выберите заказ для чата" onClose={onClose}>
      <div className="grid gap-3 p-4 sm:p-5">
        {orders.length ? (
          orders.map((order) => {
            const lastMessage = order.chat?.messages.at(-1);

            return (
              <button
                className="grid gap-2 rounded-[8px] bg-white p-4 text-left transition hover:bg-rose/15 focus:outline-none focus:ring-2 focus:ring-wine/30"
                key={order.id}
                onClick={() => onSelect(order, role)}
                type="button"
              >
                <span className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-ink">{order.id}</strong>
                  <span className="text-xs text-ink/45">{order.date}</span>
                </span>
                <span className="line-clamp-2 text-sm text-ink/60">
                  {order.items.map((item) => `${item.title} x${item.quantity}`).join(", ")}
                </span>
                <span className="line-clamp-2 text-sm text-ink/75">
                  {lastMessage?.text || "В чате пока только фото"}
                </span>
              </button>
            );
          })
        ) : (
          <p className="rounded-[8px] bg-white p-5 text-sm text-ink/60">
            Чаты появятся после оформления заказа.
          </p>
        )}
      </div>
    </Modal>
  );
}

type ChatModalProps = {
  open: boolean;
  order: Order | null;
  role: "customer" | "seller";
  onClose: () => void;
  onSend: (orderId: string, payload: { text: string; image?: string; authorRole: "customer" | "seller" }) => void;
};

export function ChatModal({ open, order, role, onClose, onSend }: ChatModalProps) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const messages = useMemo(() => order?.chat?.messages || [], [order]);

  if (!order) {
    return null;
  }

  const submit = () => {
    if (!text.trim() && !image) {
      return;
    }

    onSend(order.id, { text, image, authorRole: role });
    setText("");
    setImage(undefined);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  return (
    <Modal open={open} title={`Чат по заказу ${order.id}`} onClose={onClose} wide>
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_320px]">
        <section className="grid max-h-[62vh] content-start gap-3 overflow-y-auto rounded-[8px] bg-milk p-3 sm:p-4">
          {messages.length ? (
            messages.map((message) => {
              const own = message.authorRole === role;

              return (
                <article
                  className={`max-w-[86%] rounded-[8px] p-3 text-sm shadow-sm ${own ? "ml-auto bg-wine text-white" : "bg-white text-ink"}`}
                  key={message.id}
                >
                  <div className={`mb-1 flex items-center justify-between gap-3 text-xs ${own ? "text-white/75" : "text-ink/45"}`}>
                    <span>{message.authorName}</span>
                    <time>{new Date(message.date).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</time>
                  </div>
                  {message.text ? <p className="leading-6">{message.text}</p> : null}
                  {message.image ? (
                    <button
                      className="mt-2 block max-w-full overflow-hidden rounded-[8px] bg-milk"
                      onClick={() => {
                        setPreviewImage(message.image || null);
                        setZoom(1);
                      }}
                      type="button"
                    >
                      <img
                        alt="Фото в чате"
                        className="h-auto max-w-full object-contain"
                        src={message.image}
                      />
                    </button>
                  ) : null}
                </article>
              );
            })
          ) : (
            <p className="rounded-[8px] bg-white p-5 text-sm text-ink/60">Чат появится после оформления заказа.</p>
          )}
        </section>

        <aside className="grid content-start gap-4 rounded-[8px] bg-white p-4">
          <div>
            <h3 className="font-serif text-2xl text-ink">Сообщение</h3>
            <p className="mt-1 text-sm text-ink/55">
              Фото можно отправить вместе с текстом или отдельно.
            </p>
          </div>
          <Textarea label="Текст" onChange={setText} value={text} />
          <input
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) {
                return;
              }

              const reader = new FileReader();
              reader.onload = () => setImage(String(reader.result));
              reader.readAsDataURL(file);
            }}
            ref={fileRef}
            type="file"
          />
          {image ? (
            <div className="relative overflow-hidden rounded-[8px] bg-milk">
              <img alt="Прикрепленное фото" className="h-auto max-h-48 max-w-full object-contain" src={image} />
              <button
                aria-label="Убрать фото"
                className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white text-ink shadow-sm"
                onClick={() => {
                  setImage(undefined);
                  if (fileRef.current) {
                    fileRef.current.value = "";
                  }
                }}
                type="button"
              >
                <X size={16} />
              </button>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <SecondaryButton onClick={() => fileRef.current?.click()}>
              <ImagePlus size={16} />
              Фото
            </SecondaryButton>
            <PrimaryButton onClick={submit} disabled={!text.trim() && !image}>
              <Send size={16} />
              Отправить
            </PrimaryButton>
          </div>
        </aside>
      </div>

      {previewImage ? (
        <div className="fixed inset-0 z-[70] grid bg-ink/90 p-3 sm:p-6" onMouseDown={() => setPreviewImage(null)}>
          <div className="mb-3 flex flex-wrap items-center justify-end gap-2" onMouseDown={(event) => event.stopPropagation()}>
            <button
              aria-label="Уменьшить"
              className="grid size-10 place-items-center rounded-full bg-white text-ink"
              onClick={() => setZoom((value) => Math.max(0.5, Math.round((value - 0.25) * 100) / 100))}
              type="button"
            >
              <ZoomOut size={18} />
            </button>
            <button
              aria-label="Сбросить масштаб"
              className="grid size-10 place-items-center rounded-full bg-white text-ink"
              onClick={() => setZoom(1)}
              type="button"
            >
              <RotateCcw size={18} />
            </button>
            <button
              aria-label="Увеличить"
              className="grid size-10 place-items-center rounded-full bg-white text-ink"
              onClick={() => setZoom((value) => Math.min(4, Math.round((value + 0.25) * 100) / 100))}
              type="button"
            >
              <ZoomIn size={18} />
            </button>
            <button
              aria-label="Закрыть фото"
              className="grid size-10 place-items-center rounded-full bg-white text-ink"
              onClick={() => setPreviewImage(null)}
              type="button"
            >
              <X size={18} />
            </button>
          </div>
          <div className="min-h-0 overflow-auto rounded-[8px] bg-black/20 p-4" onMouseDown={(event) => event.stopPropagation()}>
            <img
              alt="Фото в полном размере"
              className="mx-auto h-auto max-w-none origin-top transition-transform"
              src={previewImage}
              style={{ transform: `scale(${zoom})` }}
            />
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
