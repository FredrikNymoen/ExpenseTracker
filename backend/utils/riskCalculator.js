import { getSession } from "../config/db.js";
import { loadQuery } from "../utils/queryLoader.js";

/**
 * Calculate user risk score automatically based on transaction activity
 * @param {string} userId - The user's ID
 * @returns {Promise<string>} - Risk level: "low", "medium", or "high"
 */
export const calculateUserRiskScore = async (userId) => {
  const session = await getSession();
  try {
    // Get user transactions from last 30 days
    const getUserTransactionsCypher = loadQuery("getUserTransactions");
    const result = await session.run(getUserTransactionsCypher, { id: userId });

    if (result.records.length === 0) {
      return "low"; // No transactions, low risk
    }

    const allTransactions = result.records[0].get("transactions");

    // Filter transactions from last 30 days and only sent transactions
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSentTransactions = allTransactions.filter((tx) => {
      if (!tx || tx.role !== "sent") return false;
      const txDate = new Date(tx.tx.date);
      return txDate >= thirtyDaysAgo;
    });

    // Calculate risk factors
    const totalAmount = recentSentTransactions.reduce(
      (sum, tx) => sum + tx.tx.amount,
      0
    );
    const transactionCount = recentSentTransactions.length;
    const largeTransactions = recentSentTransactions.filter(
      (tx) => tx.tx.amount > 10000
    ).length;
    const averageAmount =
      transactionCount > 0 ? totalAmount / transactionCount : 0;

    // Simple risk calculation logic
    let riskScore = 0;

    // Factor 1: High volume (>50,000 NOK in 30 days)
    if (totalAmount > 50000) {
      riskScore += 2;
    } else if (totalAmount > 20000) {
      riskScore += 1;
    }

    // Factor 2: High frequency (>15 transactions in 30 days)
    if (transactionCount > 15) {
      riskScore += 2;
    } else if (transactionCount > 8) {
      riskScore += 1;
    }

    // Factor 3: Large individual transactions (>10,000 NOK)
    if (largeTransactions > 2) {
      riskScore += 2;
    } else if (largeTransactions > 0) {
      riskScore += 1;
    }

    // Factor 4: High average transaction amount (>5,000 NOK)
    if (averageAmount > 5000) {
      riskScore += 1;
    }

    // Determine final risk level
    let riskLevel;
    if (riskScore >= 4) {
      riskLevel = "high";
    } else if (riskScore >= 2) {
      riskLevel = "medium";
    } else {
      riskLevel = "low";
    }

    return riskLevel;
  } catch (error) {
    console.error("Error calculating risk score:", error);
    return "low"; // Default to low risk if calculation fails
  } finally {
    await session.close();
  }
};

/**
 * Update user's risk score in the database
 * @param {string} userId - The user's ID
 * @param {string} riskScore - The new risk score
 */
export const updateUserRiskScore = async (userId, riskScore) => {
  const session = await getSession();
  try {
    const updateRiskScoreCypher = loadQuery("updateUserRiskScore");
    const result = await session.run(updateRiskScoreCypher, {
      userId,
      riskScore,
    });

    return result.records[0]?.get("user");
  } catch (error) {
    console.error("Error updating risk score:", error);
    throw error;
  } finally {
    await session.close();
  }
};
