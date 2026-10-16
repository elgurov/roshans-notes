import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useHeroes } from '../../hooks/useHeroes';
import { ATTR_LABEL, heroImgUrl } from '../../utils/heroAttrs';
import './HeroPicker.css';

// 'any' — без фильтра; 'all' — универсальные герои (так их отдаёт OpenDota)
const FILTERS = [
  { key: 'any', label: 'Все' },
  { key: 'str', label: 'Сила' },
  { key: 'agi', label: 'Ловкость' },
  { key: 'int', label: 'Интеллект' },
  { key: 'all', label: 'Универсальные' },
];

function Icon({ src }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <span className="hero-picker__icon hero-picker__icon--empty" aria-hidden="true" />;
  return (
    <img
      className="hero-picker__icon"
      src={heroImgUrl(src)}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

/*
  value: { id, name, attr, img } | null
  onChange(hero) вызывается при выборе героя
  onBlur() вызывается при закрытии списка (для «touched» в форме)
*/
export default function HeroPicker({ id, label, value, onChange, onBlur, error }) {
  const { status, heroes, error: loadError, retry } = useHeroes();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('any');

  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const searchRef = useRef(null);

  const panelId = `${id}-panel`;
  const errorId = `${id}-error`;

  const close = useCallback(
    (returnFocus) => {
      setOpen(false);
      setQuery('');
      setFilter('any');
      onBlur?.();
      if (returnFocus) triggerRef.current?.focus();
    },
    [onBlur]
  );

  // Клик вне компонента закрывает список
  useEffect(() => {
    if (!open) return;
    const handleDown = (e) => {
      if (!rootRef.current?.contains(e.target)) close(false);
    };
    document.addEventListener('mousedown', handleDown);
    return () => document.removeEventListener('mousedown', handleDown);
  }, [open, close]);

  // При открытии сразу ставим курсор в поиск
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open, status]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return heroes.filter(
      (h) =>
        (filter === 'any' || h.primary_attr === filter) &&
        (!q || h.localized_name.toLowerCase().includes(q))
    );
  }, [heroes, filter, query]);

  const pick = (hero) => {
    onChange({
      id: hero.id,
      name: hero.localized_name,
      attr: hero.primary_attr,
      img: hero.icon || hero.img || '',
    });
    close(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && open) {
      e.stopPropagation();
      close(true);
    }
  };

  const handleSearchKeyDown = (e) => {
    // Enter в поиске не должен отправлять всю форму: выбираем первого героя
    if (e.key === 'Enter') {
      e.preventDefault();
      if (visible[0]) pick(visible[0]);
    }
  };

  return (
    <div
      ref={rootRef}
      className={error ? 'field field--invalid hero-picker' : 'field hero-picker'}
      onKeyDown={handleKeyDown}
    >
      <label htmlFor={id} className="field__label">
        {label}
      </label>

      <button
        ref={triggerRef}
        id={id}
        type="button"
        className="field__input hero-picker__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        onClick={() => (open ? close(false) : setOpen(true))}
      >
        {value ? (
          <>
            <Icon src={value.img} />
            <span className="hero-picker__name">{value.name}</span>
            {value.attr && (
              <span className={`hero-picker__attr hero-picker__attr--${value.attr}`}>
                {ATTR_LABEL[value.attr] ?? value.attr}
              </span>
            )}
          </>
        ) : (
          <span className="hero-picker__placeholder">Выберите героя…</span>
        )}
        <span className="hero-picker__chevron" aria-hidden="true">▾</span>
      </button>

      {open && (
        <div id={panelId} className="hero-picker__panel">
          {status === 'loading' && (
            <p className="hero-picker__state" role="status">Загружаем героев…</p>
          )}

          {status === 'error' && (
            <div className="hero-picker__state" role="alert">
              <p>{loadError}</p>
              <button type="button" className="btn btn--primary" onClick={retry}>
                Повторить
              </button>
            </div>
          )}

          {status === 'success' && (
            <>
              <input
                ref={searchRef}
                type="search"
                className="field__input hero-picker__search"
                placeholder="Поиск по имени"
                aria-label="Поиск героя по имени"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />

              <div className="hero-picker__filters" role="group" aria-label="Фильтр по атрибуту">
                {FILTERS.map(({ key, label: text }) => (
                  <button
                    key={key}
                    type="button"
                    className={filter === key ? 'chip chip--active' : 'chip'}
                    aria-pressed={filter === key}
                    onClick={() => setFilter(key)}
                  >
                    {text}
                  </button>
                ))}
              </div>

              {visible.length === 0 ? (
                <p className="hero-picker__state">Никого не нашли. Измените поиск или фильтр.</p>
              ) : (
                <ul className="hero-picker__list">
                  {visible.map((hero) => (
                    <li key={hero.id}>
                      <button
                        type="button"
                        className={
                          value?.id === hero.id
                            ? 'hero-picker__option hero-picker__option--selected'
                            : 'hero-picker__option'
                        }
                        aria-pressed={value?.id === hero.id}
                        onClick={() => pick(hero)}
                      >
                        <Icon src={hero.icon || hero.img} />
                        <span className="hero-picker__name">{hero.localized_name}</span>
                        <span className={`hero-picker__attr hero-picker__attr--${hero.primary_attr}`}>
                          {ATTR_LABEL[hero.primary_attr] ?? hero.primary_attr}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}

      {error && (
        <p id={errorId} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}
