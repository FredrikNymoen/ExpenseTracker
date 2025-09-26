import {
  Box,
  Text,
  Input,
  VStack,
  HStack,
  Avatar,
  Button,
} from "@chakra-ui/react";
import { useMemo } from "react";
import type { User } from "../../lib/api";

interface UserSelectorProps {
  allUsers: User[];
  currentUserId: string;
  searchTerm: string;
  selectedUser: User | null;
  onSearchChange: (term: string) => void;
  onUserSelect: (user: User) => void;
  onUserDeselect: () => void;
}

export default function UserSelector({
  allUsers,
  currentUserId,
  searchTerm,
  selectedUser,
  onSearchChange,
  onUserSelect,
  onUserDeselect,
}: UserSelectorProps) {
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return [];
    return allUsers
      .filter(
        (user) =>
          user.id !== currentUserId &&
          user.role !== "admin" &&
          user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 5);
  }, [searchTerm, allUsers, currentUserId]);

  return (
    <Box>
      <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
        Send to{" "}
        {selectedUser && (
          <Text as="span" color="green.600" fontSize="xs">
            (1 recipient selected)
          </Text>
        )}
      </Text>
      <Input
        id="recipient-search"
        name="recipientSearch"
        placeholder={selectedUser ? selectedUser.name : "Search by name..."}
        value={selectedUser ? selectedUser.name : searchTerm}
        onChange={(e) => !selectedUser && onSearchChange(e.target.value)}
        bg={selectedUser ? "green.50" : "gray.50"}
        borderColor={selectedUser ? "green.300" : "gray.300"}
        disabled={!!selectedUser}
        cursor={selectedUser ? "not-allowed" : "text"}
        autoComplete="off"
      />
      {!selectedUser && (
        <Text fontSize="xs" color="gray.500" mt={1}>
          You can only send money to one person at a time
        </Text>
      )}

      {/* Search Results */}
      {searchTerm && filteredUsers.length > 0 && !selectedUser && (
        <VStack
          mt={2}
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          maxH="200px"
          overflowY="auto"
          p={2}
          gap={1}
        >
          {filteredUsers.map((user) => (
            <HStack
              key={user.id}
              p={2}
              w="full"
              cursor="pointer"
              borderRadius="md"
              _hover={{ bg: "gray.50" }}
              onClick={() => onUserSelect(user)}
            >
              <Avatar.Root size="sm">
                <Avatar.Image
                  src={
                    user.img && user.img.trim() !== "" ? user.img : undefined
                  }
                  alt={user.name}
                />
                <Avatar.Fallback name={user.name} />
              </Avatar.Root>
              <VStack align="start" gap={0} flex={1}>
                <Text fontSize="sm" fontWeight="medium">
                  {user.name}
                </Text>
              </VStack>
            </HStack>
          ))}
        </VStack>
      )}

      {/* Selected User */}
      {selectedUser && (
        <HStack
          mt={2}
          p={3}
          bg="green.50"
          borderRadius="md"
          borderWidth="1px"
          borderColor="green.200"
        >
          <Avatar.Root size="sm">
            <Avatar.Image
              src={
                selectedUser.img && selectedUser.img.trim() !== ""
                  ? selectedUser.img
                  : undefined
              }
              alt={selectedUser.name}
            />
            <Avatar.Fallback name={selectedUser.name} />
          </Avatar.Root>
          <VStack align="start" gap={0} flex={1}>
            <Text fontSize="sm" fontWeight="medium" color="green.800">
              Sending to: {selectedUser.name}
            </Text>
          </VStack>
          <Button
            size="sm"
            variant="outline"
            colorScheme="red"
            onClick={onUserDeselect}
          >
            ✕ Change
          </Button>
        </HStack>
      )}
    </Box>
  );
}
