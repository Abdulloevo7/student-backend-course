const express = require('express');

const app = express();
const port = 3000;

app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const cities = [
  { id: 1, name: 'Москва', population: 13000000, country: 'Россия', area: 2561 },
  { id: 2, name: 'Санкт-Петербург', population: 5600000, country: 'Россия', area: 1439 },
  { id: 3, name: 'Новосибирск', population: 1600000, country: 'Россия', area: 505 },
  { id: 4, name: 'Екатеринбург', population: 1500000, country: 'Россия', area: 1112 },
  { id: 5, name: 'Казань', population: 1250000, country: 'Россия', area: 425 }
];

app.get('/cities', (req, res) => {
  let result = [...cities];

  const search = req.query.search;
  if (search) {
    result = result.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  }

  const country = req.query.country;
  if (country) {
    result = result.filter(c => c.country.toLowerCase() === country.toLowerCase());
  }

  const sort = req.query.sort;
  const order = req.query.order || 'asc';
  const allowedSortFields = ['id', 'name', 'population', 'area'];
  if (sort) {
    if (!allowedSortFields.includes(sort)) {
      return res.status(400).json({
        error: `Поле сортировки должно быть одним из: ${allowedSortFields.join(', ')}`
      });
    }
    if (!['asc', 'desc'].includes(order)) {
      return res.status(400).json({ error: 'Параметр order должен быть asc или desc' });
    }
    result.sort((a, b) => (order === 'desc'
      ? (a[sort] < b[sort] ? 1 : -1)
      : (a[sort] > b[sort] ? 1 : -1)));
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  if (page < 1) return res.status(400).json({ error: 'page должен быть >= 1' });
  if (limit < 1 || limit > 100) {
    return res.status(400).json({ error: 'limit должен быть от 1 до 100' });
  }

  const start = (page - 1) * limit;
  const paginated = result.slice(start, start + limit);

  res.json({
    count: result.length,
    page,
    limit,
    totalPages: Math.ceil(result.length / limit),
    cities: paginated
  });
});

app.get('/cities/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID должен быть числом' });
  }
  const city = cities.find(c => c.id === id);
  if (!city) {
    return res.status(404).json({ error: 'Город не найден' });
  }
  res.json(city);
});

app.get('/cities/:id/area', (req, res) => {
  const id = parseInt(req.params.id);
  const city = cities.find(c => c.id === id);
  if (!city) {
    return res.status(404).json({ error: 'Город не найден' });
  }
  res.json({ city: city.name, area: city.area, unit: 'км²' });
});

app.get('/cities/:id/details', (req, res) => {
  const id = parseInt(req.params.id);
  const city = cities.find(c => c.id === id);
  if (!city) {
    return res.status(404).json({ error: 'Город не найден' });
  }
  const districts = [
    { id: 1, name: 'Центральный', cityId: id },
    { id: 2, name: 'Северный', cityId: id }
  ];
  res.json({ city, districts, attractions: ['Кремль', 'Парк', 'Музей'] });
});

app.get('/countries/:country/cities', (req, res) => {
  const country = req.params.country;
  const filtered = cities.filter(c => c.country.toLowerCase() === country.toLowerCase());
  res.json({ country, count: filtered.length, cities: filtered });
});

app.get('/countries/:country/cities/:cityId', (req, res) => {
  const { country, cityId } = req.params;
  const id = parseInt(cityId);
  const city = cities.find(c => c.id === id && c.country.toLowerCase() === country.toLowerCase());
  if (!city) {
    return res.status(404).json({ error: `Город с ID=${cityId} не найден в стране ${country}` });
  }
  res.json({ country, city });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
