module.exports = {
  port: process.env.fc2proPort || 3000,
  mailHost: process.env.fc2proMailHost || 'smtp.office365.com',
  mailPort: process.env.fc2proMailPort || 587,
  mailUser: process.env.smtpMailUser,
  mailPassword: process.env.smtpMailPassword,
  jwtSecret: process.env.jwtSecret,
  dbUser: process.env.dbUser,
  dbPassword: process.env.dbPassword,
  dbHost: process.env.dbHost,
  dbPort: process.env.dbPort,
  activateBaseUri: process.env.fc2proActiveUri || 'http://localhost/user/activate',
  resetBaseUri: process.env.fc2proResetUri || 'http://localhost/user/resetPwd',
};
