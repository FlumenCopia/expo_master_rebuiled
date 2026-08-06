import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { ensureDefaultAdminUser } from './lib/seed-admin';

const PORT = process.env.PORT || 5000;

// Initialize Super Admin Seeder on Server Boot
ensureDefaultAdminUser();

// Start Express Server
app.listen(PORT, () => {
  console.log(`⚡ [Express API Backend] Server running on port ${PORT}`);
});
