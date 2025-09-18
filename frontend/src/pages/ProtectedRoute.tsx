// ProtectedRoute.tsx (updated to use react-oidc-context)
import { Outlet, Navigate, useLocation } from "react-router-dom"
import { useAuth } from "react-oidc-context"
import { Box, Spinner } from "@chakra-ui/react"
import Header from "@/components/layout/Header"

export function ProtectedRoute() {
    const auth = useAuth()
    const location = useLocation()

    if (auth.isLoading) return <Box><Spinner/>Loading...</Box>
    if (auth.error) return <Box>Error: {auth.error.message}</Box>

    if (!auth.isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return (
        <Box>
            <Header />
            <Box as="main" p={6}>
                <Outlet />
            </Box>
        </Box>
    )
}