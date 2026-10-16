import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute() {
  const { isAuth } = useAuth();
  const location = useLocation();

  if (!isAuth) {
    // Запоминаем исходный URL, чтобы после входа вернуть пользователя назад
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
