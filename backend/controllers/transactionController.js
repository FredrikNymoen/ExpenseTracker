import { getSession } from "../config/db.js";
import { loadQuery } from "../utils/queryLoader.js";
import {
  calculateUserRiskScore,
  updateUserRiskScore,
} from "../utils/riskCalculator.js";

export const createTransaction = async (req, res) => {
  const cognitoSub = req.auth?.sub; // Get sender from authenticated user
  if (!cognitoSub) return res.status(401).json({ error: "No sub in token" });

  const {
    receiverId,
    amount,
    category = "Other",
    description = "",
  } = req.body || {};

  if (!receiverId) {
    return res.status(400).json({ error: "receiverId required" });
  }
  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "amount must be a positive number" });
  }

  // Get sender ID from cognitoSub
  let senderId;
  const userSession = await getSession();
  try {
    const getUserCypher = loadQuery("getUserByCognitoSub");
    const userResult = await userSession.run(getUserCypher, { cognitoSub });

    if (userResult.records.length === 0) {
      return res.status(404).json({ error: "Sender not found" });
    }

    senderId = userResult.records[0].get("user").id;
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to get sender information" });
  } finally {
    await userSession.close();
  }

  const session = await getSession();
  try {
    const cypher = loadQuery("createTransaction"); // loads cypher/createTransaction.cypher
    const result = await session.run(cypher, {
      senderId,
      receiverId,
      amount,
      category,
      description,
    });
    if (result.records.length === 0)
      return res.status(404).json({ error: "User(s) not found" });

    const record = result.records[0];

    // Automatically recalculate risk score for sender after transaction
    try {
      const newRiskScore = await calculateUserRiskScore(senderId);
      await updateUserRiskScore(senderId, newRiskScore);

    } catch (riskError) {
      console.warn("Failed to update risk score after transaction:", riskError);
      // Don't fail the transaction if risk calculation fails
    }

    res.status(201).json({
      sender: record.get("sender"),
      receiver: record.get("receiver"),
      transaction: record.get("transaction"),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create transaction" });
  } finally {
    await session.close();
  }
};

export const getUserTransactions = async (req, res) => {
  const session = await getSession();
  try {
    const cypher = loadQuery("getUserTransactions"); // loads cypher/getUserTransactions.cypher
    const result = await session.run(cypher, { id: req.params.id });
    const txs = result.records[0].get("transactions").filter(Boolean);
    res.status(200).json(txs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  } finally {
    await session.close();
  }
};
