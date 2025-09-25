import { useState, useEffect } from "react";
import type { Transaction, User } from "../../lib/api";
import { getUserTransactions, getAllUsers } from "../../lib/api";
import { useDashboardData } from "../dashboard/useDashboardData";

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
  const { user, loading: userLoading } = useDashboardData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);

  useEffect(() => {
    if (!user || userLoading) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [transactionsData, usersData] = await Promise.all([
          getUserTransactions(user.id),
          getAllUsers(),
        ]);

        setTransactions(transactionsData);
        setAllUsers(usersData);

        // Calculate statistics
        const totalSent = transactionsData
          .filter((t: Transaction) => t.role === "sent")
          .reduce((sum: number, t: Transaction) => sum + t.tx.amount, 0);

        const totalReceived = transactionsData
          .filter((t: Transaction) => t.role === "received")
          .reduce((sum: number, t: Transaction) => sum + t.tx.amount, 0);

        const totalTransactions = transactionsData.length;
        const averageTransaction =
          totalTransactions > 0
            ? (totalSent + totalReceived) / totalTransactions
            : 0;

        // Monthly data - last 12 months, ensure we always have 12 months
        const monthlyMap = new Map<
          string,
          { sent: number; received: number }
        >();

        // Initialize all 12 months with zero values
        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const monthStr = `${year}-${month}`;
          monthlyMap.set(monthStr, { sent: 0, received: 0 });
        }

        // Add transaction data to the initialized months
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        transactionsData
          .filter((t: Transaction) => new Date(t.tx.date) >= twelveMonthsAgo)
          .forEach((t: Transaction) => {
            const month = new Date(t.tx.date).toISOString().substring(0, 7); // YYYY-MM
            if (monthlyMap.has(month)) {
              const data = monthlyMap.get(month)!;
              if (t.role === "sent") {
                data.sent += t.tx.amount;
              } else {
                data.received += t.tx.amount;
              }
            }
          });

        const monthlyData = Array.from(monthlyMap.entries())
          .map(([month, data]) => ({
            month,
            ...data,
          }))
          .sort((a, b) => a.month.localeCompare(b.month));

        // Category data - only sent transactions (spending)
        const categoryMap = new Map<
          string,
          { amount: number; count: number }
        >();
        transactionsData
          .filter((t: Transaction) => t.role === "sent")
          .forEach((t: Transaction) => {
            const category = t.tx.category || "Other";
            if (!categoryMap.has(category)) {
              categoryMap.set(category, { amount: 0, count: 0 });
            }
            const data = categoryMap.get(category)!;
            data.amount += t.tx.amount;
            data.count += 1;
          });

        const categoryData = Array.from(categoryMap.entries()).map(
          ([category, data]) => ({
            category,
            ...data,
          })
        );

        // Daily data (last 30 days) - ensure we always have 30 days
        const dailyMap = new Map<string, { sent: number; received: number }>();

        // Initialize all 30 days with zero values
        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const dateStr = `${year}-${month}-${day}`;
          dailyMap.set(dateStr, { sent: 0, received: 0 });
        }

        // Add transaction data to the initialized days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        transactionsData
          .filter((t: Transaction) => new Date(t.tx.date) >= thirtyDaysAgo)
          .forEach((t: Transaction) => {
            // Use local date instead of UTC to avoid timezone issues
            const transactionDate = new Date(t.tx.date);
            const year = transactionDate.getFullYear();
            const month = String(transactionDate.getMonth() + 1).padStart(
              2,
              "0"
            );
            const day = String(transactionDate.getDate()).padStart(2, "0");
            const date = `${year}-${month}-${day}`; // YYYY-MM-DD in local time

            if (dailyMap.has(date)) {
              const data = dailyMap.get(date)!;
              if (t.role === "sent") {
                data.sent += t.tx.amount;
              } else {
                data.received += t.tx.amount;
              }
            }
          });

        const dailyData = Array.from(dailyMap.entries())
          .map(([date, data]) => ({
            date,
            ...data,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

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
        setError(e?.message || "Failed to fetch transactions data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, userLoading]);

  const refetch = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [transactionsData, usersData] = await Promise.all([
        getUserTransactions(user.id),
        getAllUsers(),
      ]);
      setTransactions(transactionsData);
      setAllUsers(usersData);

      // Recalculate statistics
      const totalSent = transactionsData
        .filter((t: Transaction) => t.role === "sent")
        .reduce((sum: number, t: Transaction) => sum + t.tx.amount, 0);

      const totalReceived = transactionsData
        .filter((t: Transaction) => t.role === "received")
        .reduce((sum: number, t: Transaction) => sum + t.tx.amount, 0);

      const totalTransactions = transactionsData.length;
      const averageTransaction =
        totalTransactions > 0
          ? (totalSent + totalReceived) / totalTransactions
          : 0;

      // Monthly data - last 12 months, ensure we always have 12 months
      const monthlyMap = new Map<string, { sent: number; received: number }>();

      // Initialize all 12 months with zero values
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const monthStr = `${year}-${month}`;
        monthlyMap.set(monthStr, { sent: 0, received: 0 });
      }

      // Add transaction data to the initialized months
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      transactionsData
        .filter((t: Transaction) => new Date(t.tx.date) >= twelveMonthsAgo)
        .forEach((t: Transaction) => {
          const month = new Date(t.tx.date).toISOString().substring(0, 7); // YYYY-MM
          if (monthlyMap.has(month)) {
            const data = monthlyMap.get(month)!;
            if (t.role === "sent") {
              data.sent += t.tx.amount;
            } else {
              data.received += t.tx.amount;
            }
          }
        });

      const monthlyData = Array.from(monthlyMap.entries())
        .map(([month, data]) => ({
          month,
          ...data,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      // Category data - only sent transactions (spending)
      const categoryMap = new Map<string, { amount: number; count: number }>();
      transactionsData
        .filter((t: Transaction) => t.role === "sent")
        .forEach((t: Transaction) => {
          const category = t.tx.category || "Other";
          if (!categoryMap.has(category)) {
            categoryMap.set(category, { amount: 0, count: 0 });
          }
          const data = categoryMap.get(category)!;
          data.amount += t.tx.amount;
          data.count += 1;
        });

      const categoryData = Array.from(categoryMap.entries()).map(
        ([category, data]) => ({
          category,
          ...data,
        })
      );

      // Daily data (last 30 days) - ensure we always have 30 days
      const dailyMap = new Map<string, { sent: number; received: number }>();

      // Initialize all 30 days with zero values
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;
        dailyMap.set(dateStr, { sent: 0, received: 0 });
      }

      // Add transaction data to the initialized days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      transactionsData
        .filter((t: Transaction) => new Date(t.tx.date) >= thirtyDaysAgo)
        .forEach((t: Transaction) => {
          // Use local date instead of UTC to avoid timezone issues
          const transactionDate = new Date(t.tx.date);
          const year = transactionDate.getFullYear();
          const month = String(transactionDate.getMonth() + 1).padStart(2, "0");
          const day = String(transactionDate.getDate()).padStart(2, "0");
          const date = `${year}-${month}-${day}`;

          if (dailyMap.has(date)) {
            const data = dailyMap.get(date)!;
            if (t.role === "sent") {
              data.sent += t.tx.amount;
            } else {
              data.received += t.tx.amount;
            }
          }
        });

      const dailyData = Array.from(dailyMap.entries())
        .map(([date, data]) => ({
          date,
          ...data,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

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
      setError(e?.message || "Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading: userLoading || loading,
    error,
    transactions,
    allUsers,
    stats,
    user,
    refetch,
  };
};
