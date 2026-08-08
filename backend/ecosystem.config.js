/**
 * PM2 Production Cluster Mode Process Management Configuration
 * Spreads incoming ad traffic across all available CPU cores on your server.
 */

module.exports = {
  apps: [
    {
      name: 'expokerala-backend',
      script: 'dist/server.js',
      instances: 'max', // Spawns 1 worker process per logical CPU core (e.g. 12 workers)
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
  ],
};
