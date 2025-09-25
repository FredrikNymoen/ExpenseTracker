import { Box, Text, VStack, HStack, Badge } from "@chakra-ui/react";

interface RiskSpeedometerProps {
  riskScore: string;
}

export default function RiskSpeedometer({ riskScore }: RiskSpeedometerProps) {
  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "high":
        return "red";
      case "medium":
        return "yellow";
      default:
        return "green";
    }
  };

  const getRiskEmoji = (level: string) => {
    switch (level.toLowerCase()) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      default:
        return "🟢";
    }
  };

  return (
    <VStack gap={4} align="center">
      {/* Simple visual indicator */}
      <HStack gap={2} align="center">
        <Text fontSize="2xl">{getRiskEmoji(riskScore)}</Text>
        <Badge
          bg={`${getRiskColor(riskScore)}.100`}
          color={`${getRiskColor(riskScore)}.800`}
          px={4}
          py={2}
          borderRadius="full"
          fontSize="lg"
          fontWeight="bold"
          textTransform="capitalize"
        >
          {riskScore} Risk
        </Badge>
      </HStack>

      {/* Simple progress bar */}
      <Box width="200px">
        <HStack justify="space-between" mb={2}>
          <Text fontSize="xs" fontWeight="bold" color="green.600">
            LOW
          </Text>
          <Text fontSize="xs" fontWeight="bold" color="yellow.600">
            MEDIUM
          </Text>
          <Text fontSize="xs" fontWeight="bold" color="red.600">
            HIGH
          </Text>
        </HStack>

        <Box
          width="100%"
          height="8px"
          bg="gray.200"
          borderRadius="full"
          position="relative"
          overflow="hidden"
        >
          {/* Background zones */}
          <Box
            position="absolute"
            left="0"
            width="33.33%"
            height="100%"
            bg="green.300"
          />
          <Box
            position="absolute"
            left="33.33%"
            width="33.33%"
            height="100%"
            bg="yellow.300"
          />
          <Box
            position="absolute"
            left="66.66%"
            width="33.34%"
            height="100%"
            bg="red.300"
          />

          {/* Indicator dot */}
          <Box
            position="absolute"
            top="-2px"
            left={
              riskScore.toLowerCase() === "high"
                ? "66.5%"
                : riskScore.toLowerCase() === "medium"
                ? "50%"
                : "16.5%"
            }
            transform="translateX(-50%)"
            width="12px"
            height="12px"
            bg={`${getRiskColor(riskScore)}.500`}
            borderRadius="full"
            border="2px solid white"
            shadow="md"
          />
        </Box>
      </Box>
    </VStack>
  );
}
