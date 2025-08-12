import React from "react";
import { Route, Switch, useLocation } from "wouter";
import AppLayout from "./layout/AppLayout";
import CapturesInboxPage from "./pages/captures-inbox/CapturesInboxPage";
import MomentsRadarPage from "./pages/moments-radar/MomentsRadarPage";
import BriefBuilderV2Page from "./pages/brief-builder-v2/BriefBuilderV2Page";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import { useSupabaseUser } from "./hooks/useSupabaseUser";

export default function ContentRadarApp() {
  const { user, isLoading } = useSupabaseUser();
  const [location, navigate] = useLocation();

  // Handle redirects after hooks are called
  React.useEffect(() => {
    if (isLoading) return;
    
    // Redirect to login if not authenticated
    if (!user && !location.includes('login') && !location.includes('register') && !location.includes('forgot-password')) {
      navigate('/app-v2/login');
      return;
    }

    // Redirect to captures-inbox if authenticated and at root
    if (user && location === '/app-v2') {
      navigate('/app-v2/captures-inbox');
    }
  }, [user, isLoading, location, navigate]);

  // Show loading while checking auth (after all hooks are called)
  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <Switch>
      {!user ? (
        <>
          <Route path="/app-v2/login" component={LoginPage} />
          <Route path="/app-v2/register" component={RegisterPage} />
          <Route path="/app-v2/forgot-password" component={ForgotPasswordPage} />
        </>
      ) : (
        <>
          <Route path="/app-v2/captures-inbox">
            <AppLayout><CapturesInboxPage /></AppLayout>
          </Route>
          <Route path="/app-v2/moments-radar">
            <AppLayout><MomentsRadarPage /></AppLayout>
          </Route>
          <Route path="/app-v2/brief-builder-v2">
            <AppLayout><BriefBuilderV2Page /></AppLayout>
          </Route>
        </>
      )}
    </Switch>
  );
}
