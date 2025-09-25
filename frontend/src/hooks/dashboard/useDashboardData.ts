import { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import type { User, Transaction } from "../../lib/api";
import { ensureMe, getUserTransactions } from "../../lib/api";

export const useDashboardData = () => {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (auth.isLoading) return;
    if (!auth.isAuthenticated) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const token = auth.user?.access_token;
    const ctrl = new AbortController();

    (async () => {
      try {
        setLoading(true);

        const defaultName = auth.user?.profile.name || "Unnamed user";
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

  return { loading, user, error, transactions };
};
