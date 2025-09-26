import {
  Center,
  VStack,
  Image,
  Spinner,
  Text,
} from "@chakra-ui/react";

const LoadingScreen = () => {
  return (
    <Center h="100vh" bg="gray.50">
      <VStack gap={4}>
        <Image
          src="/expTrLogo.png"
          alt="ExpenseTracker"
          boxSize={{ base: "60px", md: "72px" }}
          draggable={false}
        />

        <Spinner size="lg" color="green.600" />

        <Text fontSize="sm" color="gray.600">
          Loading...
        </Text>
      </VStack>
    </Center>
  );
};

export default LoadingScreen;
