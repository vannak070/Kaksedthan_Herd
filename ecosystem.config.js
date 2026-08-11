const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

module.exports = {
  apps: [
    {
      name: 'kaksedthan-web',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: '/var/www/kaksedthan',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DB_HOST: process.env.DB_HOST || 'localhost',
        DB_PORT: process.env.DB_PORT || '5432',
        DB_USER: process.env.DB_USER || 'herdbook_user',
        DB_PASSWORD: process.env.DB_PASSWORD || 'HerdbookSecure2025',
        DB_NAME: process.env.DB_NAME || 'kaksedthan_herdbook',
        DB_SSL: process.env.DB_SSL || 'false'
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '350M',
      error_file: '/var/log/kaksedthan/web-error.log',
      out_file: '/var/log/kaksedthan/web-out.log'
    },
    {
      name: 'kaksedthan-api',
      script: 'node_modules/.bin/tsx',
      args: 'src/server/index.ts',
      cwd: '/var/www/kaksedthan',
      env: {
        NODE_ENV: 'production',
        API_PORT: 5001,
        DB_HOST: process.env.DB_HOST || 'localhost',
        DB_PORT: process.env.DB_PORT || '5432',
        DB_USER: process.env.DB_USER || 'herdbook_user',
        DB_PASSWORD: process.env.DB_PASSWORD || 'HerdbookSecure2025',
        DB_NAME: process.env.DB_NAME || 'kaksedthan_herdbook',
        DB_SSL: process.env.DB_SSL || 'false'
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      error_file: '/var/log/kaksedthan/api-error.log',
      out_file: '/var/log/kaksedthan/api-out.log'
    }
  ]
};
