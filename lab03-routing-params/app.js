const express = require('express');

const app = express();
const port = 3000;

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ip = (req.ip || '').replace('::ffff:', '');
    console.log(`[${new Date().toISOString()}] ${ip} ${req.method} ${req.originalUrl} -> ${res.statusCode} ${Date.now() - start} ms`);
  });
  next();
});

const projects = [
  { id: 1, name: 'Учёба' },
  { id: 2, name: 'Дом' },
  { id: 3, name: 'Работа' }
];

const tasks = [
  { id: 1, title: 'Сделать ЛР №2', done: true, priority: 'high', deadline: '2026-10-05', projectId: 1 },
  { id: 2, title: 'Изучить HTTP-методы', done: true, priority: 'medium', deadline: '2026-09-30', projectId: 1 },
  { id: 3, title: 'Оформить отчёт', done: false, priority: 'high', deadline: '2026-10-07', projectId: 1 },
  { id: 4, title: 'Купить продукты', done: false, priority: 'low', deadline: null, projectId: 2 },
  { id: 5, title: 'Сделать ЛР №3', done: false, priority: 'high', deadline: '2026-11-15', projectId: 1 },
  { id: 6, title: 'Убраться в комнате', done: false, priority: 'medium', deadline: '2026-11-10', projectId: 2 },
  { id: 7, title: 'Подготовить презентацию', done: false, priority: 'medium', deadline: '2026-11-20', projectId: 3 },
  { id: 8, title: 'Ответить на письма', done: true, priority: 'low', deadline: null, projectId: 3 }
];

const comments = [
  { id: 1, taskId: 1, author: 'Анна', text: 'Не забудь про скриншоты' },
  { id: 2, taskId: 1, author: 'Иван', text: 'Проверь коды ответов' },
  { id: 3, taskId: 3, author: 'Анна', text: 'Добавить вывод' },
  { id: 4, taskId: 5, author: 'Иван', text: 'Сначала сделай маршруты' },
  { id: 5, taskId: 5, author: 'Анна', text: 'Потом валидацию' }
];

const PRIORITIES = ['low', 'medium', 'high'];
const PRIORITY_RANK = { low: 1, medium: 2, high: 3 };
const SORT_FIELDS = ['id', 'title', 'priority', 'deadline'];
const FILTER_FIELDS = ['done', 'priority'];

function isPositiveInt(value) {
  return typeof value === 'string' && /^\d+$/.test(value) && Number(value) >= 1;
}

// Проверяет все перечисленные параметры пути. При ошибке сразу отвечает 400 и возвращает null
function readIds(req, res, ...names) {
  const ids = {};
  for (const name of names) {
    const value = req.params[name];
    if (!isPositiveInt(value)) {
      res.status(400).json({
        error: `${name} должен быть положительным целым числом`,
        received: value
      });
      return null;
    }
    ids[name] = Number(value);
  }
  return ids;
}

function findProject(res, projectId) {
  const project = projects.find(p => p.id === projectId);
  if (!project) {
    res.status(404).json({ error: `Проект с id=${projectId} не найден` });
    return null;
  }
  return project;
}

function findTask(res, taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    res.status(404).json({ error: `Задача с id=${taskId} не найдена` });
    return null;
  }
  return task;
}

function findTaskInProject(res, projectId, taskId) {
  if (!findProject(res, projectId)) return null;
  const task = tasks.find(t => t.id === taskId && t.projectId === projectId);
  if (!task) {
    res.status(404).json({ error: `Задача с id=${taskId} не найдена в проекте ${projectId}` });
    return null;
  }
  return task;
}

// Поиск, фильтрация, сортировка и пагинация. Возвращает { error } или готовый ответ
function queryTasks(list, query) {
  const { search, filter, sort, order = 'asc' } = query;
  let result = [...list];

  if (search !== undefined) {
    if (typeof search !== 'string' || search.length > 100) {
      return { error: 'search должен быть строкой длиной до 100 символов' };
    }
    const q = search.toLowerCase();
    result = result.filter(t => t.title.toLowerCase().includes(q));
  }

  if (filter !== undefined) {
    const filters = Array.isArray(filter) ? filter : [filter];
    for (const f of filters) {
      const sep = typeof f === 'string' ? f.indexOf(':') : -1;
      if (sep < 1) {
        return { error: 'filter должен иметь вид поле:значение, например filter=done:false' };
      }
      const field = f.slice(0, sep);
      const value = f.slice(sep + 1);
      if (!FILTER_FIELDS.includes(field)) {
        return { error: `фильтровать можно по полям: ${FILTER_FIELDS.join(', ')}` };
      }
      if (field === 'done' && !['true', 'false'].includes(value)) {
        return { error: 'для поля done допустимы значения true и false' };
      }
      if (field === 'priority' && !PRIORITIES.includes(value)) {
        return { error: `для поля priority допустимы значения: ${PRIORITIES.join(', ')}` };
      }
      result = result.filter(t => String(t[field]) === value);
    }
  }

  if (!['asc', 'desc'].includes(order)) {
    return { error: 'order должен быть asc или desc' };
  }
  if (sort !== undefined) {
    if (!SORT_FIELDS.includes(sort)) {
      return { error: `sort должен быть одним из: ${SORT_FIELDS.join(', ')}` };
    }
    const dir = order === 'asc' ? 1 : -1;
    const key = t => (sort === 'priority' ? PRIORITY_RANK[t.priority] : t[sort]);
    result.sort((a, b) => {
      const x = key(a);
      const y = key(b);
      if (x === y) return 0;
      if (x === null) return 1;
      if (y === null) return -1;
      return (x > y ? 1 : -1) * dir;
    });
  }

  const { page: rawPage = '1', limit: rawLimit = '10' } = query;
  if (!isPositiveInt(rawPage)) {
    return { error: 'page должен быть целым числом не меньше 1' };
  }
  if (!isPositiveInt(rawLimit) || Number(rawLimit) > 100) {
    return { error: 'limit должен быть целым числом от 1 до 100' };
  }
  const page = Number(rawPage);
  const limit = Number(rawLimit);
  const start = (page - 1) * limit;

  return {
    count: result.length,
    page,
    limit,
    totalPages: Math.ceil(result.length / limit),
    items: result.slice(start, start + limit)
  };
}

function sendList(res, list, query) {
  const out = queryTasks(list, query);
  if (out.error) return res.status(400).json({ error: out.error });
  res.json(out);
}

// /tasks/stats объявлен раньше /tasks/:id, иначе stats попадёт в параметр id
app.get('/tasks', (req, res) => {
  sendList(res, tasks, req.query);
});

app.get('/tasks/stats', (req, res) => {
  const done = tasks.filter(t => t.done).length;
  const byPriority = { low: 0, medium: 0, high: 0 };
  tasks.forEach(t => byPriority[t.priority]++);

  const deadlines = tasks.map(t => t.deadline).filter(d => d !== null).sort();
  const perTask = tasks.map(t => comments.filter(c => c.taskId === t.id).length);

  res.json({
    total: tasks.length,
    done,
    notDone: tasks.length - done,
    byPriority,
    deadline: {
      earliest: deadlines[0] ?? null,
      latest: deadlines[deadlines.length - 1] ?? null
    },
    comments: {
      total: comments.length,
      average: Number((comments.length / tasks.length).toFixed(2)),
      min: Math.min(...perTask),
      max: Math.max(...perTask)
    }
  });
});

app.get('/tasks/:id', (req, res) => {
  const ids = readIds(req, res, 'id');
  if (!ids) return;
  const task = findTask(res, ids.id);
  if (!task) return;
  res.json(task);
});

app.get('/tasks/:id/comments', (req, res) => {
  const ids = readIds(req, res, 'id');
  if (!ids) return;
  const task = findTask(res, ids.id);
  if (!task) return;
  const list = comments.filter(c => c.taskId === task.id);
  res.json({ taskId: task.id, count: list.length, items: list });
});

app.get('/tasks/:id/related', (req, res) => {
  const ids = readIds(req, res, 'id');
  if (!ids) return;
  const task = findTask(res, ids.id);
  if (!task) return;
  const related = tasks.filter(t => t.priority === task.priority && t.id !== task.id);
  res.json({ taskId: task.id, priority: task.priority, count: related.length, items: related });
});

app.get('/projects/:projectId/tasks', (req, res) => {
  const ids = readIds(req, res, 'projectId');
  if (!ids) return;
  if (!findProject(res, ids.projectId)) return;
  sendList(res, tasks.filter(t => t.projectId === ids.projectId), req.query);
});

app.get('/projects/:projectId/tasks/:taskId', (req, res) => {
  const ids = readIds(req, res, 'projectId', 'taskId');
  if (!ids) return;
  const task = findTaskInProject(res, ids.projectId, ids.taskId);
  if (!task) return;
  res.json(task);
});

app.get('/projects/:projectId/tasks/:taskId/comments/:commentId', (req, res) => {
  const ids = readIds(req, res, 'projectId', 'taskId', 'commentId');
  if (!ids) return;
  const task = findTaskInProject(res, ids.projectId, ids.taskId);
  if (!task) return;
  const comment = comments.find(c => c.id === ids.commentId && c.taskId === task.id);
  if (!comment) {
    return res.status(404).json({
      error: `Комментарий с id=${ids.commentId} не найден у задачи ${task.id}`
    });
  }
  res.json({ projectId: ids.projectId, taskId: task.id, comment });
});

app.get('/error-test', () => {
  throw new Error('Тестовая ошибка сервера');
});

// Wildcard: срабатывает для любого пути, который не совпал ни с одним маршрутом выше
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден', method: req.method, path: req.originalUrl });
});

// Глобальный обработчик ошибок: четыре аргумента и самый конец цепочки
app.use((err, req, res, next) => {
  console.error('Необработанная ошибка:', err.message);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
