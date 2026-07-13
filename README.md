# CRM Programming School

CRM-система для обробки заявок на курси. Дві ролі — **admin** (керування менеджерами, статистика) та **manager** (робота із заявками).

## Стек

**Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose), JWT (access/refresh), Joi, ExcelJS, Swagger.
**Frontend**: React, TypeScript, Vite, React Router, React Hook Form, Axios.

## Структура репозиторію

```
backend/    — API сервер
frontend/   — клієнтський застосунок
docs/       — Postman-колекція
dump/       — дамп колекції orders для MongoDB
```

## Передумови

- Node.js 18+
- Доступ до MongoDB (рекомендовано MongoDB Atlas — потрібен connection string)

## Запуск backend

1. Перейти в директорію бекенду:
   ```
   cd backend
   npm install
   ```

2. Створити файл `.env` на основі `.env.example` і заповнити значення:
   ```
   PORT=5000
   MONGODB_URI=<connection string вашого MongoDB Atlas кластера>
   JWT_ACCESS_SECRET=<довільний секретний рядок>
   JWT_REFRESH_SECRET=<довільний секретний рядок>
   JWT_ACCESS_LIFETIME=10m
   JWT_REFRESH_LIFETIME=20m
   JWT_ACTIVATE_SECRET=<довільний секретний рядок>
   JWT_ACTIVATE_LIFETIME=30m
   ADMIN_EMAIL=admin@gmail.com
   ADMIN_PASSWORD=admin
   ```

3. (Опційно) Наповнити базу тестовими заявками з дампу:
   ```
   npm run seed:orders
   ```
   Скрипт читає `dump/orders.dump` і вставляє записи у колекцію `orders`.

4. Запустити сервер у режимі розробки:
   ```
   npm run dev
   ```
   Або зібрати й запустити прод-версію:
   ```
   npm run build
   npm start
   ```

Сервер піднімається на `http://localhost:5000`. При старті автоматично створюється дефолтний admin (`ADMIN_EMAIL` / `ADMIN_PASSWORD` з `.env`), якщо його ще немає в базі.

## Запуск frontend

1. Перейти в директорію фронтенду:
   ```
   cd frontend
   npm install
   ```

2. Перевірити файл `.env` (за замовчуванням вже налаштовано на проксі до бекенду):
   ```
   VITE_API_URL=/api
   ```

3. Запустити застосунок:
   ```
   npm run dev
   ```

Фронтенд піднімається на `http://localhost:3000` і проксіює всі запити `/api/*` на бекенд (`http://localhost:5000`), маршрутизація прописана в `vite.config.ts`.

## Вхід у систему

При переході на хост відкривається сторінка логінації. Дефолтний адміністратор:

- **Email**: `admin@gmail.com`
- **Password**: `admin`

Менеджерів створює адмін через адмін-панель (`/admin`) — після створення потрібно активувати акаунт (кнопка Activate згенерує лінк активації з обмеженим часом дії) і встановити пароль за цим лінком.

## Документація API

- Swagger доступний після запуску бекенду за адресою: `http://localhost:5000/docs`
- Postman-колекція: [`docs/CRM.postman_collection.json`](docs/CRM.postman_collection.json) — містить опис флоу автентифікації та приклади запитів по всіх ендпоінтах (auth, users, orders, groups)

## Дамп бази даних

Дамп заявок знаходиться в [`dump/orders.dump`](dump/orders.dump) і імпортується скриптом `npm run seed:orders` (див. вище).
