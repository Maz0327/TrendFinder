import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { useSupabaseUser } from "../hooks/useSupabaseUser";

// Lazy pages (code-splitting)
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("../pages/auth/ForgotPasswordPage"));
const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage"));
const ProjectsPage = lazy(() => import("../pages/projects/ProjectsPage"));
const CapturesInboxPage = lazy(() => import("../pages/captures/CapturesInboxPage"));
const MomentsRadarPage = lazy(() => import("../pages/moments/MomentsRadarPage"));
const BriefBuilderPage = lazy(() => import("../pages/briefs/BriefBuilderPage"));
const BriefDetailPage = lazy(() => import("../pages/briefs/BriefDetailPage"));
const FeedsPage = lazy(() => import("../pages/feeds/FeedsPage"));

function RequireAuth({ children }: { children: JSX.Element }) {
  const { session, loading } = useSupabaseUser();

  useEffect(() => {
    document.title = "Content Radar";
  }, []);

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot" element={<ForgotPasswordPage />} />

          {/* App */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <MainLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="captures" element={<CapturesInboxPage />} />
            <Route path="moments" element={<MomentsRadarPage />} />
            <Route path="briefs" element={<BriefBuilderPage />} />
            <Route path="briefs/:id" element={<BriefDetailPage />} />
            <Route path="feeds" element={<FeedsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
