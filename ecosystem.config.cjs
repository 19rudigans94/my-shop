/**
 * PM2 Ecosystem конфигурация для my-shop
 * Использование: pm2 start ecosystem.config.cjs
 */

module.exports = {
  apps: [
    {
      name: "my-shop",
      script: "npm",
      args: "start",
      cwd: "./",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_file: "./logs/pm2-combined.log",
      time: true,
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      restart_delay: 4000,
    },
  ],
};
