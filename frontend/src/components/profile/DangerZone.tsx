import {
  Box,
  Text,
  Button,
  Input,
  VStack,
  HStack,
  Heading,
  Alert,
} from "@chakra-ui/react";
import { useState } from "react";
import { useAuth } from "react-oidc-context";
import { deleteMe } from "../../lib/api";
import { toaster } from "../ui/Toaster";

export default function DangerZone() {
  const auth = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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
              id="delete-confirmation"
              name="deleteConfirmation"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="delete"
              borderColor="red.300"
              autoComplete="off"
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
  );
}