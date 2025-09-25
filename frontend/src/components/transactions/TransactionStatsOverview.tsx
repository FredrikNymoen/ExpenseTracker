import { SimpleGrid } from "@chakra-ui/react";
import MetricCard from "../dashboard/MetricCard";
import { TrendingUpIcon, ActivityIcon, WalletIcon } from "../icons";
import { formatCurrency } from "../../utils/formatters";
import type { TransactionStats } from "../../hooks/transactions/useTransactionsData";

interface TransactionStatsOverviewProps {
  stats: TransactionStats;
}

export default function TransactionStatsOverview({
  stats,
}: TransactionStatsOverviewProps) {
  const netFlow = stats.totalReceived - stats.totalSent;

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
      <MetricCard
        icon={<TrendingUpIcon />}
        label="Total Received"
        value={formatCurrency(stats.totalReceived)}
        iconBg="green.100"
        iconColor="green.600"
        valueColor="green.600"
      />

      <MetricCard
        icon={<ActivityIcon />}
        label="Total Sent"
        value={formatCurrency(stats.totalSent)}
        iconBg="red.100"
        iconColor="red.600"
        valueColor="red.600"
      />

      <MetricCard
        icon={<WalletIcon />}
        label="Net Flow"
        value={formatCurrency(netFlow)}
        iconBg={netFlow >= 0 ? "green.100" : "red.100"}
        iconColor={netFlow >= 0 ? "green.600" : "red.600"}
        valueColor={netFlow >= 0 ? "green.600" : "red.600"}
      />

      <MetricCard
        icon={<ActivityIcon />}
        label="Average Transaction"
        value={formatCurrency(stats.averageTransaction)}
        subtext={`${stats.totalTransactions} total`}
        iconBg="blue.100"
        iconColor="blue.600"
      />
    </SimpleGrid>
  );
}
