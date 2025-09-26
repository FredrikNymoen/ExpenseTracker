import { useState } from "react";
import { useAuth } from "react-oidc-context";
import type { User, CreateTransactionRequest } from "../../lib/api";
import { createTransaction } from "../../lib/api";
import { formatCurrency } from "../../utils/formatters";
import { toaster } from "../../components/ui/Toaster";

export function useSendMoney(currentUser: User, onTransactionSuccess: () => void) {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Other");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setSearchTerm(user.name);
  };

  const handleUserDeselect = () => {
    setSelectedUser(null);
    setSearchTerm("");
  };

  return {
    loading,
    searchTerm,
    selectedUser,
    amount,
    category,
    description,
    error,
    setSearchTerm,
    setAmount,
    setCategory,
    setDescription,
    handleSubmit,
    handleUserSelect,
    handleUserDeselect,
  };
}