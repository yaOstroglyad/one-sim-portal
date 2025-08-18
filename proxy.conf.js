const fs = require('fs');
const path = require('path');

// Check if we're in mock mode
const isMockMode = process.env.MOCK_SERVER === 'true' || process.argv.includes('--mock');

// Load mock registry if in mock mode
let mockRegistry = { endpoints: [] };
if (isMockMode) {
  try {
    const registryPath = path.join(__dirname, 'mock-server', 'registry.json');
    if (fs.existsSync(registryPath)) {
      mockRegistry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      console.log('[PROXY] Mock mode enabled. Loaded registry with', mockRegistry.endpoints.length, 'endpoints');
    }
  } catch (error) {
    console.error('[PROXY] Failed to load mock registry:', error);
  }
}

// Helper function to check if endpoint should be mocked
function shouldMockEndpoint(url) {
  if (!isMockMode) return false;
  
  // Check if URL matches any mocked endpoint
  return mockRegistry.endpoints.some(endpoint => {
    // Simple path matching (can be enhanced with path-to-regexp)
    return url.startsWith(endpoint.path);
  });
}

const PROXY_CONFIG = {
  "/api-product": {
    "target": "https://esim-product.dev.global-sim.app",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/api-product": ""
    }
  },
  "/api": {
    "target": "https://esim-server.dev.global-sim.app",
    "secure": false,
    "changeOrigin": true,
    "router": function(req) {
      // Dynamic routing based on mock registry
      if (shouldMockEndpoint(req.url)) {
        console.log(`[PROXY] Routing to mock server: ${req.method} ${req.url}`);
        return 'http://localhost:3001';
      }
      // Default to real API
      return 'https://esim-server.dev.global-sim.app';
    },
    "logLevel": isMockMode ? "debug" : "info"
  },
  "/auth": {
    "target": "https://esim-server.dev.global-sim.app",
    "secure": false,
    "changeOrigin": true
  }
};

// Log configuration on startup
if (isMockMode) {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║               MOCK MODE ENABLED                        ║
╠═══════════════════════════════════════════════════════╣
║  Mocked endpoints will be routed to:                  ║
║  http://localhost:3001                                ║
║                                                        ║
║  Non-mocked endpoints will use real API:              ║
║  https://esim-server.dev.global-sim.app               ║
╚═══════════════════════════════════════════════════════╝
  `);
}

module.exports = PROXY_CONFIG;