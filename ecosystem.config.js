module.exports = {
  apps : [
    {
      name: 'ekart',
      script: './dist/app.js',
      instances: "max",
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      ignore_watch : ["node_modules"],
      max_memory_restart: '1G',
      error_file: 'err.log',
      out_file: 'out.log',
      log_file: 'app.log',
      merge_logs: true,
    }
  ]
};
