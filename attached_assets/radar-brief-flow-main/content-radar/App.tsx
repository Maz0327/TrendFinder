import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import CapturesInboxPage from "./pages/captures-inbox/CapturesInboxPage";
import MomentsRadarPage from "./pages/moments-radar/MomentsRadarPage";
import BriefBuilderV2Page from "./pages/brief-builder-v2/BriefBuilderV2Page";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import { useSupabaseUser } from "./hooks/useSupabaseUser";

export default function ContentRadarApp() {
  const { user, loading } = useSupabaseUser();
  if (loading) return null;

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="*" element={<Navigate to="login" replace />} />
        </>
      ) : (
        <>
          <Route path="" element={<Navigate to="captures-inbox" replace />} />
          <Route path="captures-inbox" element={<AppLayout><CapturesInboxPage /></AppLayout>} />
          <Route path="moments-radar" element={<AppLayout><MomentsRadarPage /></AppLayout>} />
          <Route path="brief-builder-v2" element={<AppLayout><BriefBuilderV2Page /></AppLayout>} />
          <Route path="*" element={<Navigate to="captures-inbox" replace />} />
        </>
      )}
    </Routes>
  );
}
