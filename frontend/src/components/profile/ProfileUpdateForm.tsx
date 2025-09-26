import {
  Box,
  Text,
  Input,
  Button,
  VStack,
  Heading,
} from "@chakra-ui/react";
import { useState } from "react";
import { useAuth } from "react-oidc-context";
import type { User, PatchUserRequest } from "../../lib/api";
import { patchUser } from "../../lib/api";
import { toaster } from "../ui/Toaster";
import ProfileImageSection from "./ProfileImageSection";

interface ProfileUpdateFormProps {
  user: User;
}

export default function ProfileUpdateForm({ user }: ProfileUpdateFormProps) {
  const auth = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [img, setImg] = useState(
    user?.img && user.img.trim() !== "" ? user.img : ""
  );

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

      await patchUser(auth.user.access_token, updateData);

      // Refresh page to update profile picture in header
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

  return (
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
            id="profile-name"
            name="profileName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            autoComplete="name"
          />
          <Text fontSize="xs" color="gray.500" mt={1}>
            First and last names will be automatically capitalized
          </Text>
        </Box>

        <ProfileImageSection
          img={img}
          onImageChange={setImg}
        />

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
  );
}