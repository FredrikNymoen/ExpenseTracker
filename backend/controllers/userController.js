import { getSession } from "../config/db.js";

export const getUsers = async (req, res) => {
  const session = await getSession();
  try {
    const cypher = `
      MATCH (u:User)
      RETURN u { .id, .name, createdAt: toString(u.createdAt) } AS user
      ORDER BY u.createdAt DESC
      LIMIT 50
    `;
    const result = await session.run(cypher);
    res.status(200).json(result.records.map((r) => r.get("user")));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  } finally {
    await session.close();
  }
};

export const addUser = async (req, res) => {
  const { name, balance } = req.body || {};
  if (!name) return res.status(400).json({ error: "name required" });
  if (typeof balance !== "number" || balance < 0) {
    return res
      .status(400)
      .json({ error: "initial balance must be a positive number" });
  }
  const initialBalance = Math.round(balance * 100) / 100; // 2 decimals

  const session = await getSession();
  try {
    const cypher = `
      WITH randomUUID() AS id
      CREATE (u:User {
        id: id,
        name: $name,
        riskScore: "low",
        balance: $balance,
        createdAt: datetime()
      })
      RETURN u { .id, .name, .riskScore, .balance, createdAt: toString(u.createdAt) } AS user
    `;
    const result = await session.run(cypher, {
      name,
      balance: initialBalance,
    });
    res.status(201).json(result.records[0].get("user"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to create user" });
  } finally {
    await session.close();
  }
};

export const getUser = async (req, res) => {
  const session = await getSession();
  try {
    const cypher = `
      MATCH (u:User { id: $id })
      RETURN u { .id, .name, createdAt: toString(u.createdAt) } AS user
    `;
    const result = await session.run(cypher, { id: req.params.id });
    if (result.records.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.status(200).json(result.records[0].get("user"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user" });
  } finally {
    await session.close();
  }
};
