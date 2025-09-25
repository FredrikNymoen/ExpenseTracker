import { useUserData } from "../../contexts/UserDataProvider";

export const useDashboardData = () => {
  const { user, transactions, loading, error } = useUserData();

  return { loading, user, error, transactions };
};
