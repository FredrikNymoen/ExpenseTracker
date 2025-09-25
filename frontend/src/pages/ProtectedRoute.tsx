// ProtectedRoute.tsx (updated to use react-oidc-context)
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { Box, Spinner } from "@chakra-ui/react";
import LoadingScreen from "@/components/LoadingScreen";

export function ProtectedRoute() {
  const auth = useAuth();
  const location = useLocation();

  if (auth.isLoading) return <LoadingScreen />;
  if (auth.error) return <Box>Error: {auth.error.message}</Box>;

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
