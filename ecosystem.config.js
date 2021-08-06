module.exports = {
    apps : [{
      name      : 'sleepymaid-ts',
      script    : 'yarn',
      args      : 'start',
      interpreter: '/bin/bash',
      env: {
        NODE_ENV: 'production'
      }
    }]
  };