module.exports = {
  apps: [
    {
      name: 'Chongluadao v2',
      exec_mode: 'cluster',
      instances: 'max', // Or a number of instances
      script: './dist/main.js',
      args: 'start'
    }
  ]
}
