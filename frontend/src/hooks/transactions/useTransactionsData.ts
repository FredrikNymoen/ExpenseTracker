import { useState, useEffect } from "react";
import type { Transaction } from "../../lib/api";
import { useUserData } from "../../contexts/UserDataProvider";

export interface TransactionStats {
  totalSent: number;
  totalReceived: number;
  totalTransactions: number;
  averageTransaction: number;
  monthlyData: Array<{ month: string; sent: number; received: number }>;
  categoryData: Array<{ category: string; amount: number; count: number }>;
  dailyData: Array<{ date: string; sent: number; received: number }>;
}

export const useTransactionsData = () => {
  const {
    user,
    transactions,
    allUsers,
    loading: userLoading,
    refetchTransactions,
  } = useUserData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<TransactionStats | null>(null);

  useEffect(() => {
    if (!user || userLoading) return;

    const calculateStats = () => {
      try {
        setLoading(true);

        // Calculate basic statistics
        const totalSent = transactions
          .filter((t) => t.role === "sent")
          .reduce((sum, t) => sum + t.tx.amount, 0);

        const totalReceived = transactions
          .filter((t) => t.role === "received")
          .reduce((sum, t) => sum + t.tx.amount, 0);

        const totalTransactions = transactions.length;
        const averageTransaction =
          totalTransactions > 0
            ? (totalSent + totalReceived) / totalTransactions
            : 0;

        // Monthly data calculation
        const monthlyMap = new Map<
          string,
          { sent: number; received: number }
        >();

        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const key = date.toISOString().slice(0, 7);
          monthlyMap.set(key, { sent: 0, received: 0 });
        }

        transactions
          .filter((t) => t.role === "sent" || t.role === "received")
          .forEach((t) => {
            const transactionDate = new Date(t.tx.date);
            const key = transactionDate.toISOString().slice(0, 7);
            if (monthlyMap.has(key)) {
              const existing = monthlyMap.get(key)!;
              if (t.role === "sent") {
                existing.sent += t.tx.amount;
              } else {
                existing.received += t.tx.amount;
              }
            }
          });

        const monthlyData = Array.from(monthlyMap.entries()).map(
          ([key, data]) => {
            const date = new Date(key + "-01");
            const month = date.toLocaleDateString("en-US", { month: "short" });
            return { month, sent: data.sent, received: data.received };
          }
        );

        // Category data calculation - only sent transactions
        const categoryMap = new Map<
          string,
          { amount: number; count: number }
        >();
        transactions
          .filter((t) => t.role === "sent")
          .forEach((t) => {
            const category = t.tx.category;
            if (!categoryMap.has(category)) {
              categoryMap.set(category, { amount: 0, count: 0 });
            }
            const existing = categoryMap.get(category)!;
            existing.amount += t.tx.amount;
            existing.count += 1;
          });

        const categoryData = Array.from(categoryMap.entries())
          .map(([category, data]) => ({
            category,
            amount: data.amount,
            count: data.count,
          }))
          .sort((a, b) => b.amount - a.amount);

        // Daily data calculation - last 30 days
        const dailyMap = new Map<string, { sent: number; received: number }>();

        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const key = `${year}-${month}-${day}`;
          dailyMap.set(key, { sent: 0, received: 0 });
        }

        transactions
          .filter((t) => t.role === "sent" || t.role === "received")
          .forEach((t) => {
            const transactionDate = new Date(t.tx.date);
            const year = transactionDate.getFullYear();
            const month = String(transactionDate.getMonth() + 1).padStart(
              2,
              "0"
            );
            const day = String(transactionDate.getDate()).padStart(2, "0");
            const key = `${year}-${month}-${day}`;
            if (dailyMap.has(key)) {
              const existing = dailyMap.get(key)!;
              if (t.role === "sent") {
                existing.sent += t.tx.amount;
              } else {
                existing.received += t.tx.amount;
              }
            }
          });

        const dailyData = Array.from(dailyMap.entries()).map(([key, data]) => ({
          date: key,
          sent: data.sent,
          received: data.received,
        }));

        setStats({
          totalSent,
          totalReceived,
          totalTransactions,
          averageTransaction,
          monthlyData,
          categoryData,
          dailyData,
        });

        setError(null);
      } catch (e: any) {
        setError(e?.message || "Could not calculate transaction statistics");
      } finally {
        setLoading(false);
      }
    };

    calculateStats();
  }, [user, userLoading, transactions]);

  const refetch = async () => {
    if (!user) return;
    await refetchTransactions();
  };

  return {
    loading: userLoading || loading,
    error,
    user,
    transactions,
    allUsers,
    stats,
    refetch,
  };
};
