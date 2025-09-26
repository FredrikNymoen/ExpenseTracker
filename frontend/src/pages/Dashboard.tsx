import {
  Box,
  Container,
  VStack,
  GridItem,
  Alert,
  SimpleGrid,
} from "@chakra-ui/react";
import LoadingScreen from "@/components/LoadingScreen";
import { useDashboardData } from "../hooks/dashboard/useDashboardData";
import { useTransactionCalculations } from "../hooks/dashboard/useTransactionCalculations";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "../components/ui/PullToRefreshIndicator";
import { formatCurrency, formatDate } from "../utils/formatters";
import MetricCard from "../components/dashboard/MetricCard";
import QuickActions from "../components/dashboard/QuickActions";
import AccountSummary from "../components/dashboard/AccountSummary";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import RecentTransactionsCard from "../components/transactions/RecentTransactionsCard";
import ClaimBonusCard from "../components/dashboard/ClaimBonusCard";
import {
  WalletIcon,
  TrendingUpIcon,
  ShieldIcon,
  ActivityIcon,
} from "../components/icons";

const Dashboard = () => {
  const { loading, user, error, transactions } = useDashboardData();
  const { isPulling, pullDistance, isRefreshing } = usePullToRefresh();
  const {
    totalSent,
    totalReceived,
    recentTransactions,
    sentCount,
    receivedCount,
    netFlow,
  } = useTransactionCalculations(transactions);

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
              <Alert.Title fontSize="lg">Failed to load dashboard</Alert.Title>
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

      <DashboardHeader user={user} />

      <Container maxW="container.xl" py={8}>
        <VStack gap={8} align="stretch">
          {/* Daily Bonus - Highlighted at top */}
          <ClaimBonusCard />

          {/* Key Metrics */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
            <MetricCard
              icon={<WalletIcon />}
              label="Account Balance"
              value={formatCurrency(user.balance)}
              iconBg="blue.100"
              iconColor="blue.600"
            />

            <MetricCard
              icon={<TrendingUpIcon />}
              label="Total Received"
              value={formatCurrency(totalReceived)}
              subtext={`${receivedCount} transactions`}
              iconBg="green.100"
              iconColor="green.600"
              valueColor="green.600"
            />

            <MetricCard
              icon={<ActivityIcon />}
              label="Total Sent"
              value={formatCurrency(totalSent)}
              subtext={`${sentCount} transactions`}
              iconBg="red.100"
              iconColor="red.600"
              valueColor="red.600"
            />

            <MetricCard
              icon={<ShieldIcon />}
              label="Risk Score"
              value={
                user.riskScore.charAt(0).toUpperCase() + user.riskScore.slice(1)
              }
              iconBg="purple.100"
              iconColor="purple.600"
            />
          </SimpleGrid>

          {/* Recent Transactions & Quick Actions */}
          <SimpleGrid columns={{ base: 1, lg: 3 }} gap={8}>
            <GridItem colSpan={{ base: 1, lg: 2 }}>
              <RecentTransactionsCard
                transactions={recentTransactions}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            </GridItem>

            <VStack gap={6}>
              <QuickActions />
              <AccountSummary
                transactions={transactions}
                netFlow={netFlow}
                formatCurrency={formatCurrency}
              />
            </VStack>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

export default Dashboard;
