import LoadingScreen from "@/components/LoadingScreen";
import { Box, Image } from "@chakra-ui/react";
import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "@/components/layout/Footer";
import HeroSection from "../components/login/HeroSection";
import FeaturesSection from "../components/login/FeaturesSection";
import { animationStyles } from "../components/login/AnimationStyles";

export default function Login() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from = (location.state as any)?.from?.pathname || "/";

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [auth.isAuthenticated, from, navigate]);

  // Clean up logout flag when entering login page
  useEffect(() => {
    sessionStorage.removeItem("logout_in_progress");
  }, []);

  if (auth.isLoading) return <LoadingScreen />;
  if (auth.error) return <Box>Auth error: {auth.error.message}</Box>;
  if (auth.isAuthenticated) return null;

  const scrollToFeatures = () => {
    document.getElementById("features-section")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <Box
      bg="linear-gradient(135deg, rgba(56, 142, 60, 0.08), rgba(47, 133, 90, 0.12))"
      color="accent"
      bgSize="cover"
      bgRepeat="no-repeat"
      bgPos="bottom"
    >
      {/* Add animation styles */}
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />

      <Image
        src="/expTrLogo.png"
        alt="ExpenseTracker Logo"
        position="absolute"
        top="0px"
        left="0px"
        transform="translateY(-20%)"
        w={{ base: "140px", md: "160px", lg: "180px" }}
        draggable={false}
      />

      <HeroSection onScrollToFeatures={scrollToFeatures} />
      <FeaturesSection />
      <Footer />
    </Box>
  );
}
