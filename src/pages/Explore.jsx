import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './Explore.css';

const API_URL = 'https://api.opendota.com/api/heroStats';
const IMG_BASE = 'https://cdn.cloudflare.steamstatic.com';

const ATTRS = [
  { value: 'all', label: 'Все' },
  { value: 'str', label: 'Сила' },
  { value: 'agi', label: 'Ловкость' },
  { value: 'int', label: 'Интеллект' },
  { value: 'uni', label: 'Универсальные' },
];

// В OpenDota универсальные герои приходят с primary_attr === 'all'
const ATTR_LABEL = {
  str: 'Сила',
  agi: 'Ловкость',
  int: 'Интеллект',
  all: 'Универсал',
};

const ATTACK_LABEL = {
  Melee: 'Ближний бой',
  Ranged: 'Дальний бой',
};

function matchesAttr(hero, filter) {
  if (filter === 'all') return true;
  if (filter === 'uni') return hero.primary_attr === 'all';
  return hero.primary_attr === filter;
}

export default function Explore() {
  const [heroes, setHeroes] = useState([]);
  // 'loading' | 'success' | 'error' | 'cancelled'
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [attrFilter, setAttrFilter] = useState('all');

  // Меняем значение, чтобы useEffect перезапустил запрос (кнопка «Повторить»)
  const [attempt, setAttempt] = useState(0);

  // Храним текущий контроллер, чтобы отменять запрос кнопкой
  const controllerRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;

    async function loadHeroes() {
      setStatus('loading');
      setErrorMessage('');

      try {
        const res = await fetch(API_URL, { signal: controller.signal });

        if (!res.ok) {
          throw new Error(`Сервер ответил ошибкой ${res.status}`);
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error('Сервер вернул данные в неожиданном формате');
        }

        data.sort((a, b) => a.localized_name.localeCompare(b.localized_name));
        setHeroes(data);
        setStatus('success');
      } catch (err) {
        // Отмена (размонтирование или кнопка) — не ошибка, интерфейс не трогаем
        if (err.name === 'AbortError') return;

        setErrorMessage(
          err instanceof TypeError
            ? 'Не удалось связаться с сервером. Проверьте подключение к интернету.'
            : err.message
        );
        setStatus('error');
      }
    }

    loadHeroes();

    // Cleanup: при уходе со страницы или повторном запуске прерываем запрос
    return () => controller.abort();
  }, [attempt]);

  const handleCancel = useCallback(() => {
    controllerRef.current?.abort();
    setStatus('cancelled');
  }, []);

  const handleRetry = useCallback(() => {
    setAttempt((n) => n + 1);
  }, []);

  const visibleHeroes = useMemo(
    () => heroes.filter((h) => matchesAttr(h, attrFilter)),
    [heroes, attrFilter]
  );

  return (
    <section className="explore">
      <header className="explore__head">
        <h1 className="explore__title">Разведка Dota API</h1>
        <p className="explore__lead">
          Герои из OpenDota. Выберите атрибут, чтобы сузить список.
        </p>
      </header>

      {status === 'success' && (
        <>
          <div className="explore__filters" role="group" aria-label="Фильтр по атрибуту">
            {ATTRS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={
                  attrFilter === value
                    ? 'chip chip--active'
                    : 'chip'
                }
                aria-pressed={attrFilter === value}
                onClick={() => setAttrFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <p className="explore__count" aria-live="polite">
            Показано героев: {visibleHeroes.length} из {heroes.length}
          </p>

          {visibleHeroes.length === 0 ? (
            <p className="explore__empty">
              Героев с таким атрибутом не нашлось. Выберите другой фильтр.
            </p>
          ) : (
            <ul className="hero-grid">
              {visibleHeroes.map((hero) => (
                <HeroCard key={hero.id} hero={hero} />
              ))}
            </ul>
          )}
        </>
      )}

      {status === 'loading' && (
        <div aria-busy="true">
          <div className="explore__loading">
            <p role="status">Загружаем героев…</p>
            <button type="button" className="btn btn--ghost" onClick={handleCancel}>
              Отменить запрос
            </button>
          </div>
          <ul className="hero-grid" aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
              <li key={i} className="hero-card hero-card--skeleton" />
            ))}
          </ul>
        </div>
      )}

      {status === 'error' && (
        <div className="explore__message explore__message--error" role="alert">
          <h2>Не удалось загрузить героев</h2>
          <p>{errorMessage}</p>
          <button type="button" className="btn btn--primary" onClick={handleRetry}>
            Повторить
          </button>
        </div>
      )}

      {status === 'cancelled' && (
        <div className="explore__message" role="status">
          <h2>Запрос отменён</h2>
          <p>Список героев не загружен.</p>
          <button type="button" className="btn btn--primary" onClick={handleRetry}>
            Повторить
          </button>
        </div>
      )}
    </section>
  );
}

function HeroCard({ hero }) {
  const [imgFailed, setImgFailed] = useState(false);
  const attr = hero.primary_attr;

  return (
    <li className={`hero-card hero-card--${attr}`}>
      <div className="hero-card__media">
        {imgFailed || !hero.img ? (
          <div className="hero-card__fallback" aria-hidden="true">
            {hero.localized_name[0]}
          </div>
        ) : (
          <img
            src={`${IMG_BASE}${hero.img}`}
            alt={hero.localized_name}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        )}
      </div>

      <div className="hero-card__body">
        <h2 className="hero-card__name">{hero.localized_name}</h2>
        <p className="hero-card__attr">{ATTR_LABEL[attr] ?? attr}</p>
        <p className="hero-card__meta">
          {ATTACK_LABEL[hero.attack_type] ?? hero.attack_type}
        </p>
        {hero.base_attack_min != null && (
          <p className="hero-card__meta">
            Атака: {hero.base_attack_min}–{hero.base_attack_max}
          </p>
        )}
      </div>
    </li>
  );
}
