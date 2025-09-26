import { getSession } from "../config/db.js";
import { loadQuery } from "../utils/queryLoader.js";
import {
  updateCognitoUserAttributes,
  deleteCognitoUser,
} from "../services/cognitoService.js";
import {
  calculateUserRiskScore,
  updateUserRiskScore,
} from "../utils/riskCalculator.js";

export const ensureMe = async (req, res) => {
  const cognitoSub = req.auth?.sub;
  if (!cognitoSub) return res.status(401).json({ error: "No sub in token" });

  const defaultName =
    req.headers["x-default-name"] ||
    req.auth?.given_name ||
    req.auth?.name ||
    "Unnamed user";

  const session = await getSession();
  try {
    const cypher = loadQuery("ensureUserByCognitoSub");
    const initialBalance = 0;
    const result = await session.run(cypher, {
      cognitoSub,
      name: defaultName,
      balance: initialBalance,
    });
    const user = result.records[0].get("user");

    // If user was just created, give signup bonus
    const grantBonus = loadQuery("grantSignupBonus");
    await session.run(grantBonus, { cognitoSub, amount: 300 });

    return res.status(200).json(user);
  } catch (err) {
    console.error("Error in ensureMe:", err);
    return res.status(500).json({ error: "Failed to ensure user" });
  } finally {
    await session.close();
  }
};

export const patchUser = async (req, res) => {
  const cognitoSub = req.auth?.sub;
  if (!cognitoSub) return res.status(401).json({ error: "No sub in token" });

  const { img, name } = req.body || {};

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
      riskScore: null,
    });

    // If name was updated, also update it in Cognito
    if (name) {
      try {
        const cognitoResult = await updateCognitoUserAttributes(cognitoSub, {
          name: name,
        });

        if (!cognitoResult.success) {
          console.error(
            "Failed to update Cognito user attributes:",
            cognitoResult.error
          );
          // Continue anyway - Neo4j update was successful
        }
      } catch (cognitoError) {
        console.warn("Error updating Cognito user attributes:", cognitoError);
        // Continue anyway - Neo4j update was successful
      }
    }

    const updatedUser = result.records[0].get("user");
    return res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({ error: "Failed to update user" });
  } finally {
    await session.close();
  }
};

export const deleteMe = async (req, res) => {
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

    const userId = userResult.records[0].get("user").id;

    // Delete user from Neo4j first
    const deleteCypher = loadQuery("deleteUser");
    await session.run(deleteCypher, { id: userId });

    // Then delete from Cognito
    const cognitoResult = await deleteCognitoUser(cognitoSub);

    if (!cognitoResult.success) {
      console.error("Failed to delete user from Cognito:", cognitoResult.error);
      // Database deletion was successful, but Cognito deletion failed
      return res.status(207).json({
        message:
          "User deleted from database successfully, but Cognito deletion failed",
        cognitoError: cognitoResult.error,
      });
    }

    return res.status(200).json({
      message: "User deleted successfully from both database and Cognito",
    });
  } catch (err) {
    console.error("Error deleting user:", err);
    return res.status(500).json({ error: "Failed to delete user" });
  } finally {
    await session.close();
  }
};