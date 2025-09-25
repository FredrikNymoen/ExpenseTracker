import Header from "./Header";
import { Outlet } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/react";
import Footer from "./Footer";

export default function ProtectedLayout() {
  return (
    <Flex direction="column" minH="100dvh"> 
      {" "} 
      <Header />
      <Box
        as="main"
        flex="1" // takes up remaining space
        p={6}
        bg="linear-gradient(135deg, rgba(56, 142, 60, 0.08), rgba(47, 133, 90, 0.12))"
      >
        <Outlet />
      </Box>
      <Footer />
    </Flex>
  );
}
