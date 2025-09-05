import express, { Application } from 'express';
import cors from 'cors';

// Import configuration
import { config } from './config/server.config';

// Import controllers
import { UsersController } from './domains/users/users.controller';
import { TicketsController } from './domains/tickets/tickets.controller';
import { Controller } from './types';

// Import middleware
import {
  requestLoggingMiddleware,
  delayMiddleware,
  errorSimulationMiddleware,
  notFoundHandler
} from './middleware';

// Initialize Express app
const app: Application = express();

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom middleware
app.use(requestLoggingMiddleware);
app.use(delayMiddleware);

// Initialize and register controllers
const controllers: Controller[] = [
  new UsersController(),
  new TicketsController()
];

controllers.forEach(controller => {
  controller.registerRoutes(app);
});

// Error handling middleware
app.use(errorSimulationMiddleware);
app.use(notFoundHandler);

// Start server
app.listen(config.port, () => {
  console.log(config.banner.getStartupBanner(config.port));
});