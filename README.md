# НС Букетно

Современный MVP интернет-магазина цветов на Next.js, React, TypeScript, Tailwind CSS и Framer Motion.

## Запуск

```bash
npm install
npm run dev
```

Production-проверка:

```bash
npm run build
```

После `npm run build` статическая версия сайта появляется в папке `out/`.

## Выгрузка на GitHub

```bash
git status
git add .
git commit -m "Prepare flower shop site"
git branch -M main
git remote add origin https://github.com/<username>/<repo-name>.git
git push -u origin main
```

Если `origin` уже добавлен:

```bash
git remote set-url origin https://github.com/<username>/<repo-name>.git
git push -u origin main
```

## Деплой на GitHub Pages

В репозитории на GitHub откройте:

`Settings` -> `Pages` -> `Build and deployment` -> `Source` -> `GitHub Actions`

После push в ветку `main` workflow `.github/workflows/deploy.yml` сам:

- установит зависимости через `npm ci`;
- соберет статический Next.js сайт;
- добавит SPA fallback `404.html`;
- загрузит папку `out/` в GitHub Pages.

Адрес сайта появится во вкладке `Actions` и в `Settings -> Pages`.

## Где что находится

- `components/FlowerStoreApp.tsx` - главный клиентский сценарий: каталог, auth-gate, открытие модалок, корзина, checkout.
- `components/Catalog.tsx` - сетка карточек букетов.
- `components/layout/Header.tsx` - логотип, категории, конструктор, корзина и профиль.
- `components/modals/*` - авторизация, карточка товара, конструктор, корзина, избранное, оформление заказа, профиль.
- `components/CookieBanner.tsx` - cookie-баннер и настройки consent.
- `lib/mock-data.ts` - букеты, цены, цветы для конструктора, упаковки, дополнения, отзывы, тестовый пользователь.
- `lib/use-shop.ts` - состояние корзины, пользователя, заказов, отзывов и localStorage.
- `types/shop.ts` - основные TypeScript-типы.

## Mock-логика

Вход и регистрация не ходят на backend: форма создает тестового пользователя и сохраняет его в `localStorage`.
Если пользователь пытается открыть защищенное действие без входа, приложение показывает auth-модалку, а после входа выполняет исходное действие. Избранное открывается отдельной кнопкой-сердечком рядом с корзиной.

Корзина, пользователь и cookie-настройки сохраняются локально. Mock-оплата создает завершенный заказ, очищает корзину и добавляет заказ в историю профиля.

## Данные и интеграции

Товары, составы, цены и изображения меняются в `lib/mock-data.ts`.
Для настоящего backend замените операции в `lib/use-shop.ts` на API-запросы: auth/session, cart, orders, reviews.
Для реальной оплаты добавьте provider checkout endpoint и вызывайте его из `CheckoutModal` вместо `placeOrder`.
