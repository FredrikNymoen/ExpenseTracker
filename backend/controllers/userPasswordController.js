import { changeCognitoUserPassword } from "../services/cognitoService.js";

export const changePassword = async (req, res) => {
  const cognitoSub = req.auth?.sub;
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
    console.error("Error changing password:", err);
    return res.status(500).json({ error: "Failed to change password" });
  }
};