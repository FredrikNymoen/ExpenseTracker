import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useAuth } from "react-oidc-context";
import type { User, Transaction } from "../lib/api";
import { ensureMe, getUserTransactions, getAllUsers } from "../lib/api";

interface UserDataContextType {
  user: User | null;
  transactions: Transaction[];
  allUsers: User[];
  loading: boolean;
  error: string | null;
  refetchTransactions: () => Promise<void>;
  refetchUser: () => Promise<void>;
  updateUserLocally: (updates: Partial<User>) => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined
);

export const UserDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initial data fetch
  useEffect(() => {
    if (auth.isLoading || hasInitialized) return;
    if (!auth.isAuthenticated) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const token = auth.user?.access_token;
    if (!token) return;

    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Fetch user data
        const defaultName = auth.user?.profile.name || "Unnamed user";
        const me = await ensureMe(token, defaultName);
        setUser(me);

        // Fetch transactions and all users in parallel
        const [transactionsData, usersData] = await Promise.all([
          getUserTransactions(me.id),
          getAllUsers(),
        ]);

        setTransactions(transactionsData);
        setAllUsers(usersData);
        setError(null);
        setHasInitialized(true);
      } catch (e: any) {
        setError(e?.message || "Could not fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [
    auth.isLoading,
    auth.isAuthenticated,
    auth.user?.access_token,
    hasInitialized,
  ]);

  // Refetch only transactions
  const refetchTransactions = async () => {
    if (!user || !auth.user?.access_token) return;

    try {
      const [transactionsData, userData] = await Promise.all([
        getUserTransactions(user.id),
        ensureMe(
          auth.user.access_token,
          auth.user?.profile.name || "Unnamed user"
        ),
      ]);

      setTransactions(transactionsData);
      setUser(userData); // Update user to get new balance
    } catch (e: any) {
      console.error("Failed to refetch transactions:", e);
    }
  };

  // Refetch user data
  const refetchUser = async () => {
    if (!auth.user?.access_token) return;

    try {
      const defaultName = auth.user?.profile.name || "Unnamed user";
      const me = await ensureMe(auth.user.access_token, defaultName);
      setUser(me);
    } catch (e: any) {
      console.error("Failed to refetch user:", e);
    }
  };

  // Update user locally (for optimistic updates)
  const updateUserLocally = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <UserDataContext.Provider
      value={{
        user,
        transactions,
        allUsers,
        loading,
        error,
        refetchTransactions,
        refetchUser,
        updateUserLocally,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
};
