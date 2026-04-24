const { verifyAccessToken } = require('../utils/generateToken');
const { errorResponse } = require('../utils/apiResponse');
const User = require('../models/User');

// ────────────────────────────────────────────────────────────────
// ACCESS TOKEN VERIFICATION MIDDLEWARE
// ────────────────────────────────────────────────────────────────
// Reads the accessToken from the Authorization: Bearer header.
// The frontend stores tokens in localStorage and attaches the
// access token as a Bearer token on every request.
// ────────────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 401, 'Not authorized, no token provided');
    }

    const decoded = verifyAccessToken(token);
    const currentUser = await User.findById(decoded.id).select('_id name email role isActive');
    
    if (!currentUser) {
      return errorResponse(res, 401, 'The user belonging to this token no longer exists');
    }

    if (!currentUser.isActive) {
      return errorResponse(res, 403, 'Your account has been suspended by an administrator');
    }

    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Token expired, please refresh');
    }
    return errorResponse(res, 401, 'Not authorized, invalid token');
  }
};

// ────────────────────────────────────────────────────────────────
// CSRF ORIGIN VALIDATION MIDDLEWARE
// ────────────────────────────────────────────────────────────────
// SECURITY DECISION: Why Origin/Referer validation instead of
// CSRF tokens?
//
// 1. SameSite=Strict stops cross-SITE requests (evil.com → our API),
//    but does NOT stop same-SITE requests (compromised-subdomain.ours.com
//    → api.ours.com). The browser considers subdomains as "same site".
//
// 2. CSRF tokens require server-side state and add complexity that
//    can introduce new bugs.
//
// 3. Origin/Referer validation is stateless and kills the attack:
//    - Browsers ALWAYS send Origin on POST/PATCH/DELETE requests
//    - An attacker on sub.ours.com sending a form POST will have
//      Origin: https://sub.ours.com which does NOT match our allowlist
//    - This cannot be spoofed by JavaScript or HTML forms
//
// 4. We also reject requests with Content-Type other than
//    application/json for mutating methods. HTML <form> elements
//    can only send application/x-www-form-urlencoded or
//    multipart/form-data. By requiring JSON, invisible form
//    submissions are impossible.
// ────────────────────────────────────────────────────────────────
const csrfProtect = (req, res, next) => {
  // Only validate mutating methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // ── Check 1: Content-Type must be application/json ──
  // HTML forms cannot send application/json without JavaScript.
  // If an XSS payload has JavaScript execution, it's limited by CSP.
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('application/json')) {
    return errorResponse(res, 403, 'Invalid content type');
  }

  // ── Check 2: Origin or Referer must match allowed origins ──
  const origin  = req.headers['origin'];
  const referer = req.headers['referer'];

  const allowedOrigins = [process.env.CLIENT_URL].filter(Boolean);
  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:8080');
  }

  let requestOrigin = origin;
  if (!requestOrigin && referer) {
    try {
      requestOrigin = new URL(referer).origin;
    } catch (e) {
      return errorResponse(res, 403, 'Forbidden');
    }
  }

  // Allow requests with no Origin (e.g., same-origin navigation,
  // server-to-server). Browsers ALWAYS send Origin on cross-origin
  // requests, so a missing Origin means same-origin (safe).
  if (!requestOrigin) {
    return next();
  }

  if (!allowedOrigins.includes(requestOrigin)) {
    return errorResponse(res, 403, 'Forbidden');
  }

  next();
};

module.exports = { protect, csrfProtect };
