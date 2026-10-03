# Лабораторная работа №2. HTTP-методы: обработка GET, POST, PUT, DELETE

**Студент:** Абдуллоев Орифжон
**Группа:** ПИЖ-б-о-25-1(1)
**Направление:** 09.03.04 «Программная инженерия»
**Вариант:** 1
**Технология:** Node.js + Express

## Содержание

- [Цель работы](#цель-работы)
- [Теоретическое обоснование](#теоретическое-обоснование)
- [Выполнение практического примера](#выполнение-практического-примера)
- [Выполнение индивидуального задания](#выполнение-индивидуального-задания)
- [Ответы на контрольные вопросы](#ответы-на-контрольные-вопросы)
- [Вывод](#вывод)
- [Список использованных источников](#список-использованных-источников)

## Цель работы

Освоить обработку HTTP-методов (GET, POST, PUT, PATCH, DELETE) в Express, реализовать CRUD-операции над коллекцией задач, хранящейся в памяти сервера, и возвращать корректные HTTP-коды ответов (200, 201, 204, 400, 404, 500).



##  Теоретическое обоснование

**CRUD** — четыре базовые операции над данными: Create (POST), Read (GET), Update (PUT/PATCH), Delete (DELETE).

| Метод | Назначение | Идемпотентен  | Коды |
|-------|------------|--------------|-------|
| GET | получить данные | да  | 200, 404 |
| POST | создать ресурс | нет  | 201, 400 |
| PUT | полностью заменить ресурс | да | 200, 404 |
| PATCH | частично обновить ресурс | нет | 200, 404 |
| DELETE | удалить ресурс | да  | 200/204, 404 |

**Коды состояния:** 200 OK, 201 Created, 204 No Content, 400 Bad Request, 404 Not Found, 500 Internal Server Error.

**Хранение в памяти:** данные лежат в массиве в оперативной памяти сервера — просто и быстро, но всё теряется при перезапуске, поэтому для production не подходит.

##  Выполнение практического примера

Команды подготовки проекта:

```bash
mkdir lab2-crud
cd lab2-crud
npm init -y
npm install express
npm install --save-dev nodemon
```
![Терминал сервера](screenshots/Terminal.png)

Скрипты в `package.json`.

```javascript
{
  
  "name": "lab2-crud",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "dependencies": {
    "express": "^5.2.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.14"
  }
}
```
Скрипты в `app-example.js`.

```javascript
const express = require('express');
const app = express();
const port = 3000;
// Middleware для парсинга JSON из тела запроса
app.use(express.json());
// Middleware для логирования запросов
app.use((req, res, next) => {
console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
next();
});
// ============ ХРАНИЛИЩЕ ДАННЫХ В ПАМЯТИ ============
let items = [
{ id: 1, name: 'Товар 1', price: 100, quantity: 5 },
{ id: 2, name: 'Товар 2', price: 200, quantity: 3 },
{ id: 3, name: 'Товар 3', price: 300, quantity: 10 }
];
// Счётчик для генерации новых ID
let nextId = 4;
// ============ CRUD-ОПЕРАЦИИ ============
// GET /items — получить все элементы
app.get('/items', (req, res) => {
res.json({
count: items.length,
items: items
});
});
// GET /items/:id — получить один элемент
app.get('/items/:id', (req, res) => {
const id = parseInt(req.params.id);
const item = items.find(i => i.id === id);
if (!item) {
return res.status(404).json({ error: 'Элемент не найден' });
}
res.json(item);
});
// POST /items — создать новый элемент
app.post('/items', (req, res) => {
const { name, price, quantity } = req.body;
// Валидация: обязательные поля
if (!name || price === undefined) {
return res.status(400).json({
error: 'Поля name и price обязательны'
});
}
// Создаём новый элемент
const newItem = {
id: nextId++,
name: name,
price: price,
quantity: quantity || 0
};
items.push(newItem);
// 201 Created — ресурс создан
res.status(201).json(newItem);
});
// PUT /items/:id — обновить элемент
app.put('/items/:id', (req, res) => {
const id = parseInt(req.params.id);
const index = items.findIndex(i => i.id === id);
if (index === -1) {
return res.status(404).json({ error: 'Элемент не найден' });
}
const { name, price, quantity } = req.body;
// Полное обновление
items[index] = {
id: id,
name: name || items[index].name,
price: price !== undefined ? price : items[index].price,
quantity: quantity !== undefined ? quantity : items[index].quantity
};
res.json(items[index]);
});
// DELETE /items/:id — удалить элемент
app.delete('/items/:id', (req, res) => {
const id = parseInt(req.params.id);
const index = items.findIndex(i => i.id === id);
if (index === -1) {
return res.status(404).json({ error: 'Элемент не найден' });
}
const deletedItem = items.splice(index, 1)[0];
// 200 OK с удалённым элементом
res.json({
message: 'Элемент удалён',
deleted: deletedItem
});
});
// ============ ОБРАБОТКА 404 ============
app.use((req, res) => {
res.status(404).json({ error: 'Маршрут не найден' });
});
// ============ ЗАПУСК СЕРВЕРА ============
app.listen(port, () => {
console.log(`Сервер запущен на http://localhost:${port}`);
})

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
```

**Скриншоты запросов:**
![GET /items](screenshots/get-items.png)
*Рисунок 1 — список всех товаров через GET-запрос*

![GET /items/2](screenshots/get-item-by-id.png)
*Рисунок 2 — получение одного товара по ID*

![POST /items](screenshots/post-item.png)
*Рисунок 3 — создание нового товара через POST-запрос*

![PUT /items/1](screenshots/put-item.png)
*Рисунок 4 — обновление товара через PUT-запрос*

![DELETE /items/3](screenshots/delete-item.png)
*Рисунок 5 — удаление товара через DELETE-запрос*

![GET /items](screenshots/updated-tasks.png)
*Рисунок 6 — список товаров после выполнения всех операций*

##  Индивидуальное задание (вариант 1, продвинутый уровень)

**Сущность:** задача (tasks) — `id`, `title`, `done` + `priority` (low/medium/high), `deadline` (YYYY-MM-DD или null).

### Реализованные эндпоинты

| Метод и путь | Описание | Успех | Ошибки |
|--------------|----------|-------|--------|
| GET /items | список; `?search=`, `?sort=&order=`, `?page=&limit=` | 200 | 400 |
| GET /items/:id | одна задача | 200 | 404 |
| POST /items | создание | 201 | 400 |
| PUT /items/:id | полная замена | 200 | 400, 404 |
| PATCH /items/:id | частичное обновление | 200 | 400, 404 |
| DELETE /items/:id | удаление одной | 204 | 404 |
| DELETE /items | удаление всех | 204 | — |
| POST /items/bulk | массовое создание | 201 | 400 |
| GET /items/stats | статистика (кол-во выполненных) | 200 | — |
| GET /items/:id/related | задачи с тем же приоритетом | 200 | 404 |
| GET /error-test | демонстрация обработчика 500 | — | 500 |

Дополнительно: валидация типов и допустимых значений, логирование в `access.log`, глобальный обработчик ошибок, лимит тела запроса 10 КБ.

### Код сервера

```javascript
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// ============ MIDDLEWARE ============

// Парсинг JSON + защита от слишком больших запросов (лимит 10 КБ)
app.use(express.json({ limit: '10kb' }));

// Логирование запросов: в консоль и в файл access.log
const logFile = path.join(__dirname, 'access.log');
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const line = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start} ms)\n`;
    process.stdout.write(line);
    fs.appendFile(logFile, line, (err) => {
      if (err) console.error('Ошибка записи в access.log:', err.message);
    });
  });
  next();
});

// ============ ХРАНИЛИЩЕ ДАННЫХ В ПАМЯТИ ============
// Сущность: Задачи (tasks). Поля: id, title, done + priority, deadline
let items = [
  { id: 1, title: 'Сделать ЛР №2', done: false, priority: 'high', deadline: '2026-10-05' },
  { id: 2, title: 'Изучить HTTP-методы', done: true, priority: 'medium', deadline: '2026-09-30' },
  { id: 3, title: 'Оформить отчёт', done: false, priority: 'high', deadline: '2026-10-07' },
  { id: 4, title: 'Купить продукты', done: false, priority: 'low', deadline: null }
];
let nextId = 5;

const PRIORITIES = ['low', 'medium', 'high'];
const SORT_FIELDS = ['id', 'title', 'done', 'priority', 'deadline'];

// ============ ВАЛИДАЦИЯ ============
// Возвращает массив ошибок. partial=true — для PATCH (поля необязательны)
function validateTask(body, partial = false) {
  const errors = [];

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return ['Тело запроса должно быть JSON-объектом'];
  }

  if (body.title !== undefined || !partial) {
    if (typeof body.title !== 'string' || body.title.trim() === '') {
      errors.push('title обязателен и должен быть непустой строкой');
    }
  }
  if (body.done !== undefined && typeof body.done !== 'boolean') {
    errors.push('done должно быть булевым значением (true/false)');
  }
  if (body.priority !== undefined && !PRIORITIES.includes(body.priority)) {
    errors.push(`priority должно быть одним из: ${PRIORITIES.join(', ')}`);
  }
  if (body.deadline !== undefined && body.deadline !== null) {
    if (typeof body.deadline !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.deadline) || isNaN(Date.parse(body.deadline))) {
      errors.push('deadline должен быть датой в формате YYYY-MM-DD или null');
    }
  }
  return errors;
}

// Собирает полный объект задачи (с значениями по умолчанию)
function buildTask(id, body) {
  return {
    id,
    title: body.title.trim(),
    done: body.done !== undefined ? body.done : false,
    priority: body.priority !== undefined ? body.priority : 'medium',
    deadline: body.deadline !== undefined ? body.deadline : null
  };
}

// ============ CRUD-ОПЕРАЦИИ ============
// ВАЖНО: маршруты /items/stats и /items/bulk объявлены ДО /items/:id

// GET /items — список (поиск, сортировка, пагинация)
// Примеры: /items?search=отчёт  /items?sort=deadline&order=desc  /items?page=1&limit=2
app.get('/items', (req, res) => {
  const { search, sort, order = 'asc' } = req.query;
  let result = [...items];

  // Поиск по названию (без учёта регистра)
  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(i => i.title.toLowerCase().includes(q));
  }

  // Сортировка
  if (sort !== undefined) {
    if (!SORT_FIELDS.includes(sort)) {
      return res.status(400).json({ error: `sort должен быть одним из: ${SORT_FIELDS.join(', ')}` });
    }
    if (!['asc', 'desc'].includes(order)) {
      return res.status(400).json({ error: 'order должен быть asc или desc' });
    }
    const dir = order === 'asc' ? 1 : -1;
    result.sort((a, b) => {
      const x = a[sort];
      const y = b[sort];
      if (x === y) return 0;
      if (x === null) return 1;   // null (нет дедлайна) всегда в конце
      if (y === null) return -1;
      return (x > y ? 1 : -1) * dir;
    });
  }

  // Пагинация
  const total = result.length;
  if (req.query.page !== undefined || req.query.limit !== undefined) {
    const page = parseInt(req.query.page ?? '1');
    const limit = parseInt(req.query.limit ?? '10');
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({ error: 'page >= 1, limit от 1 до 100' });
    }
    const pages = Math.max(1, Math.ceil(total / limit));
    result = result.slice((page - 1) * limit, page * limit);
    return res.json({ total, page, limit, pages, count: result.length, items: result });
  }

  res.json({ count: result.length, items: result });
});

// GET /items/stats — статистика: количество выполненных задач
app.get('/items/stats', (req, res) => {
  const done = items.filter(i => i.done).length;
  const byPriority = { low: 0, medium: 0, high: 0 };
  items.forEach(i => byPriority[i.priority]++);
  res.json({
    total: items.length,
    done,
    notDone: items.length - done,
    byPriority
  });
});

// POST /items/bulk — создать несколько задач за раз (всё или ничего)
app.post('/items/bulk', (req, res) => {
  const list = req.body;
  if (!Array.isArray(list) || list.length === 0) {
    return res.status(400).json({ error: 'Ожидается непустой массив задач' });
  }
  if (list.length > 100) {
    return res.status(400).json({ error: 'За один запрос можно создать не более 100 задач' });
  }

  const errors = [];
  list.forEach((body, index) => {
    const errs = validateTask(body);
    if (errs.length) errors.push({ index, errors: errs });
  });
  if (errors.length) {
    return res.status(400).json({ error: 'Ошибка валидации', details: errors });
  }

  const created = list.map(body => {
    const task = buildTask(nextId++, body);
    items.push(task);
    return task;
  });
  res.status(201).json({ count: created.length, items: created });
});

// GET /items/:id — одна задача
app.get('/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const item = items.find(i => i.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Элемент не найден' });
  }
  res.json(item);
});

// GET /items/:id/related — связанные задачи (с тем же приоритетом)
app.get('/items/:id/related', (req, res) => {
  const id = parseInt(req.params.id);
  const item = items.find(i => i.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Элемент не найден' });
  }
  const related = items.filter(i => i.priority === item.priority && i.id !== id);
  res.json({ priority: item.priority, count: related.length, items: related });
});

// POST /items — создать задачу
app.post('/items', (req, res) => {
  const errors = validateTask(req.body);
  if (errors.length) {
    return res.status(400).json({ error: 'Ошибка валидации', details: errors });
  }
  const newItem = buildTask(nextId++, req.body);
  items.push(newItem);
  res.status(201).json(newItem);
});

// PUT /items/:id — полная замена задачи
app.put('/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = items.findIndex(i => i.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Элемент не найден' });
  }
  const errors = validateTask(req.body);
  if (errors.length) {
    return res.status(400).json({ error: 'Ошибка валидации', details: errors });
  }
  items[index] = buildTask(id, req.body);
  res.json(items[index]);
});

// PATCH /items/:id — частичное обновление (только переданные поля)
app.patch('/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = items.findIndex(i => i.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Элемент не найден' });
  }
  const errors = validateTask(req.body, true);
  if (errors.length) {
    return res.status(400).json({ error: 'Ошибка валидации', details: errors });
  }
  const { title, done, priority, deadline } = req.body;
  const patch = {};
  if (title !== undefined) patch.title = title.trim();
  if (done !== undefined) patch.done = done;
  if (priority !== undefined) patch.priority = priority;
  if (deadline !== undefined) patch.deadline = deadline;

  items[index] = { ...items[index], ...patch, id }; // id менять нельзя
  res.json(items[index]);
});

// DELETE /items — удалить ВСЕ задачи
app.delete('/items', (req, res) => {
  items = [];
  res.status(204).send();
});

// DELETE /items/:id — удалить одну задачу
app.delete('/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = items.findIndex(i => i.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Элемент не найден' });
  }
  items.splice(index, 1);
  res.status(204).send(); // 204 No Content — без тела
});

// Служебный маршрут для демонстрации обработчика 500 (для скриншота)
app.get('/error-test', () => {
  throw new Error('Тестовая ошибка сервера');
});

// ============ ОБРАБОТКА 404 ============
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// ============ ГЛОБАЛЬНЫЙ ОБРАБОТЧИК ОШИБОК (500) ============
// Должен быть последним и принимать 4 аргумента
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Некорректный JSON в теле запроса' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Тело запроса слишком большое' });
  }
  console.error('Необработанная ошибка:', err.message);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// ============ ЗАПУСК СЕРВЕРА ============
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
```

### Скриншоты выполнения

![GET /items](screenshots/items-get-all.png)
*Рисунок 7 — список всех задач*

![GET /items с поиском](screenshots/items-search.png)
*Рисунок 8 — поиск задач по названию (search)*

![GET /items с сортировкой](screenshots/items-sort.png)
*Рисунок 9 — сортировка задач по дедлайну*

![GET /items с пагинацией](screenshots/items-pagination.png)
*Рисунок 10 — постраничный вывод задач (page, limit)*

![GET /items/1](screenshots/items-get-by-id.png)
*Рисунок 11 — получение одной задачи по ID*

![GET /items/999](screenshots/items-404.png)
*Рисунок 12 — ошибка 404 при запросе несуществующей задачи*

![POST /items](screenshots/items-post-201.png)
*Рисунок 13 — создание новой задачи (201 Created)*

![POST /items с ошибкой](screenshots/items-post-400.png)
*Рисунок 14 — ошибка 400 при некорректных данных*

![POST /items/bulk](screenshots/items-bulk.png)
*Рисунок 15 — массовое создание задач*

![PUT /items/1](screenshots/items-put.png)
*Рисунок 16 — полное обновление задачи*

![PATCH /items/1](screenshots/items-patch.png)
*Рисунок 17 — частичное обновление задачи (поле done)*

![DELETE /items/2](screenshots/items-delete-one.png)
*Рисунок 18 — удаление одной задачи (204 No Content)*

![DELETE /items](screenshots/items-delete-all.png)
*Рисунок 19 — удаление всех задач*

![UPDATES /items](screenshots/updated-all-items.png)
*Рисунок 20 —  все задачи после удаление*

![GET /items/stats](screenshots/items-stats.png)
*Рисунок 21— статистика по задачам*

![GET /items/1/related](screenshots/items-related.png)
*Рисунок 22— связанные задачи с тем же приоритетом*

![GET /error-test](screenshots/items-error-500.png)
*Рисунок 23 — демонстрация обработки ошибки 500*

![TERMINAL](screenshots/terminal-advenced.png)
*Рисунок 24 —  терминал после выполнение всех задач*

Содержимое файла access.log:

![Содержимое файла access.log](screenshots/access-log.png)

##  Ответы на контрольные вопросы 

**1. Как реализовать частичное обновление (PATCH)?**
Найти элемент по id, провалидировать только пришедшие поля и слить их с существующим объектом: `items[i] = { ...items[i], ...patch }`. Непереданные поля остаются без изменений.

**2. Как реализовать массовое удаление?**
Маршрут `DELETE /items`, который очищает массив (`items = []`) и возвращает 204. Можно также принимать список id в запросе и фильтровать массив.

**3. Как реализовать массовое создание?**
Маршрут `POST /items/bulk` принимает массив объектов. Сначала валидируются все элементы, и только если ошибок нет — все добавляются с новыми id. Так операция выполняется по принципу «всё или ничего». Маршрут должен быть объявлен выше `/items/:id`.

**4. Как реализовать глобальный обработчик ошибок?**
Middleware с четырьмя аргументами `(err, req, res, next)`, объявленный последним. Он логирует ошибку и возвращает клиенту 500 с общим сообщением, не раскрывая внутренних деталей.

**5. Как логировать запросы в файл?**
Middleware, который на событии `res.on('finish')` формирует строку (время, метод, URL, статус) и дописывает её в файл через `fs.appendFile`.

**6. Что такое REST API и его принципы?**
Архитектурный стиль, где ресурсы адресуются URL, а действия над ними задаются HTTP-методами. Принципы: клиент-серверная архитектура, отсутствие состояния на сервере между запросами (stateless), единообразный интерфейс, кэшируемость, слоистость системы.

**7. Как защитить API от слишком больших запросов?**
Ограничить размер тела: `express.json({ limit: '10kb' })` — при превышении вернётся 413. Дополнительно — ограничение числа элементов в bulk-запросе, лимит `limit` при пагинации и rate limiting.

##  Вывод

_Что сделано:_ реализован REST-подобный API для задач со всеми CRUD-операциями, PATCH, массовыми операциями, поиском, сортировкой, пагинацией, статистикой, связанными задачами, логированием в файл и глобальной обработкой ошибок.

_Что нового узнал:_ Разобрался, в чём разница между PUT и PATCH: PUT полностью заменяет ресурс и требует все поля, а PATCH меняет только то, что прислали в запросе. Понял, что такое идемпотентность — повторный GET, PUT или DELETE с теми же параметрами даёт одинаковый результат, а POST каждый раз создаёт новый ресурс. Узнал, что порядок объявления маршрутов в Express важен: более конкретные пути (например, /items/stats) нужно объявлять раньше, чем динамические (/items/:id), иначе Express примет "stats" за значение id. Также разобрался, как работает middleware для глобальной обработки ошибок — функция с четырьмя аргументами (err, req, res, next), которая должна стоять последней в цепочке middleware.

_Трудности:_ Сложнее всего было понять правильный порядок маршрутов, чтобы /items/stats и /items/bulk не перехватывались обработчиком /items/:id. Также пришлось разобраться с валидацией данных для PATCH-запроса, где поля не обязательны — важно было проверять только те поля, которые реально пришли в теле запроса, а не требовать все сразу, как в POST и PUT.

## 7. Список использованных источников

1. Express — Routing. https://expressjs.com/en/guide/routing.html
2. Express 4.x — API Reference. https://expressjs.com/en/4x/api.html
3. MDN — HTTP-методы. https://developer.mozilla.org/ru/docs/Web/HTTP/Methods
4. MDN — Коды состояния HTTP. https://developer.mozilla.org/ru/docs/Web/HTTP/Status
5. REST API Tutorial. https://restfulapi.net/
