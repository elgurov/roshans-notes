import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';

import FormField from '../components/FormField/FormField';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validateRequiredPassword } from '../utils/validators';
import './Auth.css';

function validate(values) {
  return {
    email: validateEmail(values.email),
    password: validateRequiredPassword(values.password),
  };
}

export default function Login() {
  const { user, login } = useAuth();
  const location = useLocation();

  // Куда вернуть пользователя: на страницу, с которой его перекинул ProtectedRoute
  const redirectTo = location.state?.from?.pathname || '/dashboard';

  const [values, setValues] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const errors = validate(values);
  const showError = (name) => (touched[name] ? errors[name] : '');

  // Уже вошёл (или только что вошёл): уходим со страницы
  if (user) {
    return <Navigate to={redirectTo} replace />;
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
    setTouched({ email: true, password: true });

    if (Object.values(errors).some(Boolean)) return;

    setSubmitting(true);
    setServerError('');
    try {
      await login(values);
      // Редирект произойдёт сам: user появится в контексте и сработает <Navigate />
    } catch (err) {
      setServerError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <section className="auth">
      <div className="auth__panel">
        <h1 className="auth__title">Вход</h1>
        <p className="auth__lead">Войдите, чтобы вести свои заметки о героях.</p>

        <form className="auth__form" onSubmit={handleSubmit} noValidate>
          {serverError && (
            <p className="auth__alert" role="alert">
              {serverError}
            </p>
          )}

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
            autoComplete="current-password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={showError('password')}
          />

          <button
            type="submit"
            className="btn btn--primary auth__submit"
            disabled={submitting}
          >
            {submitting ? 'Входим…' : 'Войти'}
          </button>
        </form>

        <p className="auth__switch">
          Нет аккаунта? <Link to="/register">Создать аккаунт</Link>
        </p>
      </div>
    </section>
  );
}
