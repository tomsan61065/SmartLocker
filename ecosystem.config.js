module.exports = {
  apps: [
    {
      name: 'Zero Locker',
      script: './src/api/index.js',
      watch: ['src', 'config', 'test'],
      ignore_watch: ['node_modules'],
      watch_options: {
        followSymlinks: false,
      },
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
