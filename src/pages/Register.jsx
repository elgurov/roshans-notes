import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

import FormField from '../components/FormField/FormField';
import { useAuth } from '../context/AuthContext';
import {
  validateConfirm,
  validateEmail,
  validateName,
  validateNewPassword,
} from '../utils/validators';
import './Auth.css';

const FIELDS = ['name', 'email', 'password', 'confirm'];

function validate(values) {
  return {
    name: validateName(values.name),
    email: validateEmail(values.email),
    password: validateNewPassword(values.password),
    confirm: validateConfirm(values.password, values.confirm),
  };
}

export default function Register() {
  const { user, register } = useAuth();

  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const errors = validate(values);
  const showError = (name) => (touched[name] ? errors[name] : '');

  // После успешной регистрации user появляется в контексте, и мы попадаем в кабинет
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setServerError('');
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(Object.fromEntries(FIELDS.map((f) => [f, true])));

    if (Object.values(errors).some(Boolean)) return;

    setSubmitting(true);
    setServerError('');
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
      });
    } catch (err) {
      setServerError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <section className="auth">
      <div className="auth__panel">
        <h1 className="auth__title">Регистрация</h1>
        <p className="auth__lead">
          Создайте аккаунт, чтобы сохранять заметки Рошана.
        </p>

        <form className="auth__form" onSubmit={handleSubmit} noValidate>
          {serverError && (
            <p className="auth__alert" role="alert">
              {serverError}
            </p>
          )}

          <FormField
            id="name"
            label="Имя"
            autoComplete="nickname"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={showError('name')}
          />

          <FormField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={showError('email')}
          />

          <FormField
            id="password"
            label="Пароль"
            type="password"
            autoComplete="new-password"
            hint="Не короче 8 символов, с буквой и цифрой"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={showError('password')}
          />

          <FormField
            id="confirm"
            label="Повторите пароль"
            type="password"
            autoComplete="new-password"
            value={values.confirm}
            onChange={handleChange}
            onBlur={handleBlur}
            error={showError('confirm')}
          />

          <button
            type="submit"
            className="btn btn--primary auth__submit"
            disabled={submitting}
          >
            {submitting ? 'Создаём аккаунт…' : 'Создать аккаунт'}
          </button>
        </form>

        <p className="auth__switch">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </section>
  );
}
