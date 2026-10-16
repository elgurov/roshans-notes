/*
  Roshan's Notes: простой API-сервер.
  Данные лежат в db.json рядом с этим файлом: { users, notes, sessions }.

  Запуск:  node server.js
  Порт:    3001 (можно поменять: PORT=4000 node server.js)
*/

import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'db.json');
const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // сессия живёт 7 дней

/* ------------------------------------------------------------------ */
/* Работа с db.json                                                    */
/* ------------------------------------------------------------------ */

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

function readDb() {
  const raw = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  return {
    users: raw.users ?? [],
    notes: raw.notes ?? [],
    sessions: raw.sessions ?? [],
  };
}

// Создаём файл при первом запуске и проверяем, что он не повреждён
function initDb() {
  if (!fs.existsSync(DB_PATH)) {
    writeDb({ users: [], notes: [], sessions: [] });
    console.log('Создан новый db.json');
    return;
  }
  try {
    readDb();
  } catch {
    console.error('db.json повреждён: исправьте JSON или удалите файл.');
    process.exit(1);
  }
}

/* ------------------------------------------------------------------ */
/* Валидация (правила совпадают с фронтендом)                          */
/* ------------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ATTRS = ['str', 'agi', 'int', 'all'];
const OUTCOMES = ['killed', 'survived', 'fled'];

const str = (v) => (typeof v === 'string' ? v : '');

function checkLength(label, value, min, max) {
  const v = str(value).trim();
  if (!v) return `Заполните поле «${label}»`;
  if (v.length < min) return `«${label}»: минимум ${min} симв.`;
  if (v.length > max) return `«${label}»: максимум ${max} симв.`;
  return '';
}

// Возвращает объект ошибок; пустой объект значит «всё хорошо»
function validateRegister({ name, email, password }) {
  const errors = {
    name: checkLength('Имя', name, 2, 30),
    email: EMAIL_RE.test(str(email).trim()) ? '' : 'Введите email в формате name@example.com',
    password: '',
  };

  const p = str(password);
  if (p.length < 8) errors.password = 'Пароль должен быть не короче 8 символов';
  else if (p.length > 72) errors.password = 'Пароль должен быть не длиннее 72 символов';
  else if (!/[A-Za-zА-Яа-яЁё]/.test(p)) errors.password = 'Добавьте в пароль хотя бы одну букву';
  else if (!/\d/.test(p)) errors.password = 'Добавьте в пароль хотя бы одну цифру';

  return errors;
}

function validateNote(n) {
  return {
    title: checkLength('Название', n.title, 3, 60),
    hero:
      Number.isInteger(n.heroId) && n.heroId > 0
        ? checkLength('Герой', n.hero, 2, 40)
        : 'Выберите героя из списка',
    attr: ATTRS.includes(n.attr) ? '' : 'Некорректный атрибут героя',
    story: checkLength('Что я видел', n.story, 20, 800),
    outcome: OUTCOMES.includes(n.outcome) ? '' : 'Выберите, чем закончилось',
    opinion: checkLength('Моё мнение', n.opinion, 10, 500),
  };
}

function cleanNote(n) {
  return {
    title: str(n.title).trim(),
    heroId: n.heroId,
    hero: str(n.hero).trim(),
    attr: n.attr,
    img: str(n.img).slice(0, 300), // путь к иконке героя, необязателен
    story: str(n.story).trim(),
    outcome: n.outcome,
    opinion: str(n.opinion).trim(),
  };
}

const hasErrors = (errors) => Object.values(errors).some(Boolean);

function sendValidationError(res, errors) {
  const fields = Object.fromEntries(Object.entries(errors).filter(([, msg]) => msg));
  res.status(400).json({ error: Object.values(fields)[0], fields });
}

/* ------------------------------------------------------------------ */
/* Пользователи и сессии                                               */
/* ------------------------------------------------------------------ */

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });

// Фиктивный хэш: сравниваем с ним, если email не найден, чтобы время ответа
// не выдавало, существует ли такой пользователь
const DUMMY_HASH = bcrypt.hashSync('dummy-password-1', 10);

// Создаёт сессию и сохраняет её в db (запись в файл делает вызывающий код)
function createSession(db, userId) {
  const now = Date.now();
  db.sessions = db.sessions.filter((s) => s.expiresAt > now); // чистим просроченные
  const token = crypto.randomBytes(32).toString('hex');
  db.sessions.push({ token, userId, expiresAt: now + SESSION_TTL_MS });
  return token;
}

function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Требуется вход в аккаунт' });
  }

  const db = readDb();
  const session = db.sessions.find((s) => s.token === token && s.expiresAt > Date.now());
  const user = session && db.users.find((u) => u.id === session.userId);

  if (!user) {
    return res.status(401).json({ error: 'Сессия истекла. Войдите снова' });
  }

  req.user = user;
  req.token = token;
  next();
}

/* ------------------------------------------------------------------ */
/* Приложение                                                          */
/* ------------------------------------------------------------------ */

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: '100kb' }));

/* ---------- Авторизация ---------- */

// POST /api/register  { name, email, password } -> { user, token }
app.post('/api/register', async (req, res) => {
  const body = req.body ?? {};
  const errors = validateRegister(body);
  if (hasErrors(errors)) return sendValidationError(res, errors);

  const db = readDb();
  const email = body.email.trim().toLowerCase();

  if (db.users.some((u) => u.email === email)) {
    return res.status(409).json({ error: 'Аккаунт с таким email уже существует' });
  }

  const user = {
    id: crypto.randomUUID(),
    name: body.name.trim(),
    email,
    passwordHash: await bcrypt.hash(body.password, 10),
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  const token = createSession(db, user.id); // после регистрации сразу входим
  writeDb(db);

  res.status(201).json({ user: publicUser(user), token });
});

// POST /api/login  { email, password } -> { user, token }
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!EMAIL_RE.test(str(email).trim()) || !str(password)) {
    return res.status(400).json({ error: 'Введите email и пароль' });
  }

  const db = readDb();
  const user = db.users.find((u) => u.email === email.trim().toLowerCase());

  const ok = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
  if (!user || !ok) {
    // Одно сообщение для обоих случаев: не подсказываем, какой email существует
    return res.status(401).json({ error: 'Неверный email или пароль' });
  }

  const token = createSession(db, user.id);
  writeDb(db);

  res.json({ user: publicUser(user), token });
});

// POST /api/logout -> 204 (удаляет текущую сессию)
app.post('/api/logout', requireAuth, (req, res) => {
  const db = readDb();
  db.sessions = db.sessions.filter((s) => s.token !== req.token);
  writeDb(db);
  res.status(204).end();
});

/* ---------- Заметки (только свои) ---------- */

// GET /api/notes -> [note, ...] новые сверху
app.get('/api/notes', requireAuth, (req, res) => {
  const db = readDb();
  const notes = db.notes
    .filter((n) => n.ownerId === req.user.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  res.json(notes);
});

// GET /api/notes/:id -> note (нужна странице редактирования)
app.get('/api/notes/:id', requireAuth, (req, res) => {
  const db = readDb();
  const note = db.notes.find((n) => n.id === req.params.id && n.ownerId === req.user.id);
  if (!note) return res.status(404).json({ error: 'Заметка не найдена' });
  res.json(note);
});

// POST /api/notes -> 201 + note
app.post('/api/notes', requireAuth, (req, res) => {
  const body = req.body ?? {};
  const errors = validateNote(body);
  if (hasErrors(errors)) return sendValidationError(res, errors);

  const db = readDb();
  const now = new Date().toISOString();
  const note = {
    id: crypto.randomUUID(),
    ownerId: req.user.id,
    ...cleanNote(body),
    createdAt: now,
    updatedAt: now,
  };

  db.notes.push(note);
  writeDb(db);
  res.status(201).json(note);
});

// PUT /api/notes/:id -> обновлённая note
app.put('/api/notes/:id', requireAuth, (req, res) => {
  const body = req.body ?? {};
  const errors = validateNote(body);
  if (hasErrors(errors)) return sendValidationError(res, errors);

  const db = readDb();
  const index = db.notes.findIndex((n) => n.id === req.params.id && n.ownerId === req.user.id);
  // Чужую заметку не отличаем от несуществующей: всегда 404
  if (index === -1) return res.status(404).json({ error: 'Заметка не найдена' });

  db.notes[index] = {
    ...db.notes[index],
    ...cleanNote(body),
    updatedAt: new Date().toISOString(),
  };
  writeDb(db);
  res.json(db.notes[index]);
});

// DELETE /api/notes/:id -> 204
app.delete('/api/notes/:id', requireAuth, (req, res) => {
  const db = readDb();
  const before = db.notes.length;
  db.notes = db.notes.filter((n) => !(n.id === req.params.id && n.ownerId === req.user.id));

  if (db.notes.length === before) {
    return res.status(404).json({ error: 'Заметка не найдена' });
  }

  writeDb(db);
  res.status(204).end();
});

/* ---------- Ошибки ---------- */

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Такого эндпоинта нет' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Некорректный JSON в теле запроса' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Слишком большой запрос' });
  }
  console.error(err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

initDb();
app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
