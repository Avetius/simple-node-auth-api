module.exports = {
  apps: [{
    name: 'simple-node-auth-api',
    script: './server.js',
    source_map_support: true,
    error_file: './err.log',
    out_file: './out.log',
    restart_delay: 2000,
    max_memory_restart: '300M',
    kill_timeout: 3000,
    // exec_mode: 'cluster',
    // instances: '1',
    cron_restart: '0 0 * * *',
  }],
};
