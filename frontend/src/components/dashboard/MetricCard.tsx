import { Box, Card, CardBody, Flex, Stat, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  subtext?: string;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
}

export default function MetricCard({
  icon,
  label,
  value,
  subtext,
  iconBg,
  iconColor,
  valueColor = "gray.900",
}: MetricCardProps) {
  return (
    <Card.Root
      bg="white"
      shadow="lg"
      borderWidth="1px"
      borderColor="gray.200"
      _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
      transition="all 0.2s"
    >
      <CardBody>
        <Flex align="center">
          <Box p={3} borderRadius="full" bg={iconBg} color={iconColor} mr={4}>
            {icon}
          </Box>
          <Stat.Root>
            <Stat.Label color="gray.600" fontSize="sm" fontWeight="medium">
              {label}
            </Stat.Label>
            <Stat.ValueText fontSize="2xl" fontWeight="bold" color={valueColor}>
              {value}
            </Stat.ValueText>
            {subtext && (
              <Text fontSize="xs" color="gray.500">
                {subtext}
              </Text>
            )}
          </Stat.Root>
        </Flex>
      </CardBody>
    </Card.Root>
  );
}
