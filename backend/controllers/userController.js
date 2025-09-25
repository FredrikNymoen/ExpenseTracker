import { getSession } from "../config/db.js";
import { loadQuery } from "../utils/queryLoader.js";
import {
  updateCognitoUserAttributes,
  deleteCognitoUser,
  changeCognitoUserPassword,
} from "../services/cognitoService.js";
import {
  calculateUserRiskScore,
  updateUserRiskScore,
} from "../utils/riskCalculator.js";

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
  // sub comes from verified JWT
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
    // 1) Ensure user exists
    const cypher = loadQuery("ensureUserByCognitoSub");
    const result = await session.run(cypher, {
      cognitoSub,
      name: defaultName,
      balance: initialBalance,
    });
    const user = result.records[0].get("user");

    // 2) If user was just created, give signup bonus
    const grantBonus = loadQuery("grantSignupBonus");
    await session.run(grantBonus, { cognitoSub, amount: 300 });

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

export const getUserByCognitoSub = async (req, res) => {
  const cognitoSub = req.params.cognitoSub;
  if (!cognitoSub)
    return res.status(400).json({ error: "cognitoSub required" });

  const session = await getSession();
  try {
    const cypher = loadQuery("getUserByCognitoSub"); // loads cypher/getUserByCognitoSub.cypher
    const result = await session.run(cypher, { cognitoSub });

    if (result.records.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = result.records[0].get("user");
    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Failed to fetch user by cognitoSub" });
  } finally {
    await session.close();
  }
};

export const patchUser = async (req, res) => {
  const cognitoSub = req.auth?.sub; // Fra auth-middleware
  if (!cognitoSub) return res.status(401).json({ error: "No sub in token" });

  const { img, name } = req.body || {};

  // Risk score is now automatically calculated based on activity, not manually set

  // Format name with proper capitalization if provided
  let formattedName = name;
  if (name && typeof name === "string") {
    formattedName = name
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  // Get user ID from cognitoSub first
  const session = await getSession();
  try {
    const getUserCypher = loadQuery("getUserByCognitoSub");
    const userResult = await session.run(getUserCypher, { cognitoSub });

    if (userResult.records.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResult.records[0].get("user").id;

    // Update user with provided fields
    const patchCypher = loadQuery("patchUser");
    const result = await session.run(patchCypher, {
      userId,
      img: img || null,
      name: formattedName || null,
      riskScore: null, // Risk score is no longer manually updateable
    });

    const user = result.records[0].get("user");

    // If name was updated, also update it in Cognito
    if (formattedName) {
      try {
        const cognitoResult = await updateCognitoUserAttributes(cognitoSub, {
          name: formattedName,
        });

        if (!cognitoResult.success) {
          console.warn(
            "Failed to update Cognito user attributes:",
            cognitoResult.error
          );
          // Continue anyway - database update was successful
        }
      } catch (cognitoError) {
        console.warn("Error updating Cognito user attributes:", cognitoError);
        // Continue anyway - database update was successful
      }
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update user" });
  } finally {
    await session.close();
  }
};

export const deleteMe = async (req, res) => {
  const cognitoSub = req.auth?.sub; // Fra auth-middleware
  if (!cognitoSub) return res.status(401).json({ error: "No sub in token" });

  const session = await getSession();
  try {
    // First, get the user to ensure they exist
    const getUserCypher = loadQuery("getUserByCognitoSub");
    const userResult = await session.run(getUserCypher, { cognitoSub });

    if (userResult.records.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResult.records[0].get("user").id;

    // Delete user from database first
    const deleteCypher = loadQuery("deleteUser");
    await session.run(deleteCypher, { id: userId });

    // Then delete from Cognito
    const cognitoResult = await deleteCognitoUser(cognitoSub);

    if (!cognitoResult.success) {
      console.error("Failed to delete user from Cognito:", cognitoResult.error);
      // Note: Database deletion was successful, but Cognito deletion failed
      return res.status(200).json({
        message:
          "User deleted from database successfully, but Cognito deletion failed",
        cognitoError: cognitoResult.error,
      });
    }

    return res.status(200).json({
      message: "User deleted successfully from both database and Cognito",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete user" });
  } finally {
    await session.close();
  }
};

export const changePassword = async (req, res) => {
  const cognitoSub = req.auth?.sub; // Fra auth-middleware
  if (!cognitoSub) return res.status(401).json({ error: "No sub in token" });

  const { newPassword } = req.body || {};
  if (!newPassword) {
    return res.status(400).json({ error: "newPassword is required" });
  }

  // Enhanced password validation
  const passwordErrors = [];

  if (newPassword.length < 8) {
    passwordErrors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(newPassword)) {
    passwordErrors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(newPassword)) {
    passwordErrors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(newPassword)) {
    passwordErrors.push("Password must contain at least one number");
  }

  if (passwordErrors.length > 0) {
    return res.status(400).json({
      error: "Password validation failed",
      details: passwordErrors,
    });
  }

  try {
    const cognitoResult = await changeCognitoUserPassword(
      cognitoSub,
      newPassword
    );

    if (!cognitoResult.success) {
      return res.status(400).json({ error: cognitoResult.error });
    }

    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to change password" });
  }
};

export const recalculateRiskScore = async (req, res) => {
  const cognitoSub = req.auth?.sub; // Fra auth-middleware
  if (!cognitoSub) return res.status(401).json({ error: "No sub in token" });

  const session = await getSession();
  try {
    // Get user ID from cognitoSub
    const getUserCypher = loadQuery("getUserByCognitoSub");
    const userResult = await session.run(getUserCypher, { cognitoSub });

    if (userResult.records.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResult.records[0].get("user").id;

    // Calculate new risk score
    const newRiskScore = await calculateUserRiskScore(userId);

    // Update user's risk score
    const updatedUser = await updateUserRiskScore(userId, newRiskScore);

    return res.status(200).json({
      message: "Risk score recalculated successfully",
      user: updatedUser,
      newRiskScore,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to recalculate risk score" });
  } finally {
    await session.close();
  }
};
