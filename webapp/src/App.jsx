import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';

// Layout - loaded immediately
import MainLayout from './components/MainLayout';

// Loading component for Suspense fallback
import PageLoader from './components/PageLoader';

// Lazy loaded pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const ExperienceDetailPage = lazy(() => import('./pages/ExperienceDetailPage'));
const GuideProfilePage = lazy(() => import('./pages/GuideProfilePage'));
const BookingsPage = lazy(() => import('./pages/BookingsPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const NearbyTravelersPage = lazy(() => import('./pages/NearbyTravelersPage'));
const TripPlanningPage = lazy(() => import('./pages/TripPlanningPage'));

function PrivateRoute({ children }) {
  const { isAuthenticated } = useStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/signup" element={<Navigate to="/register" replace />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="experience/:id" element={<ExperienceDetailPage />} />
          <Route path="guide/:id" element={<GuideProfilePage />} />
          <Route path="nearby" element={<NearbyTravelersPage />} />
          <Route path="trips" element={<TripPlanningPage />} />
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
    </Suspense>
  );
}

export default App;
