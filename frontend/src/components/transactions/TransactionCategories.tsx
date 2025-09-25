import {
  Card,
  CardBody,
  Heading,
  VStack,
  Text,
  Progress,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { formatCurrency } from "../../utils/formatters";
import type { TransactionStats } from "../../hooks/transactions/useTransactionsData";

interface TransactionCategoriesProps {
  stats: TransactionStats;
}

export default function TransactionCategories({
  stats,
}: TransactionCategoriesProps) {
  const totalAmount = stats.categoryData.reduce(
    (sum, cat) => sum + cat.amount,
    0
  );

  const categoryColors = [
    "blue.500",
    "green.500",
    "purple.500",
    "orange.500",
    "red.500",
    "teal.500",
    "pink.500",
    "cyan.500",
  ];

  return (
    <Card.Root bg="white" shadow="lg" borderWidth="1px" borderColor="gray.200" width={"100%"}>
      <CardBody p={6}>
        <Heading size="lg" mb={6} color="accent">
          Spending by Category
        </Heading>
        {stats.categoryData.length > 0 ? (
          <VStack gap={4} align="stretch">
            {stats.categoryData
              .sort((a, b) => b.amount - a.amount)
              .map((category, index) => {
                const percentage =
                  totalAmount > 0 ? (category.amount / totalAmount) * 100 : 0;
                return (
                  <VStack key={category.category} align="stretch" gap={2}>
                    <HStack justify="space-between">
                      <HStack>
                        <Badge
                          bg={categoryColors[index % categoryColors.length]}
                          color="white"
                          textTransform="capitalize"
                          borderRadius="full"
                        >
                          {category.category}
                        </Badge>
                        <Text fontSize="sm" color="gray.600">
                          {category.count} transactions
                        </Text>
                      </HStack>
                      <VStack align="end" gap={0}>
                        <Text fontWeight="semibold" color="gray.900">
                          {formatCurrency(category.amount)}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {percentage.toFixed(1)}%
                        </Text>
                      </VStack>
                    </HStack>
                    <Progress.Root
                      value={percentage}
                      colorPalette="green"
                      size="sm"
                    >
                      <Progress.Track bg="gray.100">
                        <Progress.Range
                          bg={categoryColors[index % categoryColors.length]}
                        />
                      </Progress.Track>
                    </Progress.Root>
                  </VStack>
                );
              })}
          </VStack>
        ) : (
          <Text color="gray.500" textAlign="center" py={8}>
            No category data available
          </Text>
        )}
      </CardBody>
    </Card.Root>
  );
}
