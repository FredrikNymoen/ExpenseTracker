import { Flex, Text, VStack, Avatar, Tag, Badge } from "@chakra-ui/react";
import type { Transaction } from "../../lib/api";

interface TransactionItemProps {
  transaction: Transaction;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
}

export default function TransactionItem({
  transaction,
  formatCurrency,
  formatDate,
}: TransactionItemProps) {
  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      justify="space-between"
      align={{ base: "stretch", md: "center" }}
      p={4}
      bg="gray.50"
      _hover={{ bg: "gray.100" }}
      transition="background 0.2s"
      gap={{ base: 3, md: 0 }}
    >
      <Flex align="center" minW={0} flex={1}>
        <Avatar.Root size={{ base: "md", md: "lg" }} mr={3} overflow={"hidden"}>
          <Avatar.Image
            src={
              transaction.role === "sent"
                ? transaction.to?.img && transaction.to.img.trim() !== ""
                  ? transaction.to.img
                  : undefined
                : transaction.from?.img && transaction.from.img.trim() !== ""
                ? transaction.from.img
                : undefined
            }
            alt="Profile image"
          />
          <Avatar.Fallback
            name={
              transaction.role === "sent"
                ? transaction.to?.name
                : transaction.from?.name
            }
            bg={transaction.role === "sent" ? "red.500" : "green.500"}
            color="white"
            p={5}
          />
        </Avatar.Root>

        <VStack align="start" gap={1} minW={0} flex={1}>
          <Text
            fontWeight="semibold"
            color="gray.900"
            fontSize={{ base: "sm", md: "md" }}
          >
            {transaction.role === "sent"
              ? `To: ${transaction.to?.name}`
              : `From: ${transaction.from?.name}`}
          </Text>

          <Tag.Root size="sm">
            <Tag.Label fontSize="xs">{transaction.tx.category}</Tag.Label>
          </Tag.Root>

          {transaction.tx.description && (
            <Text
              fontSize="sm"
              color="gray.600"
              lineClamp={transaction.tx.description.length > 200 ? 4 : undefined}
              wordBreak="break-word"
            >
              {transaction.tx.description}
            </Text>
          )}

          <Text fontSize="xs" color="gray.500">
            {formatDate(transaction.tx.date)}
          </Text>
        </VStack>
      </Flex>

      <VStack
        align={{ base: "center", md: "end" }}
        gap={1}
        minW="fit-content"
        flexShrink={0}
      >
        <Text
          fontWeight="bold"
          color={transaction.role === "sent" ? "red.600" : "green.600"}
          fontSize={{ base: "md", md: "lg" }}
          textAlign={{ base: "center", md: "right" }}
        >
          {transaction.role === "sent" ? "-" : "+"}
          {formatCurrency(transaction.tx.amount)}
        </Text>
        <Badge
          bg={transaction.role === "sent" ? "red.200" : "green.200"}
          variant="subtle"
          textTransform="capitalize"
          size="sm"
        >
          {transaction.role}
        </Badge>
      </VStack>
    </Flex>
  );
}
