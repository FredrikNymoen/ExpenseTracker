import {
  Card,
  CardBody,
  Heading,
  VStack,
  Button,
  Icon,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { WalletIcon, ActivityIcon, ShieldIcon } from "../icons";

export default function QuickActions() {
  const navigate = useNavigate();

  const goToSection = (section: string) => {
    navigate(`/transactions#${section}`);
    setTimeout(() => {
      const el = document.getElementById(section);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  return (
    <Card.Root
      bg="white"
      shadow="lg"
      borderWidth="1px"
      borderColor="gray.200"
      w="full"
    >
      <CardBody p={6}>
        <Heading size="lg" mb={4} color="accent">
          Quick Actions
        </Heading>
        <VStack gap={3}>
          <Button
            bg="linear-gradient(90deg, #2F855A, #38A169)"
            size="lg"
            w="full"
            onClick={() => goToSection("send-money")}
          >
            <Icon as={WalletIcon} />
            Send Money
          </Button>
          <Button
            bg="linear-gradient(90deg, #2F855A, #38A169)"
            size="lg"
            w="full"
            onClick={() => navigate("/transactions")}
          >
            <Icon as={ActivityIcon} />
            View All Transactions
          </Button>
          <Button
            variant="outline"
            size="lg"
            w="full"
            onClick={() => navigate("/profile", { replace: true })}
          >
            <Icon as={ShieldIcon} />
            Account Settings
          </Button>
        </VStack>
      </CardBody>
    </Card.Root>
  );
}
