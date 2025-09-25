import {
  Box,
  Container,
  VStack,
  HStack,
  Card,
  CardBody,
  Heading,
  Text,
  Button,
  Input,
  Alert,
  IconButton,
  Group,
  Image,
  Flex,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "react-oidc-context";
import { useDashboardData } from "../hooks/dashboard/useDashboardData";
import {
  patchUser,
  deleteMe,
  changePassword,
  type PatchUserRequest,
} from "../lib/api";
import LoadingScreen from "@/components/LoadingScreen";
import { toaster } from "../components/ui/toaster";

export default function Profile() {
  const auth = useAuth();
  const { user, loading } = useDashboardData();
  const [isUpdating, setIsUpdating] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || "");
  const [img, setImg] = useState(user?.img || "");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Password change states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Update form when user data loads
  if (user && name === "" && !loading) {
    setName(user.name);
    setImg(user.img);
  }

  // Real-time password validation
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

  // Handle image file upload
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toaster.create({
        title: "Invalid File",
        description: "Please select a valid image file",
        type: "error",
        duration: 3000,
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toaster.create({
        title: "File Too Large",
        description: "Please select an image under 5MB",
        type: "error",
        duration: 3000,
      });
      return;
    }

    setIsUploadingImage(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setImg(base64String);
        setImagePreview(base64String);
        setIsUploadingImage(false);
      };
      reader.onerror = () => {
        toaster.create({
          title: "Upload Error",
          description: "Failed to process image file",
          type: "error",
          duration: 3000,
        });
        setIsUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Image upload error:", error);
      toaster.create({
        title: "Upload Error",
        description: "Failed to upload image",
        type: "error",
        duration: 3000,
      });
      setIsUploadingImage(false);
    }
  };

  if (loading) return <LoadingScreen />;

  const handleUpdate = async () => {
    if (!auth.user?.access_token || !user) return;

    setIsUpdating(true);

    try {
      const updateData: PatchUserRequest = {};

      // Only include changed fields
      if (name !== user.name) updateData.name = name;
      if (img !== user.img) updateData.img = img;

      if (Object.keys(updateData).length === 0) {
        toaster.create({
          title: "No Changes",
          description: "No changes to save",
          type: "error",
          duration: 3000,
        });
        return;
      }

      const updatedUser = await patchUser(auth.user.access_token, updateData);

      // Update local state with new values
      setName(updatedUser.name);
      setImg(updatedUser.img);

      // Refresh header to update profile picture
      window.location.reload();

      toaster.create({
        title: "Success!",
        description: "Profile updated successfully!",
        type: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toaster.create({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        type: "error",
        duration: 3000,
      });
    } finally {
      setIsUpdating(false);
    }
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

  const handleDeleteUser = async () => {
    if (!auth.user?.access_token || deleteConfirmText !== "delete") return;

    setIsDeleting(true);
    try {
      await deleteMe(auth.user.access_token);

      // Sign out and redirect
      await auth.removeUser();
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to delete user:", error);
      toaster.create({
        title: "Delete Failed",
        description: "Failed to delete account. Please try again.",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Container maxW="2xl" py={8}>
      <VStack gap={6} align="stretch">
        <Box>
          <Heading size="xl" color="accent" mb={2}>
            Profile Settings
          </Heading>
          <Text color="gray.800">
            Update your profile information and risk settings
          </Text>
        </Box>

        {user && (
          <Card.Root>
            <CardBody p={6}>
              <VStack gap={6} align="stretch">
                {/* Current Profile Info */}
                <Box>
                  <Heading size="md" mb={4}>
                    Current Profile
                  </Heading>
                  <VStack gap={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        Email
                      </Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {auth.user?.profile.email || "Not available"}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        Name
                      </Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {user.name}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        Balance
                      </Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {user.balance.toLocaleString("no-NO")} NOK
                      </Text>
                    </HStack>
                  </VStack>
                </Box>

                {/* Update Form */}
                <Box>
                  <Heading size="md" mb={4}>
                    Update Profile
                  </Heading>
                  <VStack gap={4} align="stretch">
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Full Name
                      </Text>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        First and last names will be automatically capitalized
                      </Text>
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Profile Image
                      </Text>

                      {/* Image Preview */}
                      {(img || imagePreview) && (
                        <Flex justify="center" mb={4}>
                          <Image
                            src={imagePreview || img}
                            alt="Profile preview"
                            boxSize="120px"
                            objectFit="cover"
                            borderRadius="full"
                            border="2px solid"
                            borderColor="gray.200"
                          />
                        </Flex>
                      )}

                      {/* URL Input */}
                      <VStack gap={3} align="stretch">
                        <Box>
                          <Text fontSize="xs" color="gray.600" mb={2}>
                            Option 1: Image URL
                          </Text>
                          <Input
                            value={img.startsWith("data:") ? "" : img}
                            onChange={(e) => {
                              setImg(e.target.value);
                              setImagePreview(null);
                            }}
                            placeholder="https://example.com/image.jpg"
                          />
                        </Box>

                        {/* File Upload */}
                        <Box>
                          <Text fontSize="xs" color="gray.600" mb={2}>
                            Option 2: Upload from device
                          </Text>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isUploadingImage}
                            css={{
                              "&::file-selector-button": {
                                border: "none",
                                borderRadius: "6px",
                                background: "#3182ce",
                                color: "white",
                                padding: "8px 16px",
                                marginRight: "12px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "500",
                              },
                              "&::file-selector-button:hover": {
                                background: "#2c5aa0",
                              },
                            }}
                          />
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            Max 5MB • JPEG, PNG, GIF, WebP supported
                          </Text>
                        </Box>
                      </VStack>
                    </Box>

                    <Button
                      colorPalette="blue"
                      loading={isUpdating}
                      onClick={handleUpdate}
                      disabled={name === user.name && img === user.img}
                    >
                      Update Profile
                    </Button>
                  </VStack>
                </Box>

                {/* Password Change Section */}
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
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) =>
                            handleNewPasswordChange(e.target.value)
                          }
                          placeholder="Enter new password"
                          borderColor={
                            passwordErrors.length > 0 && newPassword.length > 0
                              ? "red.300"
                              : "gray.300"
                          }
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

                {/* Sign Out */}
                <Button
                  variant="outline"
                  colorPalette="gray"
                  onClick={() => {
                    // First clear local authentication state
                    auth.removeUser();

                    // Then redirect to Cognito logout to clear server-side session
                    const clientId = "jsj2h93siq9ksbetblkeh9f0s";
                    const logoutUri = "http://localhost:5173/login";
                    const cognitoDomain =
                      "https://eu-north-1hbz87ldis.auth.eu-north-1.amazoncognito.com";
                    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
                      logoutUri
                    )}`;
                  }}
                >
                  Sign Out
                </Button>

                {/* Danger Zone */}
                <Box mt={8}>
                  <Heading size="md" mb={4} color="red.600">
                    Danger Zone
                  </Heading>

                  {!showDeleteConfirm ? (
                    <VStack gap={4} align="stretch">
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={2}>
                          Permanently delete your account and all associated
                          data. This action cannot be undone.
                        </Text>
                        <Button
                          variant="outline"
                          colorPalette="red"
                          onClick={() => setShowDeleteConfirm(true)}
                        >
                          Delete Account
                        </Button>
                      </Box>
                    </VStack>
                  ) : (
                    <VStack gap={4} align="stretch">
                      <Alert.Root status="error">
                        <Alert.Indicator />
                        <Alert.Title>Are you absolutely sure?</Alert.Title>
                        <Alert.Description>
                          This will permanently delete your account from both
                          our database and Amazon Cognito. All your transaction
                          history will be lost. This action cannot be undone.
                        </Alert.Description>
                      </Alert.Root>

                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                          Type "delete" to confirm:
                        </Text>
                        <Input
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder="delete"
                          borderColor="red.300"
                        />
                      </Box>

                      <HStack gap={2}>
                        <Button
                          colorPalette="red"
                          loading={isDeleting}
                          disabled={deleteConfirmText !== "delete"}
                          onClick={handleDeleteUser}
                        >
                          Delete My Account
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteConfirmText("");
                          }}
                        >
                          Cancel
                        </Button>
                      </HStack>
                    </VStack>
                  )}
                </Box>
              </VStack>
            </CardBody>
          </Card.Root>
        )}
      </VStack>
    </Container>
  );
}
