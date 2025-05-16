const os = require('os');

const CONFIG = {
    port: process.env.PORT || 4000,
    uploadDir: 'uploads',
    outputDir: 'output',
    maxFileSize: 10 * 1024 * 1024,
    batchSize: 4,
    maxWorkers: os.cpus().length - 2,
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 200
    },
    wsServer: process.env.wsServer,
    mongoURI: process.env.mongoURI
  };

console.log(CONFIG)

module.exports = CONFIG