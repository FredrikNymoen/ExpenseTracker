import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import { Box, Container, Flex, Image } from "@chakra-ui/react";

export default function Callback() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Når auth er ferdig og bruker er autentisert, naviger til dashboard
    if (!auth.isLoading && auth.isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [auth.isAuthenticated, auth.isLoading, navigate]);

  if (auth.error) {
    return <div>Authentication error: {auth.error.message}</div>;
  }

  return (
    <Flex direction="column" minH="100dvh" w="100%" align="stretch">
      <Flex
        as="header"
        h="4.5rem"
        px={{ base: 4, md: 6 }}
        w="100%"
        align="center"
        borderBottomWidth="1px"
        bg="background"
        color="text"
        borderBottomColor="accent"
        justify="center"
        zIndex={10}
      >
        <Image
          src="/expTrLogo.png"
          alt="Logo"
          boxSize={{ base: "140px", md: "180px" }}
          objectFit="contain"
        />
      </Flex>

      <Box as="main" flex="1" bg="linear-gradient(135deg, rgba(56, 142, 60, 0.08), rgba(47, 133, 90, 0.12))">
        <Container maxW="container.xl" py={6}>
          <LoadingScreen />
        </Container>
      </Box>
    </Flex>
  );
}
