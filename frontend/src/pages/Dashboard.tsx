import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Container,
  VStack,
  Spinner,
  Alert,
  Card,
  Heading,
  SimpleGrid,
  CardBody,
  Stat,
  Badge,
} from "@chakra-ui/react";
import { useAuth } from "react-oidc-context";
import type { User } from "../lib/api";
import { ensureMe } from "../lib/api";

const Dashboard = () => {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (auth.isLoading) return;
    if (!auth.isAuthenticated) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const token = auth.user?.access_token; // eller id_token, se pkt 4
    const ctrl = new AbortController();

    (async () => {
      try {
        setLoading(true);

        const defaultName = auth.user?.profile.name || "Unnamed user"; // fallback
        const me = await ensureMe(token!, defaultName);
        setUser(me);
        setError(null);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          setError(e?.message || "Could not fetch user data");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [auth.isLoading, auth.isAuthenticated]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("nb-NO", {
      style: "currency",
      currency: "NOK",
    }).format(amount);

  const getRiskBadgeColor = (score: string) => {
    if (score === "low") return "green";
    if (score === "medium") return "yellow";
    return "red";
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack gap={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading user data...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={10}>
        <Alert.Root status="error" borderRadius="md">
          <Alert.Indicator />
          <Alert.Title>Failed to load data</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
      </Container>
    );
  }

  if (!user) return null; // defensive guard

  return (
    <Box minH="100vh" bg={"accent"} color="text">
      <Container maxW="container.xl" py={10}>
        <VStack gap={8} align="stretch">
          <Heading size="xl" color="blue.600">
            Dashboard
          </Heading>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
            <Card.Root bg={"accent"}>
              <CardBody>
                <Stat.Root>
                  <Stat.Label>Name</Stat.Label>
                  <Stat.ValueText fontSize="2xl">{user.name}</Stat.ValueText>
                </Stat.Root>
              </CardBody>
            </Card.Root>

            <Card.Root bg={"accent"}>
              <CardBody>
                <Stat.Root>
                  <Stat.Label>Balance</Stat.Label>
                  <Stat.ValueText color="green.500">
                    {formatCurrency(user.balance)}
                  </Stat.ValueText>
                </Stat.Root>
              </CardBody>
            </Card.Root>

            <Card.Root bg={"accent"}>
              <CardBody>
                <Stat.Root>
                  <Stat.Label>Risk score</Stat.Label>
                  <Stat.ValueText>{user.riskScore}</Stat.ValueText>
                  <Badge mt={1} colorScheme={getRiskBadgeColor(user.riskScore)}>
                    {user.riskScore}
                  </Badge>
                </Stat.Root>
              </CardBody>
            </Card.Root>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

export default Dashboard;
