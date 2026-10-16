// Каждая функция возвращает строку с ошибкой или '' если всё в порядке.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateName(value) {
  const v = value.trim();
  if (!v) return 'Введите имя';
  if (v.length < 2) return 'Имя должно быть не короче 2 символов';
  if (v.length > 30) return 'Имя должно быть не длиннее 30 символов';
  return '';
}

export function validateEmail(value) {
  const v = value.trim();
  if (!v) return 'Введите email';
  if (!EMAIL_RE.test(v)) return 'Введите email в формате name@example.com';
  return '';
}

// Для регистрации: полные правила
export function validateNewPassword(value) {
  if (!value) return 'Введите пароль';
  if (value.length < 8) return 'Пароль должен быть не короче 8 символов';
  if (!/[A-Za-zА-Яа-яЁё]/.test(value)) return 'Добавьте в пароль хотя бы одну букву';
  if (!/\d/.test(value)) return 'Добавьте в пароль хотя бы одну цифру';
  return '';
}

// Для входа: достаточно, что поле не пустое
export function validateRequiredPassword(value) {
  return value ? '' : 'Введите пароль';
}

export function validateConfirm(password, confirm) {
  if (!confirm) return 'Повторите пароль';
  if (password !== confirm) return 'Пароли не совпадают';
  return '';
}

// Проверка текстового поля по длине: validateLength('Название', value, 3, 60)
export function validateLength(label, value, min, max) {
  const v = value.trim();
  if (!v) return `Заполните поле «${label}»`;
  if (v.length < min) return `«${label}»: минимум ${min} симв.`;
  if (v.length > max) return `«${label}»: максимум ${max} симв.`;
  return '';
}

export function validateSelect(label, value) {
  return value ? '' : `Выберите значение в поле «${label}»`;
}
