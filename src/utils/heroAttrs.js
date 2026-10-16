// Значения совпадают с primary_attr из OpenDota
export const ATTR_OPTIONS = [
  { value: 'str', label: 'Сила' },
  { value: 'agi', label: 'Ловкость' },
  { value: 'int', label: 'Интеллект' },
  { value: 'all', label: 'Универсальный' },
];

export const ATTR_LABEL = Object.fromEntries(
  ATTR_OPTIONS.map(({ value, label }) => [value, label])
);

export const IMG_BASE = 'https://cdn.cloudflare.steamstatic.com';

// Путь из OpenDota (/apps/dota2/...) -> полный адрес картинки
export const heroImgUrl = (path) => (path ? `${IMG_BASE}${path}` : '');

// Чем закончилась встреча героя с Рошаном (глазами свидетеля)
export const OUTCOME_OPTIONS = [
  { value: 'killed', label: 'Герой убил Рошана' },
  { value: 'survived', label: 'Рошан выстоял' },
  { value: 'fled', label: 'Герой сбежал' },
];

export const OUTCOME_LABEL = Object.fromEntries(
  OUTCOME_OPTIONS.map(({ value, label }) => [value, label])
);
