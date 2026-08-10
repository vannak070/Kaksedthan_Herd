module.exports = {
  apps: [
    {
      name: 'kaksedthan-web',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: '/var/www/kaksedthan',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
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
        API_PORT: 5001
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
