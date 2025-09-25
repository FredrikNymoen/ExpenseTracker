import { getUserByCognitoSub } from "@/lib/api";
import {
  Button,
  HStack,
  Flex,
  Icon,
  Image,
  useBreakpointValue,
  Menu,
  Portal,
  Text,
  Avatar,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { MdHome, MdSwapHoriz, MdMenu } from "react-icons/md";
import { useAuth } from "react-oidc-context";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

const activeTextLight = "accent";

export default function Header() {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const auth = useAuth();
  const isActivePath = (to: string) => pathname.startsWith(to);

  const [img, setImg] = useState<string>();
  const [name, setName] = useState<string>();

  useEffect(() => {
    const fetchUser = async () => {
      if (auth.isAuthenticated && auth.user?.profile.sub) {
        try {
          const user = await getUserByCognitoSub(auth.user.profile.sub);
          setImg(user.img && user.img.trim() !== "" ? user.img : undefined);
          setName(user.name || "User");
        } catch (err) {
          console.error("Failed to fetch user:", err);
        }
      }
    };
    fetchUser();
  }, [auth]);

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
                      color={
                        isActivePath("/dashboard") ? activeTextLight : "black"
                      }
                    >
                      <Icon as={MdHome} mr={2} /> Dashboard
                    </Menu.Item>
                    <Menu.Item
                      value="transactions"
                      onClick={() => navigate("/transactions")}
                      bg="transparent"
                      color={
                        isActivePath("/transactions")
                          ? activeTextLight
                          : "black"
                      }
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
            <Avatar.Root
              boxSize={{ base: "55px", md: "59px" }}
              borderRadius="full"
              aspectRatio="1"
              overflow="hidden"
            >
              <Avatar.Image src={img} alt={name} />
              <Avatar.Fallback
                name={name}
                bg="linear-gradient(90deg, #2F855A, #38A169)"
                color="white"
                fontWeight="bold"
                fontSize={{ base: "28px", md: "31px" }}
                border="2px solid #388E3C"
                borderRadius="full"
                p="5"
                display="flex"
                alignItems="center"
                justifyContent="center"
              />
            </Avatar.Root>
          </NavLink>
        </HStack>
      </Flex>
    </Flex>
  );
}
