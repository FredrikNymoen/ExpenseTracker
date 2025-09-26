import { getSession } from "../config/db.js";
import { loadQuery } from "../utils/queryLoader.js";

export const claimBonus = async (req, res) => {
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

    const claimBonusCypher = loadQuery("claimBonus");
    const result = await session.run(claimBonusCypher, {
      cognitoSub,
      amount: 100,
    });

    if (result.records.length === 0) {
      return res.status(200).json({
        success: false,
        error: "Cannot claim bonus yet. Wait 24 hours since last claim.",
      });
    }

    const updatedUser = result.records[0].get("user");
    const transaction = result.records[0].get("transaction");

    return res.status(200).json({
      success: true,
      message: "Bonus claimed successfully!",
      user: updatedUser,
      transaction: transaction,
      amount: 100,
    });
  } catch (err) {
    console.error("Error claiming bonus:", err);
    return res.status(500).json({ error: "Failed to claim bonus" });
  } finally {
    await session.close();
  }
};

export const checkBonusAvailability = async (req, res) => {
  const cognitoSub = req.auth?.sub;
  if (!cognitoSub) return res.status(401).json({ error: "No sub in token" });

  const session = await getSession();
  try {
    // Check if user can claim bonus without actually doing it
    const cypher = loadQuery("checkBonusAvailability");
    const result = await session.run(cypher, { cognitoSub });

    if (result.records.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const canClaim = result.records[0].get("canClaim");

    return res.status(200).json({
      available: canClaim,
      message: canClaim
        ? "Bonus available to claim"
        : "Must wait 24 hours since last claim",
    });
  } catch (err) {
    console.error("Error checking bonus availability:", err);
    return res
      .status(500)
      .json({ error: "Failed to check bonus availability" });
  } finally {
    await session.close();
  }
};
