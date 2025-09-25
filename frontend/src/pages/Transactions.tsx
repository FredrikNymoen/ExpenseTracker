import {
  Box,
  Container,
  VStack,
  GridItem,
  Alert,
  SimpleGrid,
  Heading,
  Text,
  Tabs,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import { useTransactionsData } from "../hooks/transactions/useTransactionsData";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "../components/ui/PullToRefreshIndicator";

import TransactionChart from "../components/transactions/TransactionChart";
import TransactionCategories from "../components/transactions/TransactionCategories";
import SendMoneyForm from "../components/transactions/SendMoneyForm";
import SimpleRiskAnalysis from "../components/transactions/SimpleRiskAnalysis";
import RecentTransactionsCard from "../components/dashboard/RecentTransactionsCard";
import { formatCurrency, formatDate } from "../utils/formatters";

export default function Transactions() {
  const { loading, error, transactions, allUsers, stats, user, refetch } =
    useTransactionsData();
  const { isPulling, pullDistance, isRefreshing } = usePullToRefresh();
  const [activeTab, setActiveTab] = useState("send-money");

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Container maxW="md">
          <Alert.Root status="error" borderRadius="lg" p={6}>
            <Alert.Indicator />
            <VStack align="start" gap={2}>
              <Alert.Title fontSize="lg">
                Failed to load transactions
              </Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </VStack>
          </Alert.Root>
        </Container>
      </Box>
    );
  }

  if (!user) return null;

  return (
    <Box minH="100vh" position="relative">
      <PullToRefreshIndicator
        isPulling={isPulling}
        pullDistance={pullDistance}
        isRefreshing={isRefreshing}
      />

      <Container maxW="container.xl" py={8}>
        <VStack gap={8} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="xl" color="accent" mb={2}>
              Transactions
            </Heading>
            <Text color="gray.800">
              Manage your money and view transaction history
            </Text>
          </Box>

          {/* Main Content Tabs */}
          <Tabs.Root
            value={activeTab}
            onValueChange={(details) => setActiveTab(details.value)}
            variant="enclosed"
          >
            <Tabs.List>
              <Tabs.Trigger value="send-money">Send Money</Tabs.Trigger>
              <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
              <Tabs.Trigger value="all-transactions">
                All Transactions
              </Tabs.Trigger>
            </Tabs.List>

            {/* Send Money Tab */}
            <Tabs.Content value="send-money">
              <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6}>
                <GridItem colSpan={{ base: 1, lg: 2 }}>
                  <SendMoneyForm
                    allUsers={allUsers}
                    currentUser={user}
                    onTransactionSuccess={refetch}
                  />
                </GridItem>
                <GridItem colSpan={{ base: 1, lg: 1 }}>
                  <Card.Root
                    bg="white"
                    shadow="lg"
                    borderWidth="1px"
                    borderColor="gray.200"
                  >
                    <CardBody p={6}>
                      <Heading size="md" mb={4} color="accent">
                        Your Balance
                      </Heading>
                      <Text
                        fontSize="3xl"
                        fontWeight="bold"
                        color="green.600"
                        mb={2}
                      >
                        {formatCurrency(user.balance)}
                      </Text>
                      <Text fontSize="sm" color="gray.600" mb={4}>
                        Available to send
                      </Text>

                      <VStack gap={3} align="stretch">
                        <Box
                          p={3}
                          bg="yellow.50"
                          borderRadius="md"
                          borderLeft="4px solid"
                          borderColor="yellow.400"
                        >
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="yellow.800"
                          >
                            Transactions are instant and irreversible
                          </Text>
                        </Box>
                      </VStack>
                    </CardBody>
                  </Card.Root>
                </GridItem>
              </SimpleGrid>
            </Tabs.Content>

            {/* Overview Tab */}
            <Tabs.Content value="overview">
              <VStack gap={6} align="stretch">
                {stats ? (
                  <>
                    {/* Charts */}
                    <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
                      <TransactionChart
                        title="Daily Activity (Last 30 Days)"
                        data={stats.dailyData}
                        dataKey="date"
                        stats={stats}
                      />
                      <TransactionChart
                        title="Monthly Overview"
                        data={stats.monthlyData}
                        dataKey="month"
                        stats={stats}
                      />
                    </SimpleGrid>

                    {/* Categories, Risk Analysis and Recent Transactions */}
                    <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6}>
                      <GridItem colSpan={{ base: 1, lg: 1 }}>
                        <VStack gap={6}>
                          <TransactionCategories stats={stats} />
                          <SimpleRiskAnalysis
                            user={user}
                            transactions={transactions}
                          />
                        </VStack>
                      </GridItem>
                      <GridItem colSpan={{ base: 1, lg: 2 }}>
                        <RecentTransactionsCard
                          transactions={transactions.slice(0, 6)}
                          formatCurrency={formatCurrency}
                          formatDate={formatDate}
                        />
                      </GridItem>
                    </SimpleGrid>
                  </>
                ) : (
                  <Box textAlign="center" py={8}>
                    <Text color="gray.500">
                      Loading transaction statistics...
                    </Text>
                  </Box>
                )}
              </VStack>
            </Tabs.Content>

            {/* All Transactions Tab */}
            <Tabs.Content value="all-transactions">
              <RecentTransactionsCard
                transactions={transactions}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            </Tabs.Content>
          </Tabs.Root>
        </VStack>
      </Container>
    </Box>
  );
}
