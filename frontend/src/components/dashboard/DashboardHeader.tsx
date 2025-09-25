import { Box, Container, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import type { User } from "../../lib/api";

interface DashboardHeaderProps {
  user: User;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <Box bg="white" borderBottom="1px" borderColor="gray.200" shadow="sm">
      <Container maxW="container.xl" py={6}>
        <Flex justify="space-between" align="center">
          <VStack align="start" gap={1}>
            <Heading size="xl" color="accent">
              Dashboard
            </Heading>
            <Text color="gray.600">Welcome back, {user.name}</Text>
          </VStack>
          <VStack align="end" gap={0}>
            <Text fontSize="sm" color="gray.500">
              Last updated
            </Text>
            <Text
              fontSize="sm"
              fontWeight="medium"
              color="gray.900"
              textAlign="right"
            >
              {new Date().toLocaleString("nb-NO")}
            </Text>
          </VStack>
        </Flex>
      </Container>
    </Box>
  );
}
