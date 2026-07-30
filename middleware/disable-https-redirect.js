/**
 * Middleware to disable HTTPS redirects for specific routes
 * This is necessary for ESP32 devices that cannot handle SSL connections
 */

module.exports = function disableHttpsRedirect(req, res, next) {
  // Check if the request is for the ESP32 HTTP endpoint
  if (req.path === '/api/sensor/http') {
    // Set header to prevent Render.com from redirecting to HTTPS
    res.setHeader('X-Forwarded-Proto', 'https');
    console.log('HTTPS redirect disabled for ESP32 endpoint');
  }
  next();
};
