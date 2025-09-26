import {
  Box,
  Text,
  Input,
  Button,
  VStack,
  IconButton,
  Group,
  Heading,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "react-oidc-context";
import { changePassword } from "../../lib/api";
import { toaster } from "../ui/Toaster";

export default function PasswordChangeSection() {
  const auth = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length > 0 && password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (password.length > 0 && !/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (password.length > 0 && !/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (password.length > 0 && !/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    return errors;
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    setPasswordErrors(validatePassword(value));
  };

  const handlePasswordChange = async () => {
    if (
      !auth.user?.access_token ||
      !newPassword ||
      newPassword !== confirmPassword ||
      passwordErrors.length > 0
    )
      return;

    setIsChangingPassword(true);
    try {
      await changePassword(auth.user.access_token, newPassword);

      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors([]);

      toaster.create({
        title: "Success!",
        description: "Password changed successfully!",
        type: "success",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Failed to change password:", error);

      let errorMessage = "Failed to change password. Please try again.";

      // Handle backend validation errors
      if (
        error.response?.data?.details &&
        Array.isArray(error.response.data.details)
      ) {
        errorMessage = error.response.data.details.join(". ");
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      toaster.create({
        title: "Password Change Failed",
        description: errorMessage,
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Box>
      <Heading size="md" mb={4}>
        Change Password
      </Heading>
      <VStack gap={4} align="stretch">
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            New Password
          </Text>
          <Group attached>
            <Input
              id="new-password"
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => handleNewPasswordChange(e.target.value)}
              placeholder="Enter new password"
              borderColor={
                passwordErrors.length > 0 && newPassword.length > 0
                  ? "red.300"
                  : "gray.300"
              }
              autoComplete="new-password"
            />
            <IconButton
              aria-label={
                showNewPassword ? "Hide password" : "Show password"
              }
              onClick={() => setShowNewPassword(!showNewPassword)}
              variant="outline"
              size="md"
            >
              {showNewPassword ? <FiEyeOff /> : <FiEye />}
            </IconButton>
          </Group>

          {/* Real-time validation feedback */}
          {newPassword.length > 0 && (
            <VStack align="stretch" mt={2} gap={1}>
              {passwordErrors.map((error, index) => (
                <Text key={index} fontSize="xs" color="red.500">
                  • {error}
                </Text>
              ))}
              {passwordErrors.length === 0 && (
                <Text fontSize="xs" color="green.500">
                  ✓ Password meets all requirements
                </Text>
              )}
            </VStack>
          )}
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            Confirm New Password
          </Text>
          <Group attached>
            <Input
              id="confirm-password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              borderColor={
                confirmPassword.length > 0 &&
                newPassword !== confirmPassword
                  ? "red.300"
                  : "gray.300"
              }
              autoComplete="new-password"
            />
            <IconButton
              aria-label={
                showConfirmPassword
                  ? "Hide password"
                  : "Show password"
              }
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              variant="outline"
              size="md"
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </IconButton>
          </Group>

          {/* Password match validation */}
          {confirmPassword.length > 0 && (
            <Text
              fontSize="xs"
              color={
                newPassword === confirmPassword
                  ? "green.500"
                  : "red.500"
              }
              mt={2}
            >
              {newPassword === confirmPassword
                ? "✓ Passwords match"
                : "• Passwords do not match"}
            </Text>
          )}
        </Box>

        <Button
          colorPalette="green"
          loading={isChangingPassword}
          onClick={handlePasswordChange}
          disabled={
            !newPassword ||
            !confirmPassword ||
            newPassword !== confirmPassword ||
            passwordErrors.length > 0
          }
        >
          Change Password
        </Button>
      </VStack>
    </Box>
  );
}