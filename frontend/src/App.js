import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TeamsProvider } from './context/TeamsContext';
import { SidebarProvider } from './context/SidebarContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import { LoadingScreen } from './components/ui';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const IssuesPage = lazy(() => import('./pages/IssuesPage'));
const IssueDetailPage = lazy(() => import('./pages/IssueDetailPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const MyIssuesPage = lazy(() => import('./pages/MyIssuesPage'));
const AdminLogsPage = lazy(() => import('./pages/AdminLogsPage'));
const TeamsPage = lazy(() => import('./pages/TeamsPage'));
const TeamDetailPage = lazy(() => import('./pages/TeamDetailPage'));
const MembersPage = lazy(() => import('./pages/MembersPage'));

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }

  return user ? children : <Navigate to="/login" />;
};

const PageLoader = () => <LoadingScreen message="Loading page..." />;

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <TeamsProvider>
          <SidebarProvider>
            <Router>
              <Toaster
                position="bottom-right"
                toastOptions={{
                  className: '!bg-background-secondary !text-text-primary !border !border-border',
                }}
              />
              <Suspense fallback={<PageLoader />}>
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
                    path="/my-issues/:issuesFilter?"
                    element={
                      <PrivateRoute>
                        <Layout>
                          <MyIssuesPage />
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
                    path="/projects/:projectIdentifier/:tab?"
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
                  <Route
                    path="/admin/logs"
                    element={
                      <PrivateRoute>
                        <Layout>
                          <AdminLogsPage />
                        </Layout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/admin/teams"
                    element={
                      <PrivateRoute>
                        <Layout>
                          <TeamsPage />
                        </Layout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/admin/team/:teamKey/members"
                    element={
                      <PrivateRoute>
                        <Layout>
                          <TeamDetailPage />
                        </Layout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/admin/members"
                    element={
                      <PrivateRoute>
                        <Layout>
                          <MembersPage />
                        </Layout>
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </Suspense>
            </Router>
          </SidebarProvider>
        </TeamsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
