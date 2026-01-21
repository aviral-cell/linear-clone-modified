import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TeamsProvider } from './context/TeamsContext';
import { SidebarProvider } from './context/SidebarContext';
import LoginPage from './pages/LoginPage';
import IssuesPage from './pages/IssuesPage';
import IssueDetailPage from './pages/IssueDetailPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <TeamsProvider>
        <SidebarProvider>
          <Router>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#232329',
              color: '#e5e5e6',
              border: '1px solid #2d2d33',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <IssuesPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/all"
            element={
              <PrivateRoute>
                <Layout>
                  <ProjectsPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/team/:teamKey/projects/all"
            element={
              <PrivateRoute>
                <Layout>
                  <ProjectsPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              <PrivateRoute>
                <Layout>
                  <ProjectDetailPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/team/:teamKey/:issuesFilter"
            element={
              <PrivateRoute>
                <Layout>
                  <IssuesPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/issue/:identifier"
            element={
              <PrivateRoute>
                <Layout>
                  <IssueDetailPage />
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
        </SidebarProvider>
      </TeamsProvider>
    </AuthProvider>
  );
}

export default App;
