import {
  Card,
  CardBody,
  SimpleGrid,
  VStack,
  HStack,
  Text,
  Box,
} from "@chakra-ui/react";
import { formatCurrency } from "../../utils/formatters";
import type { TransactionStats } from "../../hooks/transactions/useTransactionsData";
import type { User } from "../../lib/api";

interface CompactOverviewProps {
  stats: TransactionStats;
  user: User;
}

export default function CompactOverview({ stats, user }: CompactOverviewProps) {
  const netFlow = stats.totalReceived - stats.totalSent;

  return (
    <Card.Root bg="white" shadow="lg" borderWidth="1px" borderColor="gray.200">
      <CardBody p={6}>
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={6}>
          {/* Current Balance */}
          <VStack align="start" gap={1}>
            <Text fontSize="sm" color="gray.500" fontWeight="medium">
              Current Balance
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="green.600">
              {formatCurrency(user.balance)}
            </Text>
          </VStack>

          {/* Net Flow */}
          <VStack align="start" gap={1}>
            <Text fontSize="sm" color="gray.500" fontWeight="medium">
              Net Flow
            </Text>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color={netFlow >= 0 ? "green.600" : "red.600"}
            >
              {netFlow >= 0 ? "+" : ""}
              {formatCurrency(netFlow)}
            </Text>
          </VStack>

          {/* Total Transactions */}
          <VStack align="start" gap={1}>
            <Text fontSize="sm" color="gray.500" fontWeight="medium">
              Transactions
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="gray.900">
              {stats.totalTransactions}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {stats.averageTransaction > 0
                ? formatCurrency(stats.averageTransaction) + " avg"
                : "No avg"}
            </Text>
          </VStack>

          {/* Risk Score */}
          <VStack align="start" gap={1}>
            <Text fontSize="sm" color="gray.500" fontWeight="medium">
              Risk Score
            </Text>
            <HStack>
              <Box
                px={3}
                py={1}
                borderRadius="full"
                bg={
                  user.riskScore === "low"
                    ? "green.100"
                    : user.riskScore === "medium"
                    ? "yellow.100"
                    : "red.100"
                }
                color={
                  user.riskScore === "low"
                    ? "green.800"
                    : user.riskScore === "medium"
                    ? "yellow.800"
                    : "red.800"
                }
              >
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  textTransform="capitalize"
                >
                  {user.riskScore}
                </Text>
              </Box>
            </HStack>
          </VStack>
        </SimpleGrid>
      </CardBody>
    </Card.Root>
  );
}
