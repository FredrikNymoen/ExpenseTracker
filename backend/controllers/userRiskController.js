import { getSession } from "../config/db.js";
import { loadQuery } from "../utils/queryLoader.js";
import {
  calculateUserRiskScore,
  updateUserRiskScore,
} from "../utils/riskCalculator.js";

export const recalculateRiskScore = async (req, res) => {
  const cognitoSub = req.auth?.sub;
  if (!cognitoSub) return res.status(401).json({ error: "No sub in token" });

  const session = await getSession();
  try {
    // Get user ID from cognitoSub
    const getUserCypher = loadQuery("getUserByCognitoSub");
    const userResult = await session.run(getUserCypher, { cognitoSub });

    if (userResult.records.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userResult.records[0].get("user");
    const userId = user.id;

    // Calculate new risk score based on transaction history
    const newRiskScore = await calculateUserRiskScore(userId);

    // Update the risk score in the database
    await updateUserRiskScore(userId, newRiskScore);

    // Fetch the updated user
    const getUserAgainCypher = loadQuery("getUserByCognitoSub");
    const updatedUserResult = await session.run(getUserAgainCypher, { cognitoSub });
    const updatedUser = updatedUserResult.records[0].get("user");

    return res.status(200).json({
      message: "Risk score recalculated successfully",
      user: updatedUser,
      newRiskScore: newRiskScore,
    });
  } catch (err) {
    console.error("Error recalculating risk score:", err);
    return res.status(500).json({ error: "Failed to recalculate risk score" });
  } finally {
    await session.close();
  }
};