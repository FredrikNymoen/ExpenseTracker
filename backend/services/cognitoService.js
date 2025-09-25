import {
  CognitoIdentityProviderClient,
  AdminUpdateUserAttributesCommand,
  AdminDeleteUserCommand,
  AdminSetUserPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION || "eu-north-1",
});

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || "eu-north-1_HBZ87LdIS";

/**
 * Update user attributes in Cognito
 * @param {string} cognitoSub - The Cognito user's sub (ID)
 * @param {Object} attributes - Object with attributes to update
 * @param {string} attributes.name - The user's full name
 * @param {string} attributes.email - The user's email (if needed)
 */
export const updateCognitoUserAttributes = async (cognitoSub, attributes) => {
  try {
    const userAttributes = [];

    if (attributes.name) {
      userAttributes.push({
        Name: "name",
        Value: attributes.name,
      });
    }

    if (attributes.email) {
      userAttributes.push({
        Name: "email",
        Value: attributes.email,
      });
    }

    if (userAttributes.length === 0) {
      return { success: true, message: "No attributes to update" };
    }

    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: USER_POOL_ID,
      Username: cognitoSub,
      UserAttributes: userAttributes,
    });

    await cognitoClient.send(command);

    return {
      success: true,
      message: "User attributes updated successfully in Cognito",
    };
  } catch (error) {
    console.error("Error updating Cognito user attributes:", error);
    return {
      success: false,
      error: error.message || "Failed to update user attributes in Cognito",
    };
  }
};

/**
 * Delete user from Cognito
 * @param {string} cognitoSub - The Cognito user's sub (ID)
 */
export const deleteCognitoUser = async (cognitoSub) => {
  try {
    const command = new AdminDeleteUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: cognitoSub,
    });

    await cognitoClient.send(command);

    return {
      success: true,
      message: "User deleted successfully from Cognito",
    };
  } catch (error) {
    console.error("Error deleting Cognito user:", error);
    return {
      success: false,
      error: error.message || "Failed to delete user from Cognito",
    };
  }
};

/**
 * Change user password in Cognito
 * @param {string} cognitoSub - The Cognito user's sub (ID)
 * @param {string} newPassword - The new password
 */
export const changeCognitoUserPassword = async (cognitoSub, newPassword) => {
  try {
    console.log(
      `Attempting to change password for Cognito user: ${cognitoSub}`
    );

    const command = new AdminSetUserPasswordCommand({
      UserPoolId: USER_POOL_ID,
      Username: cognitoSub,
      Password: newPassword,
      Permanent: true, // Set to permanent so user doesn't need to change it on next login
    });

    await cognitoClient.send(command);

    return {
      success: true,
      message: "Password changed successfully in Cognito",
    };
  } catch (error) {
    console.error("Error changing Cognito user password:", error);
    return {
      success: false,
      error: error.message || "Failed to change password in Cognito",
    };
  }
};
