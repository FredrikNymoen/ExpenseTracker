import { Box, VStack } from "@chakra-ui/react";
import { FiSend, FiUsers, FiTrendingUp } from "react-icons/fi";
import FeatureCard from "./FeatureCard";

const features = [
  {
    icon: FiSend,
    title: "Instant Transfers",
    description: "Send money to friends and family in seconds! No more waiting for bank transfers."
  },
  {
    icon: FiTrendingUp,
    title: "Expense Tracking",
    description: "Monitor your spending patterns with detailed analytics."
  },
  {
    icon: FiUsers,
    title: "24/7 Availability",
    description: "Transfer money anytime, anywhere. Our platform is always available when you need it."
  }
];

export default function FeaturesSection() {
  return (
    <Box id="features-section" py={20}>
      <Box maxW="1200px" mx="auto" px={6}>
        <VStack
          gap={6}
          w="full"
          maxW="800px"
          align="center"
          mx="auto"
          color="rgba(56, 142, 60, 0.9)"
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </VStack>
      </Box>
    </Box>
  );
}