import { getSession } from "../config/db.js";
import { loadQuery } from "../utils/queryLoader.js";

export const getUsers = async (req, res) => {
  const session = await getSession();
  try {
    const cypher = loadQuery("getUsers");
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
  const cognitoSub = req.auth?.sub;
  if (!cognitoSub) return res.status(401).json({ error: "No sub in token" });

  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: "name required" });

  const session = await getSession();
  try {
    const cypher = loadQuery("addUser");
    const result = await session.run(cypher, {
      cognitoSub,
      name,
      balance: 0,
    });
    const user = result.records[0].get("user");

    return res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: "failed to create user" });
  } finally {
    await session.close();
  }
};

export const getUser = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "id required" });

  const session = await getSession();
  try {
    const cypher = loadQuery("getUser");
    const result = await session.run(cypher, { id });
    if (result.records.length === 0) {
      return res.status(404).json({ error: "user not found" });
    }
    const user = result.records[0].get("user");
    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch user" });
  } finally {
    await session.close();
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "id required" });

  const session = await getSession();
  try {
    const cypher = loadQuery("deleteUser");
    const result = await session.run(cypher, { id });
    if (result.records.length === 0) {
      return res.status(404).json({ error: "user not found" });
    }
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete user" });
  } finally {
    await session.close();
  }
};

export const getUserByCognitoSub = async (req, res) => {
  const cognitoSub = req.params.cognitoSub;
  if (!cognitoSub)
    return res.status(400).json({ error: "cognitoSub required" });

  const session = await getSession();
  try {
    const cypher = loadQuery("getUserByCognitoSub");
    const result = await session.run(cypher, { cognitoSub });

    if (result.records.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.records[0].get("user");
    return res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user by cognitoSub:", err);
    return res
      .status(500)
      .json({ error: "Failed to fetch user by cognitoSub" });
  } finally {
    await session.close();
  }
};