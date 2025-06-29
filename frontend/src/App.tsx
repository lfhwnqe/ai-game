import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { useAuthStore } from './stores/authStore';
import { theme } from './styles/theme';
import GlobalStyle from './styles/GlobalStyle';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GameListPage from './pages/GameListPage';
import GameCreatePage from './pages/GameCreatePage';
import GamePage from './pages/GamePage';
import TestGamePage from './pages/TestGamePage';
import CharactersPage from './pages/CharactersPage';
import RelationshipsPage from './pages/RelationshipsPage';

// Components
import Layout from './components/Layout/Layout';
import { LoadingScreen } from './components/UI/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  // 添加调试信息
  console.log('App render:', { isAuthenticated, isLoading, user: user?.username });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Router>
          <Routes>
            {/* 公开路由 */}
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/games" replace /> : <LoginPage />
            } />
            <Route path="/register" element={
              isAuthenticated ? <Navigate to="/games" replace /> : <RegisterPage />
            } />

            {/* 受保护的路由 */}
            <Route path="/" element={
              isAuthenticated ? (
                <ErrorBoundary>
                  <Layout />
                </ErrorBoundary>
              ) : (
                <Navigate to="/login" replace />
              )
            }>
              <Route index element={<Navigate to="/games" replace />} />
              <Route path="games" element={
                <ErrorBoundary>
                  <GameListPage />
                </ErrorBoundary>
              } />
              <Route path="game/create" element={
                <ErrorBoundary>
                  <GameCreatePage />
                </ErrorBoundary>
              } />
              <Route path="game/:gameId" element={
                <ErrorBoundary>
                  <GamePage />
                </ErrorBoundary>
              } />
              <Route path="characters" element={
                <ErrorBoundary>
                  <CharactersPage />
                </ErrorBoundary>
              } />
              <Route path="relationships" element={
                <ErrorBoundary>
                  <RelationshipsPage />
                </ErrorBoundary>
              } />
            </Route>

            {/* 404 重定向 */}
            <Route path="*" element={
              <Navigate to={isAuthenticated ? "/games" : "/login"} replace />
            } />
          </Routes>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
