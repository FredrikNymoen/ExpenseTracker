import { getSession } from "../config/db.js";

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
    const cypher = `
      MATCH (sender:User { id: $senderId })
      MATCH (receiver:User { id: $receiverId })
      WITH sender, receiver, randomUUID() AS txId
      CREATE (t:Transaction {
        id: txId,
        amount: $amount,
        category: $category,
        description: $description,
        date: datetime()
      })
      MERGE (sender)-[:SENT]->(t)
      MERGE (t)-[:RECEIVED_BY]->(receiver)
      SET sender.balance = coalesce(sender.balance, 0) - $amount,
          receiver.balance = coalesce(receiver.balance, 0) + $amount
      RETURN sender { .id, .name, .balance } AS sender,
             receiver { .id, .name, .balance } AS receiver,
             t { .id, .amount, .category, .description, date: toString(t.date) } AS transaction
    `;
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
    const cypher = `
      MATCH (u:User { id: $id })

      // Sent transactions
      CALL {
        WITH u
        MATCH (u)-[:SENT]->(t:Transaction)-[:RECEIVED_BY]->(r:User)
        RETURN collect({
          role: 'sent',
          tx: { id: t.id, amount: t.amount, description: t.description, date: toString(t.date) },
          to: { id: r.id, name: r.name }
        }) AS sent
      }

      // Received transactions
      CALL {
        WITH u
        MATCH (s:User)-[:SENT]->(t2:Transaction)-[:RECEIVED_BY]->(u)
        RETURN collect({
          role: 'received',
          tx: { id: t2.id, amount: t2.amount, description: t2.description, date: toString(t2.date) },
          from: { id: s.id, name: s.name }
        }) AS received
      }

      WITH sent + received AS allTx
      UNWIND allTx AS item
      WITH item
      ORDER BY datetime(item.tx.date) DESC
      RETURN collect(item) AS transactions
    `;
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
