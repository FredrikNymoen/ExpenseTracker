import { Box, Text } from "@chakra-ui/react";

const categories = [
  { value: "Food", label: "Food" },
  { value: "Transportation", label: "Transportation" },
  { value: "Entertainment", label: "Entertainment" },
  { value: "Shopping", label: "Shopping" },
  { value: "Bills", label: "Bills" },
  { value: "Games", label: "Games" },
  { value: "Education", label: "Education" },
  { value: "Gifts", label: "Gifts" },
  { value: "Other", label: "Other" },
];

interface CategorySelectorProps {
  category: string;
  onCategoryChange: (category: string) => void;
}

export default function CategorySelector({
  category,
  onCategoryChange,
}: CategorySelectorProps) {
  return (
    <Box>
      <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
        Category
      </Text>
      <select
        id="transaction-category"
        name="transactionCategory"
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        style={{
          width: "100%",
          padding: "8px 12px",
          backgroundColor: "var(--chakra-colors-gray-50)",
          border: "1px solid var(--chakra-colors-gray-300)",
          borderRadius: "6px",
          fontSize: "14px",
        }}
      >
        {categories.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>
    </Box>
  );
}