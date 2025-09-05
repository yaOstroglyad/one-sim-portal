interface ServerConfig {
  port: number;
  defaultDelay: number;
  banner: {
    getStartupBanner(port: number): string;
  };
}

export const config: ServerConfig = {
  port: process.env.MOCK_PORT ? parseInt(process.env.MOCK_PORT) : 3001,
  defaultDelay: 100,
  banner: {
    getStartupBanner(port: number): string {
      return `
╔═══════════════════════════════════════════════════════╗
║                  Mock Server Started                   ║
╠═══════════════════════════════════════════════════════╣
║  Port: ${port}                                            ║
║  Base URL: http://localhost:${port}                      ║
║                                                        ║
║  Available endpoints:                                  ║
║  Users:                                              ║
║  - GET  /api/v1/users/query/all                      ║
║  - POST /api/v1/users/command/create                 ║
║  - GET  /api/v1/users/query/verify-user              ║
║  Tickets:                                            ║
║  - GET  /api/v1/tickets                              ║
║  - POST /api/v1/tickets                              ║
║  - GET  /api/v1/tickets/{id}                         ║
║  - GET  /api/v1/tickets/recent                       ║
║  - GET  /api/v1/tickets/count                        ║
║                                                        ║
║  Query params:                                         ║
║  - ?mock_delay=500 (simulate delay in ms)            ║
║  - ?mock_error=500 (simulate HTTP error)             ║
╚═══════════════════════════════════════════════════════╝`;
    }
  }
};