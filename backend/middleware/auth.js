// utils/auth.js
import { createRemoteJWKSet, jwtVerify } from "jose";

// Polyfill for Lambda environment
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = await import('crypto').then(crypto => crypto.webcrypto);
}

const {
  COGNITO_REGION,
  COGNITO_USER_POOL_ID
} = process.env;

const ISSUER = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`;
const JWKS = createRemoteJWKSet(new URL(`${ISSUER}/.well-known/jwks.json`));

export const auth = async (req, res, next) => {
  try {
    const authz = req.headers.authorization || "";
    const [type, token] = authz.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ error: "Missing/invalid Authorization header" });
    }

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: ISSUER
    });

    req.auth = payload;
    next();
  } catch (e) {
    console.error("JWT verify failed:", e?.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
