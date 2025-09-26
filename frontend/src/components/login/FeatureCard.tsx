import { Box, VStack, Text, Icon } from "@chakra-ui/react";
import type { IconType } from "react-icons";

interface FeatureCardProps {
  icon: IconType;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
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
          <Icon as={icon} boxSize={8} />
        </Box>
        <Text fontSize="xl" fontWeight="bold" color="accent">
          {title}
        </Text>
        <Text
          fontSize="md"
          color="rgba(56, 142, 60, 0.7)"
          lineHeight="1.6"
          maxW="400px"
        >
          {description}
        </Text>
      </VStack>
    </Box>
  );
}