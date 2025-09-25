import LoadingScreen from "@/components/LoadingScreen";
import { Box, Button, Text, Image, VStack, Icon } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { useLocation, useNavigate } from "react-router-dom";
import { FiSend, FiUsers, FiTrendingUp, FiChevronDown } from "react-icons/fi";
import Footer from "@/components/layout/Footer";

const bounceAnimation = "bounce 2s infinite";
const fadeInUpAnimation = "fadeInUp 0.8s ease-out";

// CSS animations (add to your global CSS or styled component)
const animationStyles = `
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;

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
    }, 60); // 60ms per character
    return () => clearInterval(interval);
  }, []);

  if (auth.isLoading) return <LoadingScreen />;
  if (auth.error) return <Box>Auth error: {auth.error.message}</Box>;
  if (auth.isAuthenticated) return null;

  const scrollToFeatures = () => {
    document.getElementById("features-section")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <Box
      bg="linear-gradient(135deg, rgba(56, 142, 60, 0.08), rgba(47, 133, 90, 0.12))"
      color="accent"
      bgSize="cover"
      bgRepeat="no-repeat"
      bgPos="bottom"
    >
      {/* Add animation styles */}
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />

      <Image
        src="/expTrLogo.png"
        alt="ExpenseTracker Logo"
        position="absolute"
        top="0px"
        left="0px"
        transform="translateY(-20%)"
        w={{ base: "140px", md: "160px", lg: "180px" }}
        draggable={false}
      />

      {/* Hero Section - Full Screen */}
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
          onClick={scrollToFeatures}
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

      {/* Features Section */}
      <Box id="features-section" py={20}>
        <Box maxW="1200px" mx="auto" px={6}>
          {/* Three medium cards */}
          <VStack
            gap={6}
            w="full"
            maxW="800px"
            align={"center"}
            mx="auto"
            color="rgba(56, 142, 60, 0.9)"
          >
            <Box
              bg="rgba(255, 255, 255, 0.95)"
              p={8}
              borderRadius="xl"
              boxShadow="0 8px 25px rgba(56, 142, 60, 0.15)"
              borderWidth="1px"
              borderColor="rgba(56, 142, 60, 0.2)"
              w="full"
              _hover={{
                transform: "translateY(-4px)",
                boxShadow: "0 12px 30px rgba(56, 142, 60, 0.2)",
                borderColor: "rgba(56, 142, 60, 0.3)",
              }}
              transition="all 0.3s ease"
            >
              <VStack gap={4} align="center" textAlign="center">
                <Box
                  bg="linear-gradient(135deg, rgba(56, 142, 60, 0.1), rgba(47, 133, 90, 0.15))"
                  color="accent"
                  p={4}
                  borderRadius="full"
                  border="2px solid rgba(56, 142, 60, 0.2)"
                >
                  <Icon as={FiSend} boxSize={8} />
                </Box>
                <Text fontSize="xl" fontWeight="bold" color="accent">
                  Instant Transfers
                </Text>
                <Text
                  fontSize="md"
                  color="rgba(56, 142, 60, 0.7)"
                  lineHeight="1.6"
                  maxW="400px"
                >
                  Send money to friends and family in seconds! No more waiting
                  for bank transfers.
                </Text>
              </VStack>
            </Box>

            <Box
              bg="rgba(255, 255, 255, 0.95)"
              p={8}
              borderRadius="xl"
              boxShadow="0 8px 25px rgba(56, 142, 60, 0.15)"
              borderWidth="1px"
              borderColor="rgba(56, 142, 60, 0.2)"
              w="full"
              _hover={{
                transform: "translateY(-4px)",
                boxShadow: "0 12px 30px rgba(56, 142, 60, 0.2)",
                borderColor: "rgba(56, 142, 60, 0.3)",
              }}
              transition="all 0.3s ease"
            >
              <VStack gap={4} align="center" textAlign="center">
                <Box
                  bg="linear-gradient(135deg, rgba(56, 142, 60, 0.1), rgba(47, 133, 90, 0.15))"
                  color="accent"
                  p={4}
                  borderRadius="full"
                  border="2px solid rgba(56, 142, 60, 0.2)"
                >
                  <Icon as={FiTrendingUp} boxSize={8} />
                </Box>
                <Text fontSize="xl" fontWeight="bold" color="accent">
                  Expense Tracking
                </Text>
                <Text
                  fontSize="md"
                  color="rgba(56, 142, 60, 0.7)"
                  lineHeight="1.6"
                  maxW="400px"
                >
                  Monitor your spending patterns with detailed analytics.
                </Text>
              </VStack>
            </Box>

            <Box
              bg="rgba(255, 255, 255, 0.95)"
              p={8}
              borderRadius="xl"
              boxShadow="0 8px 25px rgba(56, 142, 60, 0.15)"
              borderWidth="1px"
              borderColor="rgba(56, 142, 60, 0.2)"
              w="full"
              _hover={{
                transform: "translateY(-4px)",
                boxShadow: "0 12px 30px rgba(56, 142, 60, 0.2)",
                borderColor: "rgba(56, 142, 60, 0.3)",
              }}
              transition="all 0.3s ease"
            >
              <VStack gap={4} align="center" textAlign="center">
                <Box
                  bg="linear-gradient(135deg, rgba(56, 142, 60, 0.1), rgba(47, 133, 90, 0.15))"
                  color="accent"
                  p={4}
                  borderRadius="full"
                  border="2px solid rgba(56, 142, 60, 0.2)"
                >
                  <Icon as={FiUsers} boxSize={8} />
                </Box>
                <Text fontSize="xl" fontWeight="bold" color="accent">
                  24/7 Availability
                </Text>
                <Text
                  fontSize="md"
                  color="rgba(56, 142, 60, 0.7)"
                  lineHeight="1.6"
                  maxW="400px"
                >
                  Transfer money anytime, anywhere. Our platform is always
                  available when you need it.
                </Text>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}
