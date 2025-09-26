import { Box, VStack, Text, Button, Icon } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useAuth } from "react-oidc-context";

const fadeInUpAnimation = "fadeInUp 0.8s ease-out";
const bounceAnimation = "bounce 2s infinite";

interface HeroSectionProps {
  onScrollToFeatures: () => void;
}

export default function HeroSection({ onScrollToFeatures }: HeroSectionProps) {
  const auth = useAuth();
  const fullText = "Welcome to ExpenseTracker";
  const [displayText, setDisplayText] = useState("");

  // Typing animation
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(fullText.slice(0, i + 1));
      i++;
      if (i === fullText.length) clearInterval(interval);
    }, 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      display="flex"
      flexDir="column"
      alignItems="center"
      justifyContent="center"
      h="100vh"
      position="relative"
    >
      <VStack
        gap={8}
        textAlign="center"
        style={{ animation: fadeInUpAnimation }}
        maxW="1000px"
        px={6}
      >
        <Text
          fontSize={{ base: "lg", md: "xl" }}
          fontWeight="bold"
          opacity={0.85}
          style={{ animation: "fadeInUp 0.8s ease-out 0.2s both" }}
          color="rgba(56, 142, 60, 0.9)"
        >
          Send and receive money instantly, securely and hassle-free.
        </Text>

        <Text
          fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
          fontWeight="bold"
          lineHeight="0.9"
          bgClip="text"
          style={{ animation: "fadeInUp 0.8s ease-out 0.4s both" }}
          color="accent"
        >
          {displayText}
        </Text>

        <VStack
          gap={4}
          style={{ animation: "fadeInUp 0.8s ease-out 0.6s both" }}
        >
          <Button
            bg="linear-gradient(90deg, #2F855A, #38A169)"
            color="white"
            size="xl"
            px={12}
            py={8}
            fontSize="xl"
            fontWeight="bold"
            borderRadius="full"
            onClick={() => auth.signinRedirect()}
            _hover={{
              bg: "linear-gradient(90deg, #276749, #2F855A)",
              transform: "translateY(-2px)",
              boxShadow: "0 10px 25px rgba(56, 142, 60, 0.3)",
            }}
            transition="all 0.3s ease"
            boxShadow="0 4px 15px rgba(56, 142, 60, 0.2)"
          >
            Get Started - Login
          </Button>

          <Text
            fontSize="sm"
            textAlign="center"
            color="rgba(56, 142, 60, 0.7)"
            maxW="400px"
            opacity={0.8}
          >
            When you log in, you'll be redirected to Amazon Cognito for secure
            authentication.
          </Text>
        </VStack>
      </VStack>

      {/* Scroll Down Arrow */}
      <Box
        position="absolute"
        bottom="40px"
        style={{ animation: bounceAnimation }}
        cursor="pointer"
        onClick={onScrollToFeatures}
        _hover={{ opacity: 0.7 }}
        transition="opacity 0.2s"
      >
        <VStack gap={2} color="rgba(56, 142, 60, 0.7)">
          <Text fontSize="sm" fontWeight="medium">
            Learn More
          </Text>
          <Icon as={FiChevronDown} boxSize={8} />
        </VStack>
      </Box>
    </Box>
  );
}