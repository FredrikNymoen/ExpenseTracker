import { Box, Flex, Spinner, Text } from "@chakra-ui/react";

interface PullToRefreshIndicatorProps {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
}

export const PullToRefreshIndicator = ({
  isPulling,
  pullDistance,
  isRefreshing,
}: PullToRefreshIndicatorProps) => {
  // Pull indicator (shows when pulling, not when refreshing)
  const pullIndicator = pullDistance > 0 && !isRefreshing && (
    <Box
      position="fixed"
      top={`${Math.min(pullDistance - 60, 40)}px`}
      left="50%"
      transform="translateX(-50%)"
      zIndex={1000}
      transition="all 0.1s ease"
    >
      <Flex
        align="center"
        gap={2}
        bg="white"
        px={4}
        py={2}
        borderRadius="full"
        shadow="lg"
        border="1px solid"
        borderColor="gray.200"
      >
        {isPulling ? (
          <>
            <Spinner size="sm" color="green.500" />
            <Text fontSize="sm" color="green.600" fontWeight="medium">
              Release to refresh
            </Text>
          </>
        ) : (
          <Text fontSize="sm" color="gray.600" fontWeight="medium">
            Pull to refresh
          </Text>
        )}
      </Flex>
    </Box>
  );

  // Refreshing indicator (shows only when actually refreshing)
  const refreshingIndicator = isRefreshing && (
    <Box
      position="fixed"
      top={4}
      left="50%"
      transform="translateX(-50%)"
      zIndex={1000}
    >
      <Flex
        align="center"
        gap={2}
        bg="white"
        px={4}
        py={2}
        borderRadius="full"
        shadow="lg"
        border="1px solid"
        borderColor="gray.200"
      >
        <Spinner size="sm" color="green.500" />
        <Text fontSize="sm" color="green.600" fontWeight="medium">
          Refreshing...
        </Text>
      </Flex>
    </Box>
  );

  return (
    <>
      {pullIndicator}
      {refreshingIndicator}
    </>
  );
};
