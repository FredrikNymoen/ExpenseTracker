import { defineConfig, createSystem, defaultConfig } from "@chakra-ui/react";

export const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#E8F5E9" },
          100: { value: "#C8E6C9" },
          200: { value: "#A5D6A7" },
          300: { value: "#81C784" },
          400: { value: "#66BB6A" },
          500: { value: "#4CAF50" }, // standard green
          600: { value: "#388E3C" },
          700: { value: "#2E7D32" }, // primary
          800: { value: "#1B5E20" },
          900: { value: "#0D3D14" },
        },
        textDark: { value: "#212121" },
        textLight: { value: "#FFFFFF" },
        ButtonActiveLight: { value: "rgba(59, 255, 255)" }, // light cyan
      },
    },
    semanticTokens: {
      colors: {
        background: { value: "#FFFFFF" },
        text: { value: "#212121" },
        accent: { value: "#388E3C" },
      },
    },
  },
});

export default createSystem(defaultConfig, config);
