const appConfig = require('./app');

module.exports = {
  fc2pro: {
    db: 'fc2pro',
    uri: `mongodb://${appConfig.dbUser}:${appConfig.dbPassword}@${appConfig.dbHost}:${appConfig.dbPort}/fc2pro`,
    collection: {
      user: 'user',
    },
  },
};
