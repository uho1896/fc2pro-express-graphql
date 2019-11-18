const mongoConfig = require('../../../config/mongo');
const mongo = require('../mongo');

const database = mongoConfig.fc2pro.db;
const collection = mongoConfig.fc2pro.collection.user;

const apis = {};
Object.keys(mongo).forEach((k) => {
  if (mongo.hasOwnProperty(k)) {
    apis[k] = (args) => {
      return mongo[k](Object.assign({database, collection}, args));
    };
  }
});

module.exports = {
  ...apis,
};
