import { Box, Button, Spinner, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { useLocation, useNavigate } from "react-router-dom";

export default function Login() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from = (location.state as any)?.from?.pathname || "/";

  // Typing animation state
  const fullText = "Welcome to ExpenseTracker";
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [auth.isAuthenticated, from, navigate]);

  // typing animation
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(fullText.slice(0, i + 1));
      i++;
      if (i === fullText.length) clearInterval(interval);
    }, 60); // 100ms per bokstav
    return () => clearInterval(interval);
  }, []);

  if (auth.isLoading)
    return (
      <Box>
        <Spinner /> Loading...
      </Box>
    );
  if (auth.error) return <Box>Auth error: {auth.error.message}</Box>;
  if (auth.isAuthenticated) return null;

  return (
    <Box
      display="flex"
      flexDir="column"
      alignItems="center"
      justifyContent="center"
      h="100vh"
      bg="background"
      color="accent"
      bgImg={"url('/background.png')"}
    >
      <Text fontSize="xl" fontWeight={"bold"} textAlign={"center"}>
        Send and receive money instantly, securely and hassle-free.
      </Text>
      <Text fontSize="5xl" mb={6} fontWeight={"bold"} textAlign={"center"}>
        {displayText}
      </Text>

      <Button bg={"accent"} onClick={() => auth.signinRedirect()}>
        Login
      </Button>

      <Text fontSize="xs" mt={2}>
        When you log in, you’ll be redirected to Amazon Cognito for secure
        authentication.
      </Text>
    </Box>
  );
}
