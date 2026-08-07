import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { ensureDefaultAdminUser } from './lib/seed-admin';
import { SchedulerService } from './services/scheduler.service';

const PORT = process.env.PORT || 5000;

// Global Error Resilience Handlers (Prevent Server Crash on Transient DB Drops)
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ [Server Warning] Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('🚨 [Server Error] Uncaught Exception:', err);
});

// Initialize Super Admin Seeder on Server Boot
ensureDefaultAdminUser();

// Initialize Scheduled Email Campaign Engine
SchedulerService.initScheduler();

// Start Express Server
const server = app.listen(PORT, () => {
  console.log(`⚡ [Express API Backend] Server running on port ${PORT}`);
});

// Graceful Port Cleanup on ts-node-dev Reload / Process Exit
const gracefulShutdown = () => {
  server.close(() => {
    console.log('🔌 Server port 5000 released.');
    process.exit(0);
  });
};

process.once('SIGTERM', gracefulShutdown);
process.once('SIGINT', gracefulShutdown);
process.once('SIGUSR2', gracefulShutdown);
