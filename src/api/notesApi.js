/*
  Заметки хранятся в localStorage под ключом rn_notes (общий список для всех
  пользователей, у каждой заметки есть ownerId).

  Форма заметки:
  {
    id, ownerId,
    title,                      // название заметки
    heroId, hero, attr, img,    // выбранный герой (атрибут берётся у героя)
    story,                      // что свидетель видел (герой и Рошан)
    outcome,                    // killed | survived | fled
    opinion,                    // мнение свидетеля
    createdAt, updatedAt
  }

  Когда появится бэкенд, функции станут async и будут делать fetch
  (GET / POST / PUT / DELETE), а сигнатуры останутся теми же.
*/

const KEY = 'rn_notes';

// Старые заметки (поле text вместо story, без tips) приводим к новой форме
function normalize(n) {
  return {
    ...n,
    heroId: n.heroId ?? null,
    hero: n.hero ?? '',
    attr: n.attr ?? '',
    img: n.img ?? '',
    story: n.story ?? n.text ?? '',
    outcome: n.outcome ?? '',
    opinion: n.opinion ?? n.tips ?? '',
  };
}

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(normalize) : [];
  } catch {
    return [];
  }
}

function writeAll(notes) {
  localStorage.setItem(KEY, JSON.stringify(notes));
}

// data.hero — объект { id, name, attr, img } из HeroPicker
function clean(data) {
  return {
    title: data.title.trim(),
    heroId: data.hero.id,
    hero: data.hero.name,
    attr: data.hero.attr,
    img: data.hero.img,
    story: data.story.trim(),
    outcome: data.outcome,
    opinion: data.opinion.trim(),
  };
}

// READ: все заметки (пригодятся публичным страницам /heroes)
export function getAllNotes() {
  return readAll();
}

// READ: заметки одного пользователя, новые сверху
export function getNotesByOwner(ownerId) {
  return readAll()
    .filter((n) => n.ownerId === ownerId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

// READ: одна заметка
export function getNoteById(id) {
  return readAll().find((n) => n.id === id) ?? null;
}

// CREATE
export function createNote(ownerId, data) {
  const now = new Date().toISOString();
  const note = {
    id: crypto.randomUUID(),
    ownerId,
    ...clean(data),
    createdAt: now,
    updatedAt: now,
  };
  writeAll([...readAll(), note]);
  return note;
}

// UPDATE: менять можно только свою заметку
export function updateNote(id, ownerId, data) {
  const notes = readAll();
  const index = notes.findIndex((n) => n.id === id && n.ownerId === ownerId);
  if (index === -1) throw new Error('Заметка не найдена');

  const updated = {
    ...notes[index],
    ...clean(data),
    updatedAt: new Date().toISOString(),
  };
  notes[index] = updated;
  writeAll(notes);
  return updated;
}

// DELETE: удалять можно только свою заметку
export function deleteNote(id, ownerId) {
  const notes = readAll();
  const next = notes.filter((n) => !(n.id === id && n.ownerId === ownerId));
  if (next.length === notes.length) throw new Error('Заметка не найдена');
  writeAll(next);
}
