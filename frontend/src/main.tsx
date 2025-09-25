import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { Provider } from "./components/ui/provider.tsx";
import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
  //Elling
  //authority: "https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_bqAc6h9cJ",
  //client_id: "5kdoj9f3c6hsnp6gdnevs0fm4k",

  //Fredrik
  authority:
    "https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_HBZ87LdIS",
  client_id: "jsj2h93siq9ksbetblkeh9f0s",

  redirect_uri: window.location.origin + "/callback",
  response_type: "code",
  scope: "profile openid email",
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <Provider>
        <App />
      </Provider>
    </AuthProvider>
  </StrictMode>
);
