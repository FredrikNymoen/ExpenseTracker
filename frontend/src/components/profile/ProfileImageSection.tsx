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

  const compressImage = (file: File, maxSizeMB: number = 5): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();

      img.onload = () => {
        // Calculate dimensions to fit within reasonable size
        const maxWidth = 800;
        const maxHeight = 800;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);

        // Start with high quality and reduce if needed
        let quality = 0.8;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Reduce quality until under size limit
        while (dataUrl.length > maxSizeMB * 1024 * 1024 && quality > 0.1) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

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
      // Compress image before uploading
      const compressedBase64 = await compressImage(file, 5); // 5MB max
      onImageChange(compressedBase64);
      setImagePreview(compressedBase64);
      setIsUploadingImage(false);

      toaster.create({
        title: "Image Uploaded",
        description: "Profile image updated successfully",
        type: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Image upload error:", error);
      toaster.create({
        title: "Upload Error",
        description: "Failed to process image. Please try a smaller image.",
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
            All image formats supported • Images will be compressed automatically
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
