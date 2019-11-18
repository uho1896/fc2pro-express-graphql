const express = require('express');
const graphqlHTTP = require('express-graphql');
const cors = require('cors');
const config = require('./src/config/app');
const log = require('./src/lib/log');
const schema = require('./src/schema');
const resolver = require('./src/resolver');

const app = express();
app.use(cors());
app.get('/', (req, res) => res.send('Hello World!'));

// extract jwt
app.use((req, res, next) => {
  if (req.headers.authorization && /bearer/i.test(req.headers.authorization)) {
    const bearerToken = req.headers.authorization.split(' ');
    if (bearerToken.length >= 2) {
      req.token = bearerToken[1];
    }
  } else if (req.query && req.query.token) {
    req.token = req.query.token;
  }

  next();
});

app.use(
  '/q',
  graphqlHTTP({
    schema,
    rootValue: resolver,
    graphiql: true,
  }),
);

app.listen(config.port,
  () => log.info(`app listening on port ${config.port}!`));
