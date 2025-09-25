import {
  Card,
  CardBody,
  Heading,
  VStack,
  Flex,
  Text,
  Badge,
} from "@chakra-ui/react";
import type { Transaction } from "../../lib/api";

interface AccountSummaryProps {
  transactions: Transaction[];
  netFlow: number;
  formatCurrency: (amount: number) => string;
}

export default function AccountSummary({
  transactions,
  netFlow,
  formatCurrency,
}: AccountSummaryProps) {
  return (
    <Card.Root
      bg="white"
      shadow="lg"
      borderWidth="1px"
      borderColor="gray.200"
      w="full"
    >
      <CardBody p={6}>
        <Heading size="lg" mb={4} color="accent">
          Account Summary
        </Heading>
        <VStack gap={4} align="stretch">
          <Flex justify="space-between">
            <Text color="gray.600">Total Transactions</Text>
            <Text fontWeight="semibold">{transactions.length}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="gray.600">Net Flow</Text>
            <Text
              fontWeight="semibold"
              color={netFlow >= 0 ? "green.600" : "red.600"}
            >
              {formatCurrency(netFlow)}
            </Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="gray.600">Account Status</Text>
            <Badge bg="green.200">Active</Badge>
          </Flex>
        </VStack>
      </CardBody>
    </Card.Root>
  );
}
