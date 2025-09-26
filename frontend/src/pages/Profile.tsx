import {
  Box,
  Container,
  VStack,
  Card,
  CardBody,
  Heading,
  Text,
  Button,
} from "@chakra-ui/react";
import { useAuth } from "react-oidc-context";
import { useDashboardData } from "../hooks/dashboard/useDashboardData";
import LoadingScreen from "@/components/LoadingScreen";
import CurrentProfileInfo from "../components/profile/CurrentProfileInfo";
import ProfileUpdateForm from "../components/profile/ProfileUpdateForm";
import PasswordChangeSection from "../components/profile/PasswordChangeSection";
import DangerZone from "../components/profile/DangerZone";

export default function Profile() {
  const auth = useAuth();
  const { user, loading } = useDashboardData();

  if (loading) return <LoadingScreen />;

  return (
    <Container maxW="2xl" py={8}>
      <VStack gap={6} align="stretch">
        <Box>
          <Heading size="xl" color="accent" mb={2}>
            Profile Settings
          </Heading>
          <Text color="gray.800">Update your profile information</Text>
        </Box>

        {user && (
          <Card.Root>
            <CardBody p={6}>
              <VStack gap={6} align="stretch">
                <CurrentProfileInfo user={user} />
                <ProfileUpdateForm user={user} />
                <PasswordChangeSection />

                {/* Sign Out */}
                <Button
                  variant="outline"
                  colorPalette="gray"
                  onClick={() => {
                    // Set logout flag to prevent ProtectedRoute Navigate trigger
                    sessionStorage.setItem("logout_in_progress", "true");

                    // Remove user from local auth state
                    auth.removeUser();

                    // Small delay to let ProtectedRoute check the flag before redirect
                    setTimeout(() => {
                      const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
                      const logoutUri = `${import.meta.env.VITE_APP_URL}/login`;
                      const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;

                      window.location.replace(
                        `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
                          logoutUri
                        )}`
                      );
                    }, 100);
                  }}
                >
                  Sign Out
                </Button>

                <DangerZone />
              </VStack>
            </CardBody>
          </Card.Root>
        )}
      </VStack>
    </Container>
  );
}
