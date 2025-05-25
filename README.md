# UPM-system

Система управления дронами и заявками на полёты с веб-интерфейсом на React и бекендом на Node.js + Express + TypeORM.

## Функционал

* Управление дронами (CRUD)
* Управление пилотами (CRUD)
* Создание и обработка заявок на полёты
* Отображение карты и текущего положения дронов
* Геопространственные запросы с использованием PostGIS

## Технологии

* **Backend**: Node.js, Express, TypeORM, PostgreSQL, PostGIS
* **Frontend**: React, Vite, MapLibre-GL, TailwindCSS
* **База данных**: PostgreSQL с расширением PostGIS

## Предварительные требования

* Docker и Docker Compose
* Node.js (>=16)
* npm или yarn

## Установка и запуск

1. Клонировать репозиторий:

   ```bash
   git clone https://github.com/Magurin/UPM-system.git
   cd UPM-system
   ```

2. Запустить контейнер с базой PostgreSQL + PostGIS:

   ```bash
   docker run --name upm-postgres \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=secret \
     -e POSTGRES_DB=upm \
     -p 5432:5432 \
     -d postgis/postgis:15-3.4
   ```

3. Настроить файл окружения `.env` в корне бекенда:

   ```dotenv
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASS=secret
   DB_NAME=upm
   JWT_SECRET=your_jwt_secret
   ```

4. Установить зависимости и запустить сервер:

   ```bash
   cd server
   npm install
   npm run dev
   ```

5. Установить зависимости и запустить фронтенд:

   ```bash
   cd client
   npm install
   npm run dev
   ```

## Структура проекта

```
UPM-system/
├── server/        # Бекенд (Express + TypeORM)
├── client/        # Фронтенд (React + MapLibre)
└── README.md      # Документация проекта
```

## Использование

* API доступен по умолчанию на `http://localhost:5000/api`
* Фронтенд доступен на `http://localhost:5173`

### Примеры запросов

* Получить список дронов:

  ```bash
  GET http://localhost:5000/api/drones
  ```
* Создать нового пилота:

  ```bash
  POST http://localhost:5000/api/pilots
  Content-Type: application/json

  {
    "firstName": "Иван",
    "lastName": "Иванов"
  }
  ```

## Контрибьюция

1. Форкните репозиторий
2. Создайте ветку `feature/ваша-фича`
3. Сделайте изменения и закоммитьте их
4. Откройте Pull Request

### Лицензия

MIT © Magurin
