const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

module.exports = {
  apps: [
    {
      name: 'livestock-frontend-ui',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: '/root/LiveStock',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DB_HOST: '127.0.0.1',
        DB_PORT: '5432',
        DB_USER: 'postgres',
        DB_PASSWORD: 'postgres123',
        DB_NAME: 'livestock_db',
        DB_SSL: 'false'
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '350M',
    },
    {
      name: 'livestock-backend-api',
      script: 'node_modules/.bin/tsx',
      args: 'src/server/index.ts',
      cwd: '/root/LiveStock',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        API_PORT: 3002,
        DB_HOST: '127.0.0.1',
        DB_PORT: '5432',
        DB_USER: 'postgres',
        DB_PASSWORD: 'postgres123',
        DB_NAME: 'livestock_db',
        DB_SSL: 'false'
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
    }
  ]
};
