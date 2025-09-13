import { Box, Button, Spinner } from "@chakra-ui/react"
import { useEffect } from "react"
import { useAuth } from "react-oidc-context"
import { useLocation, useNavigate } from "react-router-dom"

export default function Login() {
    const auth = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const from = (location.state as any)?.from?.pathname || "/"

    useEffect(() => {
        if (auth.isAuthenticated) {
            navigate(from, { replace: true })
        }
    }, [auth.isAuthenticated, from, navigate])

    if (auth.isLoading) return <Box><Spinner/>Loading...</Box>
    if (auth.error) return <Box>Auth error: {auth.error.message}</Box>
    if (auth.isAuthenticated) return null

    return (
        <>
            <Button onClick={() => auth.signinRedirect()}>Sign in</Button>
        </>
    )
}