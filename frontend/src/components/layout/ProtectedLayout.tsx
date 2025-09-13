import Header from "./Header"
import { Outlet } from "react-router-dom"
import { Box } from "@chakra-ui/react"

export default function ProtectedLayout() {
    return (
        <Box>
            <Header />
            <Box as="main" p={6}>
                <Outlet />
            </Box>
        </Box>
    )
}