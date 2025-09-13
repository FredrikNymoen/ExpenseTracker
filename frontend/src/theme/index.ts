import { defineConfig, createSystem, defaultConfig } from "@chakra-ui/react";
//Liste over farger: https://www.chakra-ui.com/docs/theming/colors?


export const config = defineConfig({
    theme: {
        tokens: {
            colors: {
                ButtonActiveLight: { value: "rgba(59, 255, 255)" }, // lag custom farger som kan gjenbrukes
            }
        },
        semanticTokens: {
            colors: {
                //background: { value: { base: "colors.red123", _dark: "colors.black" } },
                //text: { value: { base: "gray.800", _dark: "gray.100" } },
                //accent: { value: { base: "brand.500", _dark: "brand.500" } }
            }
        },

    }
});

export default createSystem(defaultConfig, config)

