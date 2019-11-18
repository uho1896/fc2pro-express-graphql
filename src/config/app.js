module.exports = {
  port: 3000,
  mailHost: 'smtp.office365.com',
  mailPort: 587,
  mailUser: process.env.smtpMailUser,
  mailPassword: process.env.smtpMailPassword,
  jwtSecret: process.env.jwtSecret,
  dbUser: process.env.dbUser,
  dbPassword: process.env.dbPassword,
  dbHost: process.env.dbHost,
  dbPort: process.env.dbPort,
  activateBaseUri: 'http://localhost/user/activate',
  resetBaseUri: 'http://localhost/user/resetPwd',
};
