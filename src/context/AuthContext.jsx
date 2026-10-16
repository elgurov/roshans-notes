import { createContext, useCallback, useContext, useMemo, useState } from 'react';

/*
  Пока бэкенда нет, «сервером» служит localStorage:
    rn_users   — список зарегистрированных пользователей
    rn_session — текущий вошедший пользователь

  Когда появится настоящий API, меняются только тела функций
  register / login / logout. Остальное приложение продолжит работать как есть.
*/

const USERS_KEY = 'rn_users';
const SESSION_KEY = 'rn_session';

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// Хэш пароля, чтобы он не лежал в localStorage открытым текстом.
// Это только для учебной имитации: настоящее хэширование делает сервер.
async function hashPassword(password) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Небольшая задержка, чтобы видеть состояние «Входим…» как при реальном запросе
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Ленивая инициализация: сессия восстанавливается после перезагрузки страницы
  const [user, setUser] = useState(() => readJSON(SESSION_KEY, null));

  const startSession = useCallback((account) => {
    const publicUser = {
      id: account.id,
      name: account.name,
      email: account.email,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(publicUser));
    setUser(publicUser);
  }, []);

  const register = useCallback(
    async ({ name, email, password }) => {
      await delay();
      const users = readJSON(USERS_KEY, []);
      const normalizedEmail = email.trim().toLowerCase();

      if (users.some((u) => u.email === normalizedEmail)) {
        throw new Error('Аккаунт с таким email уже существует');
      }

      const account = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: await hashPassword(password),
      };

      localStorage.setItem(USERS_KEY, JSON.stringify([...users, account]));
      startSession(account); // после регистрации сразу входим
    },
    [startSession]
  );

  const login = useCallback(
    async ({ email, password }) => {
      await delay();
      const users = readJSON(USERS_KEY, []);
      const normalizedEmail = email.trim().toLowerCase();
      const account = users.find((u) => u.email === normalizedEmail);
      const passwordHash = await hashPassword(password);

      // Одно и то же сообщение для обоих случаев: не подсказываем, какой email существует
      if (!account || account.passwordHash !== passwordHash) {
        throw new Error('Неверный email или пароль');
      }

      startSession(account);
    },
    [startSession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuth: Boolean(user), register, login, logout }),
    [user, register, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth нужно вызывать внутри <AuthProvider>');
  }
  return ctx;
}
