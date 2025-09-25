import {
  Card,
  CardBody,
  Heading,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Avatar,
  Textarea,
  Box,
  Alert,
} from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { useAuth } from "react-oidc-context";
import type { User, CreateTransactionRequest } from "../../lib/api";
import { createTransaction } from "../../lib/api";
import { formatCurrency } from "../../utils/formatters";
import { toaster } from "../../components/ui/toaster";

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
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Other");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return [];
    return allUsers
      .filter(
        (user) =>
          user.id !== currentUser.id &&
          user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 5); // Limit to 5 results
  }, [searchTerm, allUsers, currentUser.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !amount || !auth.user?.access_token) return;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (amountNum > currentUser.balance) {
      setError("Insufficient balance");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const transactionData: CreateTransactionRequest = {
        receiverId: selectedUser.id,
        amount: amountNum,
        category: category || "Other",
        description: description || "",
      };

      await createTransaction(auth.user.access_token, transactionData);

      // Show success toast
      toaster.create({
        title: "Success!",
        description: `Sent ${formatCurrency(amountNum)} to ${
          selectedUser.name
        }`,
        type: "success",
        duration: 3000,
      });

      // Clear form
      setSelectedUser(null);
      setAmount("");
      setDescription("");
      setSearchTerm("");

      // Refresh data
      onTransactionSuccess();
    } catch (e: any) {
      setError(e?.message || "Failed to send money");
      toaster.create({
        title: "Error",
        description: e?.message || "Failed to send money",
        type: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: "Food", label: "Food" },
    { value: "Transportation", label: "Transportation" },
    { value: "Entertainment", label: "Entertainment" },
    { value: "Shopping", label: "Shopping" },
    { value: "Bills", label: "Bills" },
    { value: "Games", label: "Games" },
    { value: "Education", label: "Education" },
    { value: "Gifts", label: "Gifts" },
    { value: "Other", label: "Other" },
  ];

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
            {/* User Search */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                Send to{" "}
                {selectedUser && (
                  <Text as="span" color="green.600" fontSize="xs">
                    (1 recipient selected)
                  </Text>
                )}
              </Text>
              <Input
                id="recipient-search"
                name="recipientSearch"
                placeholder={
                  selectedUser ? selectedUser.name : "Search by name..."
                }
                value={selectedUser ? selectedUser.name : searchTerm}
                onChange={(e) => !selectedUser && setSearchTerm(e.target.value)}
                bg={selectedUser ? "green.50" : "gray.50"}
                borderColor={selectedUser ? "green.300" : "gray.300"}
                disabled={!!selectedUser}
                cursor={selectedUser ? "not-allowed" : "text"}
                autoComplete="off"
              />
              {!selectedUser && (
                <Text fontSize="xs" color="gray.500" mt={1}>
                  You can only send money to one person at a time
                </Text>
              )}

              {/* Search Results */}
              {searchTerm && filteredUsers.length > 0 && !selectedUser && (
                <VStack
                  mt={2}
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  maxH="200px"
                  overflowY="auto"
                  p={2}
                  gap={1}
                >
                  {filteredUsers.map((user) => (
                    <HStack
                      key={user.id}
                      p={2}
                      w="full"
                      cursor="pointer"
                      borderRadius="md"
                      _hover={{ bg: "gray.50" }}
                      onClick={() => {
                        setSelectedUser(user);
                        setSearchTerm(user.name);
                      }}
                    >
                      <Avatar.Root size="sm">
                        <Avatar.Image
                          src={
                            user.img && user.img.trim() !== ""
                              ? user.img
                              : undefined
                          }
                          alt={user.name}
                        />
                        <Avatar.Fallback name={user.name} />
                      </Avatar.Root>
                      <VStack align="start" gap={0} flex={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          {user.name}
                        </Text>
                      </VStack>
                    </HStack>
                  ))}
                </VStack>
              )}

              {/* Selected User */}
              {selectedUser && (
                <HStack
                  mt={2}
                  p={3}
                  bg="green.50"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="green.200"
                >
                  <Avatar.Root size="sm">
                    <Avatar.Image
                      src={selectedUser.img}
                      alt={selectedUser.name}
                    />
                    <Avatar.Fallback name={selectedUser.name} />
                  </Avatar.Root>
                  <VStack align="start" gap={0} flex={1}>
                    <Text fontSize="sm" fontWeight="medium" color="green.800">
                      Sending to: {selectedUser.name}
                    </Text>
                  </VStack>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    onClick={() => {
                      setSelectedUser(null);
                      setSearchTerm("");
                    }}
                  >
                    ✕ Change
                  </Button>
                </HStack>
              )}
            </Box>

            {/* Amount */}
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
                onChange={(e) => setAmount(e.target.value)}
                bg="gray.50"
                borderColor="gray.300"
                autoComplete="off"
                min="0"
                step="0.01"
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Available balance: {formatCurrency(currentUser.balance)}
              </Text>
            </Box>

            {/* Category */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                Category
              </Text>
              <select
                id="transaction-category"
                name="transactionCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  backgroundColor: "var(--chakra-colors-gray-50)",
                  border: "1px solid var(--chakra-colors-gray-300)",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </Box>

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
