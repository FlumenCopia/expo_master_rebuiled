import dotenv from 'dotenv';
import app from './app';
import { ensureDefaultAdminUser } from './lib/seed-admin';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Initialize Super Admin Seeder on Server Boot
ensureDefaultAdminUser();

// Start Express Server
app.listen(PORT, () => {
  console.log(`⚡ [Express API Backend] Modular & Security Hardened Server Running on http://localhost:${PORT}`);
});
