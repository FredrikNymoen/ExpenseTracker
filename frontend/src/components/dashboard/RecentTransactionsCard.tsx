import { Box, Card, CardBody, Heading, VStack, Text } from "@chakra-ui/react";
import type { Transaction } from "../../lib/api";
import TransactionItem from "./TransactionItem";

interface RecentTransactionsCardProps {
  transactions: Transaction[];
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
}

export default function RecentTransactionsCard({
  transactions,
  formatCurrency,
  formatDate,
}: RecentTransactionsCardProps) {
  return (
    <Card.Root bg="white" shadow="lg" borderWidth="1px" borderColor="gray.200">
      <CardBody p={6}>
        <Heading size="lg" mb={6} color="accent">
          Recent Transactions
        </Heading>
        {transactions.length > 0 ? (
          <VStack gap={4} align="stretch">
            {transactions.map((transaction, index) => (
              <Box key={index}>
                <TransactionItem
                  transaction={transaction}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
                {index < transactions.length - 1 && (
                  <Box my={4} borderBottom="1px" borderColor="gray.200" />
                )}
              </Box>
            ))}
          </VStack>
        ) : (
          <Box textAlign="center" py={8}>
            <Text color="gray.500" fontSize="lg">
              No transactions yet
            </Text>
            <Text color="gray.400" fontSize="sm">
              Your transaction history will appear here
            </Text>
          </Box>
        )}
      </CardBody>
    </Card.Root>
  );
}
