import jwt from "jsonwebtoken";

/**
 * Extract user authentication data from request
 * @param {Request} request - The Next.js request object
 * @returns {Object} - { isAdmin: boolean, userId: string|null, email: string|null }
 */
export async function extractAuthFromRequest(request) {
  let isAdmin = false;
  let userId = null;
  let email = null;
  let role = null;

  // Try to get token from authorization header or cookies
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : request.cookies?.get("uat")?.value;

  console.log(
    "🔐 [extractAuth] Token source:",
    authHeader ? "Authorization header" : "Cookie (uat)"
  );
  console.log("🔐 [extractAuth] Token present:", token ? "✓ Yes" : "✗ No");

  if (token) {
    try {
      // Use environment variable - MUST be set in Vercel
      const secret = process.env.JWT_SECRET;

      if (!secret) {
        console.error(
          "❌ [extractAuth] JWT_SECRET not found in environment variables!"
        );
        throw new Error("JWT_SECRET is not configured");
      }

      console.log("🔐 [extractAuth] JWT_SECRET found, verifying token...");
      const decoded = jwt.verify(token, secret);

      isAdmin = decoded.isAdmin === true;
      userId = decoded.userId;
      email = decoded.email;
      role = decoded.role || null;

      console.log("✅ [extractAuth] JWT verified:", {
        userId,
        email,
        isAdmin,
        role,
      });
      return { isAdmin, userId, email, role };
    } catch (jwtError) {
      console.warn(
        "⚠️ [extractAuth] JWT verification failed:",
        jwtError.message
      );

      // Fallback to cookie data
      const accountCookie = request.cookies?.get("account")?.value;
      if (accountCookie) {
        try {
          console.log("🔐 [extractAuth] Trying account cookie fallback...");
          const accountData = JSON.parse(decodeURIComponent(accountCookie));
          isAdmin = accountData.isAdmin === true;
          userId = accountData._id;
          email = accountData.email;
          role = accountData.role || null;

          console.log("✅ [extractAuth] Using cookie fallback:", {
            userId,
            email,
            isAdmin,
            role,
          });
          return { isAdmin, userId, email, role };
        } catch (cookieError) {
          console.error(
            "❌ [extractAuth] Cookie parsing failed:",
            cookieError.message
          );
        }
      }
    }
  }

  console.warn("⚠️ [extractAuth] No valid authentication found");
  return { isAdmin: false, userId: null, email: null, role: null };
}

/**
 * Check if request has admin privileges
 * @param {Request} request - The Next.js request object
 * @returns {Promise<{isAdmin: boolean, userId: string|null, authData: Object}>}
 */
export async function checkAdminAuth(request) {
  const authData = await extractAuthFromRequest(request);

  return {
    isAdmin: authData.isAdmin,
    userId: authData.userId,
    authData,
    role: authData.role,
  };
}

/**
 * Middleware function to require admin access for API routes
 * @param {Request} request - The Next.js request object
 * @returns {Promise<{success: boolean, authData?: Object, errorResponse?: Response}>}
 */
export async function requireAdmin(request) {
  const { isAdmin, userId, authData, role } = await checkAdminAuth(request);

  if (!isAdmin && role !== "admin") {
    const errorResponse = new Response(
      JSON.stringify({
        success: false,
        message: "Access denied. Only administrators can perform this action.",
        data: null,
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );

    return { success: false, errorResponse };
  }

  return { success: true, authData: { ...authData, userId } };
}

// =================================================================
// ==  NEW FUNCTION TO ADD  =========================================
// =================================================================

/**
 * Middleware function to require standard user access for API routes
 * @param {Request} request - The Next.js request object
 * @returns {Promise<{success: boolean, authData?: Object, errorResponse?: Response}>}
 */
export async function requireAuth(request) {
  console.log("🔐 [requireAuth] Starting authentication check");
  console.log("🔐 [requireAuth] Request URL:", request.url);
  console.log("🔐 [requireAuth] Headers present:", {
    authorization: request.headers.get("authorization") ? "✓ Yes" : "✗ No",
    cookie: request.headers.get("cookie") ? "✓ Yes" : "✗ No",
  });

  // Use your existing function to get auth data
  const authData = await extractAuthFromRequest(request);

  console.log("🔐 [requireAuth] Extracted auth data:", {
    userId: authData.userId ? "✓ Present" : "✗ Missing",
    email: authData.email,
    isAdmin: authData.isAdmin,
    role: authData.role,
  });

  // Fail if no userId is found
  if (!authData.userId) {
    console.error("❌ [requireAuth] No userId found - authentication failed");
    const errorResponse = new Response(
      JSON.stringify({
        success: false,
        message: "Authentication required. Please log in.",
        data: null,
      }),
      {
        status: 401, // 401 Unauthorized
        headers: { "Content-Type": "application/json" },
      }
    );

    return { success: false, errorResponse };
  }

  console.log(
    "✅ [requireAuth] Authentication successful for userId:",
    authData.userId
  );
  // Pass along the authData (which includes userId, email, isAdmin)
  return { success: true, authData: authData };
}
