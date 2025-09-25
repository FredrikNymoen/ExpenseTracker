import { useMemo } from "react";
import type { Transaction } from "../../lib/api";

export const useTransactionCalculations = (transactions: Transaction[]) => {
  const calculations = useMemo(() => {
    const totalSent = transactions
      .filter((t) => t.role === "sent")
      .reduce((sum, t) => sum + t.tx.amount, 0);

    const totalReceived = transactions
      .filter((t) => t.role === "received")
      .reduce((sum, t) => sum + t.tx.amount, 0);

    const recentTransactions = transactions.slice(0, 5);

    const sentCount = transactions.filter((t) => t.role === "sent").length;
    const receivedCount = transactions.filter(
      (t) => t.role === "received"
    ).length;

    const netFlow = totalReceived - totalSent;

    return {
      totalSent,
      totalReceived,
      recentTransactions,
      sentCount,
      receivedCount,
      netFlow,
    };
  }, [transactions]);

  return calculations;
};
