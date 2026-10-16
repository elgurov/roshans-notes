import { useCallback, useEffect, useState } from 'react';

const API_URL = 'https://api.opendota.com/api/heroStats';

// Кэш на время жизни страницы: список героев грузим один раз
let cache = null;

/*
  Возвращает { status, heroes, error, retry }
  status: 'loading' | 'success' | 'error'
*/
export function useHeroes() {
  const [state, setState] = useState(() =>
    cache
      ? { status: 'success', heroes: cache, error: '' }
      : { status: 'loading', heroes: [], error: '' }
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (cache) {
      setState({ status: 'success', heroes: cache, error: '' });
      return;
    }

    const controller = new AbortController();
    setState({ status: 'loading', heroes: [], error: '' });

    (async () => {
      try {
        const res = await fetch(API_URL, { signal: controller.signal });
        if (!res.ok) throw new Error(`Сервер ответил ошибкой ${res.status}`);

        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Сервер вернул неожиданный формат данных');

        cache = [...data].sort((a, b) =>
          a.localized_name.localeCompare(b.localized_name)
        );
        setState({ status: 'success', heroes: cache, error: '' });
      } catch (err) {
        if (err.name === 'AbortError') return;
        setState({
          status: 'error',
          heroes: [],
          error:
            err instanceof TypeError
              ? 'Не удалось связаться с сервером. Проверьте подключение к интернету.'
              : err.message,
        });
      }
    })();

    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, retry };
}
