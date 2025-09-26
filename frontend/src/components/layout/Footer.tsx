import { Box, Text, HStack, VStack, Link, Icon } from "@chakra-ui/react";
import { FiGithub, FiLinkedin } from "react-icons/fi";

export default function Footer() {
  return (
    <Box
      bg="rgba(255, 255, 255, 0.95)"
      borderTop="1px solid rgba(56, 142, 60, 0.2)"
      py={8}
      mt="auto"
    >
      <VStack gap={6} maxW="1200px" mx="auto" px={6}>
        {/* Main Footer Content */}
        <HStack
          justify="space-between"
          align="flex-start"
          w="full"
          flexWrap="wrap"
          gap={8}
        >
          {/* Brand Section */}
          <VStack align="flex-start" gap={3}>
            <Text fontSize="xl" fontWeight="bold" color="accent">
              ExpenseTracker
            </Text>
            <Text fontSize="sm" color="rgba(56, 142, 60, 0.7)" maxW="300px">
              Send and receive money instantly, securely and hassle-free.
            </Text>
          </VStack>

          {/* Links Section */}
          <HStack gap={12} flexWrap="wrap">
            <VStack align="flex-start" gap={2}>
              <Text fontWeight="semibold" color="accent" fontSize="sm">
                Support
              </Text>
              <Link
                href="mailto:expencetracker.team@gmail.com"
                fontSize="sm"
                color="rgba(56, 142, 60, 0.7)"
                _hover={{ color: "accent", textDecoration: "none" }}
              >
                Contact Us
              </Link>
            </VStack>
          </HStack>

          {/* Social Links */}
          <VStack align="flex-end" gap={3}>
            <Text fontWeight="semibold" color="accent" fontSize="sm">
              Connect
            </Text>
            <HStack gap={3}>
              <Link
                href="https://www.linkedin.com/in/fredrik-nymoen-583aa7273/"
                color="rgba(56, 142, 60, 0.7)"
                _hover={{ color: "accent" }}
                transition="color 0.2s"
              >
                <Icon as={FiLinkedin} boxSize={5} />
              </Link>
              <Link
                href="https://github.com/FredrikNymoen"
                color="rgba(56, 142, 60, 0.7)"
                _hover={{ color: "accent" }}
                transition="color 0.2s"
              >
                <Icon as={FiGithub} boxSize={5} />
              </Link>
            </HStack>
          </VStack>
        </HStack>

        {/* Bottom Section */}
        <HStack
          justify="space-between"
          align="center"
          w="full"
          flexWrap="wrap"
          gap={4}
        >
          <Text fontSize="sm" color="rgba(56, 142, 60, 0.6)">
            © 2025 ExpenseTracker. All rights reserved.
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
}
