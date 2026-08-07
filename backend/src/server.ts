import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { ensureDefaultAdminUser } from './lib/seed-admin';

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

// Start Express Server
app.listen(PORT, () => {
  console.log(`⚡ [Express API Backend] Server running on port ${PORT}`);
});
