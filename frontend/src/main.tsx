import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { Provider } from "./components/ui/Provider";
import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
  authority: import.meta.env.VITE_COGNITO_AUTHORITY,
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,

  redirect_uri: window.location.origin + "/callback",
  response_type: "code",
  scope: "profile openid email",
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <Provider
        defaultTheme="light"
        forcedTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <App />
      </Provider>
    </AuthProvider>
  </StrictMode>
);
