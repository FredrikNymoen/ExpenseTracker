import { Box, Text, Input } from "@chakra-ui/react";
import { formatCurrency } from "../../utils/formatters";

interface TransactionAmountInputProps {
  amount: string;
  currentUserBalance: number;
  onAmountChange: (amount: string) => void;
}

export default function TransactionAmountInput({
  amount,
  currentUserBalance,
  onAmountChange,
}: TransactionAmountInputProps) {
  return (
    <Box>
      <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
        Amount
      </Text>
      <Input
        id="transaction-amount"
        name="transactionAmount"
        type="number"
        placeholder="0.00"
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
        bg="gray.50"
        borderColor="gray.300"
        autoComplete="off"
        min="0"
        step="0.01"
      />
      <Text fontSize="xs" color="gray.500" mt={1}>
        Available balance: {formatCurrency(currentUserBalance)}
      </Text>
    </Box>
  );
}