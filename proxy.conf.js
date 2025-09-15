const PROXY_CONFIG = {
  "/api-product": {
    "target": "https://esim-product.dev.global-sim.app",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/api-product": ""
    }
  },
  // Route tickets API to mock server
  "/api/v1/tickets": {
    "target": "http://localhost:3001",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  },
  // All other /api routes go to main server
  "/api": {
    "target": "https://esim-server.dev.global-sim.app",
    "secure": false,
    "changeOrigin": true
  },
  "/auth": {
    "target": "https://esim-server.dev.global-sim.app",
    "secure": false,
    "changeOrigin": true
  }
};

module.exports = PROXY_CONFIG;
