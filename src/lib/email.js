const nodemailer = require('nodemailer');
const log = require('./log');
const appConfig = require('../config/app');

const transporter = nodemailer.createTransport({
  host: appConfig.mailHost,
  port: appConfig.mailPort,
  auth: {
    user: appConfig.mailUser,
    pass: appConfig.mailPassword,
  },
});

/**
 *
 * @param {String} to
 * @param {String} subject
 * @param {String} message
 * @return {Promise}
 */
function send({to, subject, message}) {
  to = Array.isArray(to) ? to.join(',') : to;
  return transporter.sendMail({
    from: `"fc2pro" ${appConfig.mailUser}`,
    to,
    subject: subject || 'from fc2pro',
    text: message,
  }).catch((e) => {
    log.error(`failed to send mail with ${e}`);
    return Promise.reject(e);
  });
}

/**
 *
 * @param {String} to
 * @param {String} subject
 * @param {String} message
 * @return {Promise}
 */
function sendHtml({to, subject, message}) {
  to = Array.isArray(to) ? to.join(',') : to;
  return transporter.sendMail({
    from: `"fc2pro" ${appConfig.mailUser}`,
    to,
    subject: subject || 'from fc2pro',
    html: message,
    text: message,
  }).catch((e) => {
    log.error(`failed to send mail with ${e}`);
    return Promise.reject(e);
  });
}

module.exports = {
  send,
  sendHtml,
};
