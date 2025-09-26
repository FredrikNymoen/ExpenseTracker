import {
  Card,
  CardBody,
  Heading,
  VStack,
  Button,
  Text,
  Textarea,
  Box,
  Alert,
} from "@chakra-ui/react";
import type { User } from "../../lib/api";
import { formatCurrency } from "../../utils/formatters";
import { useSendMoney } from "../../hooks/transactions/useSendMoney";
import UserSelector from "./UserSelector";
import TransactionAmountInput from "./TransactionAmountInput";
import CategorySelector from "./CategorySelector";

interface SendMoneyFormProps {
  allUsers: User[];
  currentUser: User;
  onTransactionSuccess: () => void;
}

export default function SendMoneyForm({
  allUsers,
  currentUser,
  onTransactionSuccess,
}: SendMoneyFormProps) {
  const {
    loading,
    searchTerm,
    selectedUser,
    amount,
    category,
    description,
    error,
    setSearchTerm,
    setAmount,
    setCategory,
    setDescription,
    handleSubmit,
    handleUserSelect,
    handleUserDeselect,
  } = useSendMoney(currentUser, onTransactionSuccess);

  return (
    <Card.Root bg="white" shadow="lg" borderWidth="1px" borderColor="gray.200">
      <CardBody p={6}>
        <Heading size="lg" mb={6} color="accent">
          Send Money
        </Heading>

        {error && (
          <Alert.Root status="error" mb={4} borderRadius="md">
            <Alert.Indicator />
            <Alert.Title>{error}</Alert.Title>
          </Alert.Root>
        )}

        <form onSubmit={handleSubmit}>
          <VStack gap={4} align="stretch">
            <UserSelector
              allUsers={allUsers}
              currentUserId={currentUser.id}
              searchTerm={searchTerm}
              selectedUser={selectedUser}
              onSearchChange={setSearchTerm}
              onUserSelect={handleUserSelect}
              onUserDeselect={handleUserDeselect}
            />

            <TransactionAmountInput
              amount={amount}
              currentUserBalance={currentUser.balance}
              onAmountChange={setAmount}
            />

            <CategorySelector
              category={category}
              onCategoryChange={setCategory}
            />

            {/* Description */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                Description (optional)
              </Text>
              <Textarea
                id="transaction-description"
                name="transactionDescription"
                placeholder="What's this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                bg="gray.50"
                borderColor="gray.300"
                rows={3}
                autoComplete="off"
              />
            </Box>

            {/* Submit Button */}
            <Button
              type="submit"
              bg="linear-gradient(90deg, #2F855A, #38A169)"
              color="white"
              size="lg"
              disabled={!selectedUser || !amount || loading}
              loading={loading}
              _hover={{
                bg: "linear-gradient(90deg, #276749, #2F855A)",
              }}
            >
              Send {amount ? formatCurrency(parseFloat(amount) || 0) : "Money"}
            </Button>
          </VStack>
        </form>
      </CardBody>
    </Card.Root>
  );
}
