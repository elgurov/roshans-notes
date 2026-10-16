import { Routes, Route } from 'react-router-dom';

import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Heroes from './pages/Heroes';
import HeroDetails from './pages/HeroDetails';
import Explore from './pages/Explore';
import Dashboard from './pages/Dashboard';
import CreateNote from './pages/CreateNote';
import EditNote from './pages/EditNote';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      {/* Layout рисует Header + Footer, а страницы попадают в <Outlet /> */}
      <Route element={<Layout />}>
        {/* Публичные страницы */}
        <Route index element={<Home />} />
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
        <Route path="heroes" element={<Heroes />} />
        <Route path="heroes/:id" element={<HeroDetails />} />
        <Route path="explore" element={<Explore />} />

        {/* Защищённые страницы: без авторизации -> /login */}
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dashboard/create" element={<CreateNote />} />
          <Route path="dashboard/edit/:id" element={<EditNote />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
