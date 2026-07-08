"use client";

type FooterLink = {
  label: string;
  href: string;
};

const catalogLinks: FooterLink[] = [
  { label: "Букеты", href: "#catalog" },
  { label: "Цветы", href: "#catalog" },
  { label: "Собрать букет", href: "#builder" },
  { label: "Подарочные наборы", href: "#catalog" }
];

const serviceLinks: FooterLink[] = [
  { label: "Доставка и оплата", href: "mailto:order@ns-buketno.ru?subject=Доставка и оплата" },
  { label: "Корпоративные заказы", href: "mailto:order@ns-buketno.ru?subject=Корпоративный заказ" },
  { label: "Уход за цветами", href: "mailto:care@ns-buketno.ru?subject=Уход за цветами" },
  { label: "Отзывы", href: "mailto:review@ns-buketno.ru?subject=Отзыв" }
];

export function Footer() {
  return (
    <footer className="mt-8 border-t border-wine/10 bg-white/65">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr] lg:px-8">
        <div>
          <p className="font-serif text-3xl leading-none text-wine">НС Букетно</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-ink/62">
            Цветочный магазин с готовыми букетами, подбором цветов и бережной доставкой по городу.
          </p>
        </div>

        <FooterColumn title="Каталог" links={catalogLinks} />
        <FooterColumn title="Сервис" links={serviceLinks} />

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-ink/55">Контакты</h2>
          <div className="grid gap-2 text-sm">
            <a className="text-ink/70 transition hover:text-wine" href="tel:+79005554433">
              +7 900 555-44-33
            </a>
            <a className="text-ink/70 transition hover:text-wine" href="mailto:order@ns-buketno.ru">
              order@ns-buketno.ru
            </a>
            <a
              className="text-ink/70 transition hover:text-wine"
              href="https://yandex.ru/maps/?text=Москва%2C%20Патриаршие%20пруды%2C%2012"
              rel="noreferrer"
              target="_blank"
            >
              Москва, Патриаршие пруды, 12
            </a>
            <a className="text-ink/70 transition hover:text-wine" href="https://t.me/" rel="noreferrer" target="_blank">
              Telegram
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-wine/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-ink/48 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>© 2026 НС Букетно</span>
          <a className="transition hover:text-wine" href="mailto:privacy@ns-buketno.ru?subject=Политика конфиденциальности">
            Политика конфиденциальности
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-ink/55">{title}</h2>
      <nav className="grid gap-2 text-sm" aria-label={title}>
        {links.map((link) => (
          <a className="text-ink/70 transition hover:text-wine" href={link.href} key={link.label}>
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
