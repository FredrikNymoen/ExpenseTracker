import { Button, HStack, Flex, Icon, Circle } from "@chakra-ui/react";
import { ColorModeButton } from "../ui/color-mode";
import { MdHome, MdSwapHoriz } from "react-icons/md";
import { NavLink } from "react-router-dom";

const activeBgLight = "cyan.200"
const activeBgDark = "cyan.800"

export default function Header() {
    return(
    <>
        <Flex
            as="header"
            h="4.5rem"
            px={6}
            w="100%"
            align="center"
            justify="space-between"
            borderBottomWidth="1px"
            bg={{ base: "cyan.100", _dark: "cyan.900" }}
        >
            <HStack>
                <NavLink to="/dashboard">
                    {({ isActive }) => (
                        <Button 
                            variant="subtle" 
                            colorPalette={"cyan"} 
                            fontWeight="600"
                            bg={isActive ? activeBgLight : "transparent" }
                            _dark={{ bg: isActive ? activeBgDark : "transparent" }}
                        >
                            <Icon as={MdHome} mr={2} /> Dashboard
                        </Button>
                    )}
                </NavLink>
                <NavLink to="/transactions">
                    {({ isActive }) => (
                        <Button 
                            variant="subtle" 
                            colorPalette={"cyan"} 
                            fontWeight="600"
                            bg={isActive ? activeBgLight : "transparent"}
                            _dark={{ bg: isActive ? activeBgDark : "transparent" }}
                        >
                            <Icon as={MdSwapHoriz} mr={2} /> Transactions
                        </Button>
                    )}
                </NavLink>
            </HStack>
            <HStack>
                <ColorModeButton colorPalette={"cyan"} variant={"subtle"} />
                <NavLink to="/profile">
                    <Circle size="32px" bg="blue.500" color="white" fontSize="sm" fontWeight="bold">
                        U
                    </Circle>
                </NavLink>
            </HStack>
        </Flex>
    </>
    )
}