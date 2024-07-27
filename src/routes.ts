// These routes do not require authentication
export const publicRoutes = [
  "/",
  "/auth/new-verification",
  "/auth/new-password",
  "/webhook/stripe",
];

// These routes are used for authentication
// When user is not logged in and try to access to protected page we redirect him to login
// When user try to access to authRoutes and he is logged in  we redirect him to /settings
export const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/auth/forbidden",
  "/auth/reset",
  
];

// The prefix for API authentication routes
// Routes that start with this prefix are use for API authentication purposes ( always allowed )
export const apiAuthPrefix = "/api/auth";

//The default redirect path after logging in
// export const DEFAULT_LOGIN_REDIRECT = "/";
