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
