const moment = require('moment');
const crypto = require('crypto');

/**
 * @return {String}
 */
function today() {
  return moment().format('YYYYMMDD');
}

/**
 * @return {String}
 */
function yesterday() {
  return moment().subtract(1, 'days').format('YYYYMMDD');
}

/**
 * @param {Object} obj
 * @return {String}
 */
function encodeObject(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('hex');
}

/**
 *
 * @param {String} hex
 * @return {Object}
 */
function decodeString(hex) {
  return JSON.parse(Buffer.from(hex, 'hex').toString());
}

/**
 * @return {String}
 */
function randomToken() {
  const hash = crypto.createHash('sha256');
  return hash.update(String(Date.now() * Math.random())).digest('hex');
}

/**
 *
 * @param {String} str
 * @return {String}
 */
function cryptString(str) {
  const hash = crypto.createHash('sha256');
  return hash.update(String(str)).digest('hex');
}

module.exports = {
  today,
  yesterday,
  encodeObject,
  decodeString,
  randomToken,
  cryptString,
};
