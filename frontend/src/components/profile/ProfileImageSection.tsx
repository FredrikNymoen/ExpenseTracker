import { Box, Text, Input, VStack, Flex, Image } from "@chakra-ui/react";
import { useState } from "react";
import { toaster } from "../ui/Toaster";

interface ProfileImageSectionProps {
  img: string;
  onImageChange: (img: string) => void;
}

export default function ProfileImageSection({
  img,
  onImageChange,
}: ProfileImageSectionProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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

    setIsUploadingImage(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        onImageChange(base64String);
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

  return (
    <Box>
      <Text fontSize="sm" fontWeight="medium" mb={2}>
        Profile Image
      </Text>

      {/* Image Preview */}
      {(imagePreview || (img && img.trim() !== "")) && (
        <Flex justify="center" mb={4}>
          <Image
            src={imagePreview || (img && img.trim() !== "" ? img : undefined)}
            boxSize="120px"
            objectFit="cover"
            borderRadius="full"
            border="2px solid"
            borderColor="gray.200"
          />
        </Flex>
      )}

      {/* URL Input and File Upload */}
      <VStack gap={3} align="stretch">
        <Box>
          <Text fontSize="xs" color="gray.600" mb={2}>
            Option 1: Image URL
          </Text>
          <Input
            id="profile-image-url"
            name="profileImageUrl"
            value={img.startsWith("data:") ? "" : img}
            onChange={(e) => {
              onImageChange(e.target.value);
              setImagePreview(null);
            }}
            placeholder="https://example.com/image.jpg"
            autoComplete="url"
          />
        </Box>

        <Box>
          <Text fontSize="xs" color="gray.600" mb={2}>
            Option 2: Upload from device
          </Text>
          <Input
            id="profile-image-file"
            name="profileImageFile"
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
            All image formats supported • No size limit
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
