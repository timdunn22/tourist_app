import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';

// Layout
import MainLayout from './components/MainLayout';

// Pages
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import ExperienceDetailPage from './pages/ExperienceDetailPage';
import GuideProfilePage from './pages/GuideProfilePage';
import BookingsPage from './pages/BookingsPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/signup" element={<Navigate to="/register" replace />} />

      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="experience/:id" element={<ExperienceDetailPage />} />
        <Route path="guide/:id" element={<GuideProfilePage />} />
        <Route path="bookings" element={
          <PrivateRoute><BookingsPage /></PrivateRoute>
        } />
        <Route path="messages" element={
          <PrivateRoute><MessagesPage /></PrivateRoute>
        } />
        <Route path="favorites" element={
          <PrivateRoute><FavoritesPage /></PrivateRoute>
        } />
        <Route path="profile" element={
          <PrivateRoute><ProfilePage /></PrivateRoute>
        } />
      </Route>
    </Routes>
  );
}

export default App;
