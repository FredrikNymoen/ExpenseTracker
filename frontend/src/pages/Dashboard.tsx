import { useEffect, useState } from "react";
import {
  Box,
  Text,
  Container,
  VStack,
  GridItem,
  Alert,
  Card,
  Heading,
  SimpleGrid,
  CardBody,
  Stat,
  Badge,
  Icon,
  Flex,
  Avatar,
  Button,
  Tag,
} from "@chakra-ui/react";
import { useAuth } from "react-oidc-context";
import type { User } from "../lib/api";
import type { Transaction } from "../lib/api";
import { ensureMe, getUserTransactions } from "../lib/api";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "@/components/LoadingScreen";

// Icons (you can replace these with actual Chakra icons or lucide-react)
const WalletIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h9zM12 16h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10.5V11.5C15.4,11.5 16,12.4 16,13V16C16,17.4 15.4,18 14.8,18H9.2C8.6,18 8,17.4 8,16V13C8,12.4 8.6,11.5 9.2,11.5V10.5C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10.5V11.5H13.5V10.5C13.5,8.7 12.8,8.2 12,8.2Z" />
  </svg>
);

const ActivityIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 12c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2s10 4.48 10 10zm-2 0l-4-4v3H8v2h8v3l4-4z" />
  </svg>
);

const Dashboard = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Color mode values
  const bgGradient = "linear(to-br, gray.50, blue.50, purple.50)";
  const cardBg = "white";
  const borderColor = "gray.200";

  useEffect(() => {
    if (auth.isLoading) return;
    if (!auth.isAuthenticated) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const token = auth.user?.access_token; // eller id_token, se pkt 4
    const ctrl = new AbortController();

    (async () => {
      try {
        setLoading(true);

        const defaultName = auth.user?.profile.name || "Unnamed user"; // fallback
        const me = await ensureMe(token!, defaultName);
        setUser(me);

        const transactionsResponse = await getUserTransactions(me.id);

        if (!Array.isArray(transactionsResponse)) {
          throw new Error("Invalid transactions data");
        }
        setTransactions(transactionsResponse);

        setError(null);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          setError(e?.message || "Could not fetch user data");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [auth.isLoading, auth.isAuthenticated]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("nb-NO", {
      style: "currency",
      currency: "NOK",
    }).format(amount);

  const getRiskBadgeColor = (score: string) => {
    if (score === "low") return "green.300";
    if (score === "medium") return "yellow.300";
    return "red.300";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nb-NO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRecentTransactions = () => transactions.slice(0, 5);

  const getTotalSent = () =>
    transactions
      .filter((t) => t.role === "sent")
      .reduce((sum, t) => sum + t.tx.amount, 0);

  const getTotalReceived = () =>
    transactions
      .filter((t) => t.role === "received")
      .reduce((sum, t) => sum + t.tx.amount, 0);

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <Box
        minH="100vh"
        bgGradient={bgGradient}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Container maxW="md">
          <Alert.Root status="error" borderRadius="lg" p={6}>
            <Alert.Indicator />
            <VStack align="start" gap={2}>
              <Alert.Title fontSize="lg">Failed to load dashboard</Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </VStack>
          </Alert.Root>
        </Container>
      </Box>
    );
  }

  if (!user) return null; // defensive guard

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      {/* Header */}
      <Box bg={cardBg} borderBottom="1px" borderColor={borderColor} shadow="sm">
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
                textAlign={"right"}
              >
                {new Date().toLocaleString("nb-NO")}
              </Text>
            </VStack>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="container.xl" py={8}>
        <VStack gap={8} align="stretch">
          {/* Key Metrics */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
            {/* Account Balance */}
            <Card.Root
              bg={cardBg}
              shadow="lg"
              borderWidth="1px"
              borderColor={borderColor}
              _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
              transition="all 0.2s"
            >
              <CardBody>
                <Flex align="center">
                  <Box
                    p={3}
                    borderRadius="full"
                    bg="blue.100"
                    color="blue.600"
                    mr={4}
                  >
                    <WalletIcon />
                  </Box>
                  <Stat.Root>
                    <Stat.Label
                      color="gray.600"
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      Account Balance
                    </Stat.Label>
                    <Stat.ValueText
                      fontSize="2xl"
                      fontWeight="bold"
                      color="gray.900"
                    >
                      {formatCurrency(user.balance)}
                    </Stat.ValueText>
                  </Stat.Root>
                </Flex>
              </CardBody>
            </Card.Root>

            {/* Total Received */}
            <Card.Root
              bg={cardBg}
              shadow="lg"
              borderWidth="1px"
              borderColor={borderColor}
              _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
              transition="all 0.2s"
            >
              <CardBody>
                <Flex align="center">
                  <Box
                    p={3}
                    borderRadius="full"
                    bg="green.100"
                    color="green.600"
                    mr={4}
                  >
                    <TrendingUpIcon />
                  </Box>
                  <Stat.Root>
                    <Stat.Label
                      color="gray.600"
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      Total Received
                    </Stat.Label>
                    <Stat.ValueText
                      fontSize="2xl"
                      fontWeight="bold"
                      color="green.600"
                    >
                      {formatCurrency(getTotalReceived())}
                    </Stat.ValueText>
                    <Text fontSize="xs" color="gray.500">
                      {transactions.filter((t) => t.role === "received").length}{" "}
                      transactions
                    </Text>
                  </Stat.Root>
                </Flex>
              </CardBody>
            </Card.Root>

            {/* Total Sent */}
            <Card.Root
              bg={cardBg}
              shadow="lg"
              borderWidth="1px"
              borderColor={borderColor}
              _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
              transition="all 0.2s"
            >
              <CardBody>
                <Flex align="center">
                  <Box
                    p={3}
                    borderRadius="full"
                    bg="red.100"
                    color="red.600"
                    mr={4}
                  >
                    <ActivityIcon />
                  </Box>
                  <Stat.Root>
                    <Stat.Label
                      color="gray.600"
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      Total Sent
                    </Stat.Label>
                    <Stat.ValueText
                      fontSize="2xl"
                      fontWeight="bold"
                      color="red.600"
                    >
                      {formatCurrency(getTotalSent())}
                    </Stat.ValueText>
                    <Text fontSize="xs" color="gray.500">
                      {transactions.filter((t) => t.role === "sent").length}{" "}
                      transactions
                    </Text>
                  </Stat.Root>
                </Flex>
              </CardBody>
            </Card.Root>

            {/* Risk Score */}
            <Card.Root
              bg={cardBg}
              shadow="lg"
              borderWidth="1px"
              borderColor={borderColor}
              _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
              transition="all 0.2s"
            >
              <CardBody>
                <Flex align="center">
                  <Box
                    p={3}
                    borderRadius="full"
                    bg="purple.100"
                    color="purple.600"
                    mr={4}
                  >
                    <ShieldIcon />
                  </Box>
                  <Stat.Root>
                    <Stat.Label
                      color="gray.600"
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      Risk Score
                    </Stat.Label>
                    <Box mt={2}>
                      <Badge
                        bg={getRiskBadgeColor(user.riskScore)}
                        px={3}
                        py={1}
                        borderRadius="full"
                        textTransform="capitalize"
                        fontSize="sm"
                        fontWeight="medium"
                      >
                        {user.riskScore}
                      </Badge>
                    </Box>
                  </Stat.Root>
                </Flex>
              </CardBody>
            </Card.Root>
          </SimpleGrid>

          {/* Recent Transactions & Quick Actions */}
          <SimpleGrid columns={{ base: 1, lg: 3 }} gap={8}>
            {/* Recent Transactions */}
            <GridItem colSpan={{ base: 1, lg: 2 }}>
              <Card.Root
                bg={cardBg}
                shadow="lg"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <CardBody p={6}>
                  <Heading size="lg" mb={6} color="accent">
                    Recent Transactions
                  </Heading>
                  {getRecentTransactions().length > 0 ? (
                    <VStack gap={4} align="stretch">
                      {getRecentTransactions().map((transaction, index) => (
                        <Box key={index}>
                          <Flex
                            justify="space-between"
                            align="center"
                            p={4}
                            bg="gray.50"
                            _hover={{ bg: "gray.100" }}
                            transition="background 0.2s"
                          >
                            
                            <Flex align="center">
                              <Avatar.Root size="lg" mr={4}>
                                <Avatar.Image
                                  src={transaction.role === "sent" ? transaction.to?.img : transaction.from?.img}
                                  alt="Profile image"
                                />
                                <Avatar.Fallback
                                  name={
                                    transaction.role === "sent"
                                      ? transaction.to?.name
                                      : transaction.from?.name
                                  }
                                  bg={
                                    transaction.role === "sent"
                                      ? "red.500"
                                      : "green.500"
                                  }
                                  color="white"
                                />
                                
                              
                              </Avatar.Root>
                              <VStack align="start" gap={0}>
                                <Text fontWeight="semibold" color="gray.900">
                                  {transaction.role === "sent"
                                    ? `To: ${transaction.to?.name}`
                                    : `From: ${transaction.from?.name}`}
                                </Text>

                                <Tag.Root>
                                  <Tag.Label>
                                    {transaction.tx.category}
                                  </Tag.Label>
                                </Tag.Root>

                                <Text
                                  fontSize="sm"
                                  color="gray.600"
                                  maxW="100%" 
                                  whiteSpace="normal" // lets the text go to next line
                                  wordBreak="break-word"
                                >
                                  {transaction.tx.description} 
                                </Text>

                                <Text fontSize="xs" color="gray.500">
                                  {formatDate(transaction.tx.date)}
                                </Text>
                              </VStack>
                            </Flex>
                            <VStack align="end" gap={0}>
                              <Text
                                fontWeight="bold"
                                color={
                                  transaction.role === "sent"
                                    ? "red.600"
                                    : "green.600"
                                }
                                fontSize="lg"
                              >
                                {transaction.role === "sent" ? "-" : "+"}
                                {formatCurrency(transaction.tx.amount)}
                              </Text>
                              <Badge
                                bg={
                                  transaction.role === "sent"
                                    ? "red.200"
                                    : "green.200"
                                }
                                variant="subtle"
                                textTransform="capitalize"
                              >
                                {transaction.role}
                              </Badge>
                            </VStack>
                          </Flex>
                          {index < getRecentTransactions().length - 1 && (
                            <Box
                              my={4}
                              borderBottom="1px"
                              borderColor="gray.200"
                            />
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
            </GridItem>

            {/* Quick Actions */}
            <VStack gap={6}>
              <Card.Root
                bg={cardBg}
                shadow="lg"
                borderWidth="1px"
                borderColor={borderColor}
                w="full"
              >
                <CardBody p={6}>
                  <Heading size="lg" mb={4} color="accent">
                    Quick Actions
                  </Heading>
                  <VStack gap={3}>
                    <Button
                      bg={"black"}
                      size="lg"
                      w="full"
                      onClick={() =>
                        navigate("/transactions", { replace: true })
                      }
                    >
                      <Icon as={WalletIcon} />
                      Send Money
                    </Button>
                    <Button
                      bg={"black"}
                      size="lg"
                      w="full"
                      onClick={() =>
                        navigate("/transactions", { replace: true })
                      }
                    >
                      <Icon as={ActivityIcon} />
                      View All Transactions
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      w="full"
                      onClick={() => navigate("/profile", { replace: true })}
                    >
                      <Icon as={ShieldIcon} />
                      Account Settings
                    </Button>
                  </VStack>
                </CardBody>
              </Card.Root>

              {/* Account Summary */}
              <Card.Root
                bg={cardBg}
                shadow="lg"
                borderWidth="1px"
                borderColor={borderColor}
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
                        color={
                          getTotalReceived() - getTotalSent() >= 0
                            ? "green.600"
                            : "red.600"
                        }
                      >
                        {formatCurrency(getTotalReceived() - getTotalSent())}
                      </Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="gray.600">Account Status</Text>
                      <Badge bg="green.200">Active</Badge>
                    </Flex>
                  </VStack>
                </CardBody>
              </Card.Root>
            </VStack>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

export default Dashboard;
