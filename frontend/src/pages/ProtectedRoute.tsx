// ProtectedRoute.tsx (updated to use react-oidc-context)
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { Box } from "@chakra-ui/react";
import LoadingScreen from "@/components/LoadingScreen";

export function ProtectedRoute() {
  const auth = useAuth();
  const location = useLocation();

  if (auth.isLoading) return <LoadingScreen />;
  if (auth.error) return <Box>Error: {auth.error.message}</Box>;

  if (!auth.isAuthenticated) {
    // Check if we're already being redirected by logout (to avoid double redirect)
    const isLoggingOut = sessionStorage.getItem("logout_in_progress");

    if (!isLoggingOut) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If logout is in progress, just show loading to avoid Navigate trigger
    return <LoadingScreen />;
  }

  return <Outlet />;
}
