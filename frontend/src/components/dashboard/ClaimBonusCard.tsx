import { useState, useEffect } from "react";
import { Button, Box, Text, HStack } from "@chakra-ui/react";
import { Card } from "@chakra-ui/react";
import { useAuth } from "react-oidc-context";
import { useUserData } from "../../contexts/UserDataProvider";
import { claimBonus, checkBonusAvailability } from "../../lib/api";

export default function ClaimBonusCard() {
  const auth = useAuth();
  const { user, refreshAll } = useUserData();
  const [isClaimingBonus, setIsClaimingBonus] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Sjekk om bonus er tilgjengelig ved mount
  useEffect(() => {
    const checkAvailability = async () => {
      if (!auth.user?.access_token) {
        setIsChecking(false);
        return;
      }

      try {
        const result = await checkBonusAvailability(auth.user.access_token);
        setIsAvailable(result.available);
      } catch (err) {
        console.error("Failed to check bonus availability:", err);
        setIsAvailable(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAvailability();
  }, [auth.user?.access_token]);

  const handleClaimBonus = async () => {
    if (!auth.user?.access_token) return;

    setIsClaimingBonus(true);
    setError(null);
    setMessage(null);

    try {
      const response = await claimBonus(auth.user.access_token);
      setMessage(response.message);
      await refreshAll(); // Refresh hele dashboardet inkludert transaksjoner
      setIsAvailable(false); // Skjul kortet etter vellykket claim
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to claim bonus";
      setError(errorMessage);

      if (errorMessage.includes("Wait 24 hours")) {
        setIsAvailable(false); // Skjul kortet hvis cooldown
      }
    } finally {
      setIsClaimingBonus(false);
    }
  };

  // Ikke vis kortet hvis det sjekkes eller ikke er tilgjengelig
  if (isChecking || !isAvailable) {
    return null;
  }

  return (
    <Card.Root
      p={8}
      position="relative"
      overflow="hidden"
      bg="linear-gradient(135deg, #48bb78 0%, #38a169 50%, #2f855a 100%)"
      color="white"
      boxShadow="xl"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "2xl",
        transition: "all 0.3s ease"
      }}
    >
      {/* Animated background elements */}
      <Box
        position="absolute"
        top="-20px"
        right="-20px"
        w="100px"
        h="100px"
        borderRadius="full"
        bg="whiteAlpha.200"
        animation="pulse 2s infinite"
      />
      <Box
        position="absolute"
        bottom="-30px"
        left="-30px"
        w="150px"
        h="150px"
        borderRadius="full"
        bg="whiteAlpha.100"
        animation="pulse 3s infinite reverse"
      />

      <Card.Body position="relative" zIndex={2}>
        <HStack justify="space-between" align="center" mb={4}>
          <Box>
            <Text fontSize="2xl" fontWeight="bold" mb={2}>
              🎁 Daily Bonus Available!
            </Text>
            <Text fontSize="lg" opacity={0.9}>
              Claim your <Text as="span" fontWeight="bold" color="yellow.200">100kr</Text> bonus now!
            </Text>
          </Box>

          <Text fontSize="4xl" animation="bounce 2s infinite">
            💰
          </Text>
        </HStack>

        {message && (
          <Text color="green.200" mb={4} fontWeight="medium">
            ✅ {message}
          </Text>
        )}

        {error && (
          <Text color="red.200" mb={4} fontWeight="medium">
            ❌ {error}
          </Text>
        )}

        <Button
          size="lg"
          colorPalette="yellow"
          onClick={handleClaimBonus}
          loading={isClaimingBonus}
          disabled={isClaimingBonus}
          w="full"
          fontSize="lg"
          fontWeight="bold"
          py={6}
          bg="yellow.400"
          color="gray.800"
          _hover={{
            bg: "yellow.300",
            transform: "scale(1.05)",
            transition: "all 0.2s ease"
          }}
          _active={{
            transform: "scale(0.98)"
          }}
        >
          {isClaimingBonus ? "Claiming..." : "🚀 Claim 100kr Bonus"}
        </Button>
      </Card.Body>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
      `}</style>
    </Card.Root>
  );
}