import { getSession } from "../config/db.js";
import { loadQuery } from "../utils/queryLoader.js";

export const getUsers = async (req, res) => {
  const session = await getSession();
  try {
    const cypher = loadQuery("getUsers"); // loads cypher/getUsers.cypher
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
  // DEBUG: Log everything that comes in
  console.log("=== ADD USER DEBUG ===");
  console.log("req.auth:", req.auth);
  console.log("req.auth.sub:", req.auth?.sub);
  console.log("req.body:", req.body);
  console.log("====================");

  // sub comes from verified JWT
  const cognitoSub = req.auth?.sub;
  if (!cognitoSub) return res.status(401).json({ error: "No sub in token" });

  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: "name required" });
  // if (typeof balance !== "number" || balance < 0) {
  //   return res
  //     .status(400)
  //     .json({ error: "initial balance must be a positive number" });
  // }

  console.log("✅ Validation passed, creating user with:", {
    cognitoSub,
    name,
    //balance,
  });

  //const initialBalance = Math.round(balance * 100) / 100;

  const session = await getSession();
  try {
    const cypher = loadQuery("addUser");
    const result = await session.run(cypher, {
      cognitoSub,
      name,
      //balance: initialBalance,
      balance: 0,
    });
    console.log("✅ User created successfully");
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
    const cypher = loadQuery("getUser"); // loads cypher/getUser.cypher

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

export const deleteUser = async (req, res) => {
  const session = await getSession();
  try {
    const cypher = loadQuery("deleteUser"); // loads cypher/deleteUser.cypher
    const result = await session.run(cypher, { id: req.params.id });

    if (result.records.length === 0)
      return res.status(404).json({ error: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete user" });
  } finally {
    await session.close();
  }
};

/* Ensures that the user exists, creating them if not */
export const ensureMe = async (req, res) => {
  const cognitoSub = req.auth?.sub; // fra auth-middleware
  if (!cognitoSub) return res.status(401).json({ error: "No sub in token" });

  const defaultName = req.header("x-default-name") || "Unnamed user";
  const initialBalance = 0;

  const session = await getSession();
  try {
    const cypher = loadQuery("ensureUserByCognitoSub"); 
    const result = await session.run(cypher, {
      cognitoSub,
      name: defaultName,
      balance: initialBalance,
    });

    const user = result.records[0].get("user");
    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Failed to fetch authenticated user" });
  } finally {
    await session.close();
  }
};
