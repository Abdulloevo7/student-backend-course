const express = require('express');
const app = express();
const port = 3000;

// --- Middleware: консольное логирование каждого запроса (метод + URL + время) ---
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// =====================================================
// БАЗОВЫЙ УРОВЕНЬ
// =====================================================

// 1. Текстовый эндпоинт на корневом маршруте
app.get('/', (req, res) => {
  res.send('Добро пожаловать!');
});

// 2. JSON-эндпоинт (вариант 1)
app.get('/api/time', (req, res) => {
  res.json({ time: '12:00', timezone: 'UTC' });
});

// =====================================================
// СРЕДНИЙ УРОВЕНЬ
// =====================================================

// JSON-эндпоинт "сущность" — статический список пользователей
app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'Иван Иванов', role: 'admin' },
    { id: 2, name: 'Мария Петрова', role: 'editor' },
    { id: 3, name: 'Алексей Смирнов', role: 'viewer' }
  ]);
});

// JSON-эндпоинт "справочник" — список ролей
app.get('/api/roles', (req, res) => {
  res.json([
    { id: 1, title: 'admin', description: 'Полный доступ к системе' },
    { id: 2, title: 'editor', description: 'Может редактировать контент' },
    { id: 3, title: 'viewer', description: 'Только просмотр' }
  ]);
});

// =====================================================
// ПРОДВИНУТЫЙ УРОВЕНЬ
// =====================================================

// Сущность 1 (коллекция) — задачи
app.get('/api/tasks', (req, res) => {
  res.json([
    { id: 1, title: 'Настроить окружение', projectId: 1, done: true },
    { id: 2, title: 'Написать сервер', projectId: 1, done: false },
    { id: 3, title: 'Подготовить отчёт', projectId: 2, done: false }
  ]);
});

// Сущность 2 (коллекция) — проекты
app.get('/api/projects', (req, res) => {
  res.json([
    { id: 1, name: 'Лабораторная работа №1', status: 'in progress' },
    { id: 2, name: 'Курсовая работа', status: 'planned' }
  ]);
});

// Эндпоинт с параметром в пути — задача по id
app.get('/api/tasks/:id', (req, res) => {
  res.json({
    requestedId: Number(req.params.id),
    status: 'success'
  });
});

// --- Обработка 404 (должна идти последней) ---
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
