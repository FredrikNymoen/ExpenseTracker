import { Box, HStack, Heading, Text, VStack } from "@chakra-ui/react";
import { useAuth } from "react-oidc-context";
import type { User } from "../../lib/api";

interface CurrentProfileInfoProps {
  user: User;
}

export default function CurrentProfileInfo({ user }: CurrentProfileInfoProps) {
  const auth = useAuth();

  return (
    <Box>
      <Heading size="md" mb={4}>
        Current Profile
      </Heading>
      <VStack gap={3} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.600">
            Email
          </Text>
          <Text fontSize="sm" fontWeight="medium">
            {auth.user?.profile.email || "Not available"}
          </Text>
        </HStack>
        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.600">
            Name
          </Text>
          <Text fontSize="sm" fontWeight="medium">
            {user.name}
          </Text>
        </HStack>
        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.600">
            Balance
          </Text>
          <Text fontSize="sm" fontWeight="medium">
            {user.balance.toLocaleString("no-NO")} NOK
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
}