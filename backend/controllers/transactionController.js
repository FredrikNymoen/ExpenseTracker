import { getSession } from "../config/db.js";
import { loadQuery } from "../utils/queryLoader.js";

export const createTransaction = async (req, res) => {
  const {
    senderId,
    receiverId,
    amount,
    category = "other",
    description = "",
  } = req.body || {};
  if (!senderId || !receiverId) {
    return res.status(400).json({ error: "senderId and receiverId required" });
  }
  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "amount must be a positive number" });
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
