const {buildSchema} = require('graphql');
const user = require('../components/user');

module.exports = buildSchema(`${user.schema}`);
