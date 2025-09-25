import {
  Card,
  CardBody,
  Heading,
  VStack,
  HStack,
  Text,
} from "@chakra-ui/react";
import type { User, Transaction } from "../../lib/api";
import { formatCurrency } from "../../utils/formatters";
import RiskSpeedometer from "./RiskSpeedometer";

interface SimpleRiskAnalysisProps {
  user: User;
  transactions: Transaction[];
}

export default function SimpleRiskAnalysis({
  user,
  transactions,
}: SimpleRiskAnalysisProps) {
  // Calculate recent activity (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentTransactions = transactions.filter(
    (t) => new Date(t.tx.date) >= thirtyDaysAgo && t.role === "sent"
  );

  const totalSent = recentTransactions.reduce((sum, t) => sum + t.tx.amount, 0);
  const transactionCount = recentTransactions.length;
  const largeTransactions = recentTransactions.filter(
    (t) => t.tx.amount > 10000
  ).length;
  const averageAmount = transactionCount > 0 ? totalSent / transactionCount : 0;

  const getRiskDescription = (level: string) => {
    switch (level) {
      case "high":
        return "Very active user with frequent large transactions.";
      case "medium":
        return "Moderately active user with regular transaction patterns.";
      default:
        return "Conservative user with minimal transaction activity.";
    }
  };

  return (
    <Card.Root
      bg="white"
      shadow="lg"
      borderWidth="1px"
      borderColor="gray.200"
      width={"100%"}
    >
      <CardBody p={6}>
        <Heading size="lg" mb={6} color="accent">
          Risk Analysis
        </Heading>

        <VStack gap={6} align="stretch">
          {/* Risk Speedometer */}
          <VStack gap={4} align="center">
            <RiskSpeedometer riskScore={user.riskScore} />
          </VStack>
          {/* Risk Description */}
          <Text fontSize="sm" color="gray.600">
            {getRiskDescription(user.riskScore)}
          </Text>
          {/* Activity Summary (Last 30 days) */}
          <VStack gap={3} align="stretch">
            <Text fontSize="sm" fontWeight="medium" color="gray.700">
              Recent Activity (Last 30 Days)
            </Text>

            <VStack gap={2} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">
                  Transactions Sent
                </Text>
                <Text fontSize="sm" fontWeight="medium">
                  {transactionCount}
                </Text>
              </HStack>

              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">
                  Total Amount Sent
                </Text>
                <Text fontSize="sm" fontWeight="medium">
                  {formatCurrency(totalSent)}
                </Text>
              </HStack>

              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">
                  Large Transactions (&gt;10k)
                </Text>
                <Text fontSize="sm" fontWeight="medium">
                  {largeTransactions}
                </Text>
              </HStack>

              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">
                  Average per Transaction
                </Text>
                <Text fontSize="sm" fontWeight="medium">
                  {formatCurrency(averageAmount)}
                </Text>
              </HStack>
            </VStack>
          </VStack>
          {/* Activity Level Info */}
          <VStack gap={2} align="stretch">
            <Text fontSize="sm" fontWeight="medium" color="gray.700">
              Suspicious activity level is based on recent patterns in:
            </Text>
            <VStack gap={1} align="start">
              <Text fontSize="xs" color="gray.500">
                • Transaction volume
              </Text>
              <Text fontSize="xs" color="gray.500">
                • Transaction frequency
              </Text>
            </VStack>
          </VStack>
        </VStack>
      </CardBody>
    </Card.Root>
  );
}
