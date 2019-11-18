const jwt = require('jsonwebtoken');
const db = require('./user');
const appConfig = require('../../../config/app');

/**
 * @param {Object} user
 * @return {String}
 */
function sign(user) {
  return jwt.sign({userId: user._id}, appConfig.jwtSecret);
}

/**
 * @param {String} token
 * @return {Object}
 */
async function verify(token) {
  if (!token) {
    throw new Error('user not login');
  }

  const authObj = jwt.verify(token, appConfig.jwtSecret);
  if (!authObj || !authObj.userId) {
    throw new Error('invalid token');
  }

  const user = await db.findOne({
    filter: {_id: authObj.userId},
  });
  if (!user) {
    throw new Error('user not found');
  } else if (Number(user.status) != 1) {
    throw new Error('user not activated');
  }

  return user;
}

const permissionMap = {
  'admin': 100,
  'owner': 1000,
  'root': 10000,
};

/**
 *
 * @param {Int} role
 * @param {String} permission
 * @return {Boolean}
 */
function authorize(role, permission = 'admin') {
  permission = String(permission).toLocaleLowerCase();
  const permValue = permissionMap[permission] ? permissionMap[permission] : 0;
  return (Number(role) >= permValue);
}

module.exports = {
  sign,
  verify,
  authorize,
};
