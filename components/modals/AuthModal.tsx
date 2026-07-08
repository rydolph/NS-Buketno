"use client";

import { useState } from "react";
import { Field, Modal, PrimaryButton, SecondaryButton } from "@/components/ui";
import type { User } from "@/types/shop";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  onLogin: (payload: { name?: string; email: string; phone?: string }) => User;
  onSuccess: () => void;
};

export function AuthModal({ open, onClose, onLogin, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("Александра");
  const [email, setEmail] = useState("demo@ns-buketno.ru");
  const [phone, setPhone] = useState("+7 900 555-44-33");
  const [password, setPassword] = useState("demo1234");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password) {
      return;
    }

    onLogin({ name, email, phone });
    onSuccess();
  };

  return (
    <Modal open={open} title="Вход в бутик" onClose={onClose}>
      <form className="grid gap-5 p-5 sm:p-6" onSubmit={submit}>
        <div className="grid grid-cols-2 rounded-full bg-milk p-1">
          <button
            className={`rounded-full px-4 py-2 text-sm transition ${mode === "login" ? "bg-white text-wine shadow-sm" : "text-ink/60"}`}
            onClick={() => setMode("login")}
            type="button"
          >
            Вход
          </button>
          <button
            className={`rounded-full px-4 py-2 text-sm transition ${mode === "register" ? "bg-white text-wine shadow-sm" : "text-ink/60"}`}
            onClick={() => setMode("register")}
            type="button"
          >
            Регистрация
          </button>
        </div>

        {mode === "register" ? (
          <>
            <Field label="Имя" onChange={setName} required value={name} />
            <Field label="Телефон" onChange={setPhone} required value={phone} />
          </>
        ) : null}
        <Field label="Email" onChange={setEmail} required type="email" value={email} />
        <Field label="Пароль" onChange={setPassword} required type="password" value={password} />

        <div className="rounded-[8px] bg-rose/10 p-4 text-sm leading-6 text-ink/70">
          Mock-авторизация: можно оставить тестовые данные или ввести любые. После отправки пользователь считается авторизованным.
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <PrimaryButton type="submit">{mode === "login" ? "Войти" : "Создать аккаунт"}</PrimaryButton>
          <SecondaryButton onClick={onClose}>Вернуться в каталог</SecondaryButton>
        </div>
      </form>
    </Modal>
  );
}
