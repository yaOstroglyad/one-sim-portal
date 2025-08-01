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
    "changeOrigin": true
  },
  "/auth": {
    "target": "https://esim-server.dev.global-sim.app",
    "secure": false,
    "changeOrigin": true
  }
};

module.exports = PROXY_CONFIG;