// Cookie options for the auth tokens.
//
// In production the frontend (e.g. Vercel) and backend (e.g. Render) live on
// different domains, so the cookies are cross-site. Browsers only send
// cross-site cookies when they are SameSite=None AND Secure (HTTPS).
//
// In local development everything is http://localhost, so Secure cookies
// wouldn't be sent — we use SameSite=Lax and non-secure there.
//
// Built as a function so it reads process.env at call time (after env vars
// are loaded), not at import time.
export const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  };
};
