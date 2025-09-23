import {
  Button,
  HStack,
  Flex,
  Icon,
  Circle,
  Image,
  useBreakpointValue,
  Menu,
  Portal,
  Text,
} from "@chakra-ui/react";
import { MdHome, MdSwapHoriz, MdMenu } from "react-icons/md";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

const activeTextLight = "accent";
const activeBgDark = "grey.700";

export default function Header() {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActivePath = (to: string) => pathname.startsWith(to);

  return (
    <Flex
      as="header"
      h="4.5rem"
      px={{ base: 4, md: 6 }}
      w="100%"
      align="center"
      borderBottomWidth="1px"
      bg="background"
      color="text"
      borderBottomColor="accent"
      position="sticky"
      top={0}
      zIndex={10}
    >
      {/* VENSTRE SIDE */}
      <Flex flex="1">
        <HStack>
          {isMobile ? (
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button
                  aria-label="Open menu"
                  variant="subtle"
                  color="accent"
                  fontWeight="600"
                  px={3}
                  py={2}
                  h="auto"
                  display="flex"
                  flexDir="column"
                  alignItems="center"
                  gap="1"
                >
                  <Icon as={MdMenu} boxSize={6} />
                  <Text fontSize="xs" lineHeight="1">
                    Menu
                  </Text>
                </Button>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <Menu.Item
                      value="dashboard"
                      onClick={() => navigate("/dashboard")}
                      bg="transparent"
                      color={ isActivePath("/dashboard") ? activeTextLight : "black" }
                    >
                      <Icon as={MdHome} mr={2} /> Dashboard
                    </Menu.Item>
                    <Menu.Item
                      value="transactions"
                      onClick={() => navigate("/transactions")}
                      bg="transparent"
                      color={ isActivePath("/transactions") ? activeTextLight : "black" }
                    >
                      <Icon as={MdSwapHoriz} mr={2} /> Transactions
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          ) : (
            <>
              <NavLink to="/dashboard">
                {({ isActive }) => (
                  <Button
                    variant="subtle"
                    color={isActive ? activeTextLight : "black"}
                    fontWeight="600"
                    bg="transparent"
                  >
                    <Icon as={MdHome} mr={1} /> Dashboard
                  </Button>
                )}
              </NavLink>
              <NavLink to="/transactions">
                {({ isActive }) => (
                  <Button
                    variant="subtle"
                    color={isActive ? activeTextLight : "black"}
                    fontWeight="600"
                    bg="transparent"
                  >
                    <Icon as={MdSwapHoriz} mr={1} /> Transactions
                  </Button>
                )}
              </NavLink>
            </>
          )}
        </HStack>
      </Flex>

      {/* MIDTEN: LOGO */}
      <Flex flex="1" justify="center">
        <NavLink to="/dashboard">
          <Image
            src="/expTrLogo.png"
            alt="Logo"
            boxSize={{ base: "140px", md: "180px" }}
            objectFit="contain"
          />
        </NavLink>
      </Flex>

      {/* HØYRE: PROFIL */}
      <Flex flex="1" justify="flex-end">
        <HStack>
          <NavLink to="/profile">
            <Circle
              size="39px"
              bg="#f5f4f4ff"
              color="#388E3C"
              fontSize="sm"
              fontWeight="bold"
              border={"2px solid #388E3C"}
            >
              U
            </Circle>
          </NavLink>
        </HStack>
      </Flex>
    </Flex>
  );
}
