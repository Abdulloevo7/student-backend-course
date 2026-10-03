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