# Введение в бэкенд разработку

**Студент:** Абдуллоев Орифжон
**Группа:** ПИЖ-б-о-25-1(1)
**Направление:** 09.03.04 «Программная инженерия»

## Список лабораторных работ
 
| № | Тема | Статус |
|---|------|--------|
| 1 | [Настройка среды разработки и первый HTTP-сервер](./lab1-first-http-server) | ✅ |
| 2 | [HTTP методы](./lab2-http-methods)| Х |
| 3 | [Маршрутизация и параметры](./lab3-routing-params)| Х |
| 4 | [Основы SQL](./lab4-sql-basics)| Х |
| 5 | [SQL с сервера](./lab5-sql-from-server)| Х |
| 6 | [CRUD операции с базой данных](./lab6-crud-database)| Х |
| 7 | [Фильтрация SQL](./lab7-sql-filtering)| Х |
| 8 | [SQL JOIN](./lab8-sql-joins)| Х |
| 9 | [Проектирование REST API](./lab9-rest-api-design)| Х |
| 10 | [Валидация данных](./lab10-validation)| Х |
| 11 | [Хеширование паролей](./lab11-password-hashing)| Х |
| 12 | [Аутентификация через сессии](./lab12-session-auth)| Х |
| 13 | [Конфигурация через переменные окружения](./lab13-env-config)| Х |
| 14 | [Логирование](./lab14-logging)| Х |
| 15 | [Тестирование в Postman](./lab15-postman-tests)| Х |
| 16 | [Интеграция с фронтендом](./lab16-frontend-integration)| Х |
| 17 | [Деплой](./lab17-deploy)| Х |
| 18 | [Итоговый проект](./lab18-final-project)| Х |
 
## Структура репозитория
 
```
student-backend-course/
├── README.md                          # Описание курса, навигация по работам
├── .gitignore                         # Игнорируемые файлы
├── lab1-first-http-server/
│   ├── README.md                      # Отчёт по ЛР №1
│   ├── app.js / app.py                # Код сервера
│   ├── package.json / requirements.txt # Зависимости
│   ├── screenshots/                   # Скриншоты работы
│   │   ├── root.png
│   │   ├── json.png
│   │   └── param.png
│   └── curl_commands.txt              # Команды для тестирования
├── lab2-http-methods/
│   ├── README.md
│   ├── app.js / app.py
│   └── screenshots/
├── lab3-routing-params/
│   ├── README.md
│   ├── app.js / app.py
│   └── screenshots/
├── lab4-sql-basics/
│   ├── README.md
│   ├── init_db.sql
│   └── screenshots/
├── lab5-sql-from-server/
│   ├── README.md
│   ├── app.js / app.py
│   └── screenshots/
├── lab6-crud-database/
│   ├── README.md
│   ├── app.js / app.py
│   └── screenshots/
├── lab7-sql-filtering/
│   ├── README.md
│   ├── app.js / app.py
│   └── screenshots/
├── lab8-sql-joins/
│   ├── README.md
│   ├── app.js / app.py
│   └── screenshots/
├── lab9-rest-api-design/
│   ├── README.md
│   ├── app.js / app.py
│   └── screenshots/
├── lab10-validation/
│   ├── README.md
│   ├── app.js / app.py
│   └── screenshots/
├── lab11-password-hashing/
│   ├── README.md
│   ├── app.js / app.py
│   └── screenshots/
├── lab12-session-auth/
│   ├── README.md
│   ├── app.js / app.py
│   └── screenshots/
├── lab13-env-config/
│   ├── README.md
│   ├── app.js / app.py
│   ├── .env.example
│   └── screenshots/
├── lab14-logging/
│   ├── README.md
│   ├── app.js / app.py
│   └── screenshots/
├── lab15-postman-tests/
│   ├── README.md
│   └── screenshots/
├── lab16-frontend-integration/
│   ├── README.md
│   ├── app.js / app.py
│   ├── public/
│   │   └── index.html
│   └── screenshots/
├── lab17-deploy/
│   ├── README.md
│   └── screenshots/
├── lab18-final-project/
│   ├── README.md
│   ├── app.js / app.py
│   ├── public/
│   └── screenshots/
├── common/
│   ├── styles/                        # Общие стили для оформления
│   └── templates/                     # Шаблоны README
└── docs/
    ├── course_description.md          # Описание курса
    └── grading_rubric.md              # Критерии оценивания
```
 
### Описание ключевых файлов и папок
 
| Файл/папка | Назначение |
|---|---|
| `README.md` | Главный файл курса с описанием, списком работ, навигацией |
| `.gitignore` | Исключает `node_modules/`, `venv/`, `.env`, `*.log` из репозитория |
| `lab*/README.md` | Отчёт по лабораторной работе (Markdown) |
| `lab*/screenshots/` | Скриншоты выполнения запросов, работы сервера |
| `common/` | Общие файлы для оформления всех работ |
| `docs/` | Документация курса, критерии оценивания |
 