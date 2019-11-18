const db = require('../lib/db/fc2pro/user');
const auth = require('../lib/db/fc2pro/auth');
const appConfig = require('../config/app');
const mail = require('../lib/email');
const utils = require('../lib/utils');

/**
 * User
 */
class User {
  /**
   * @param {Object} {_id, email, name, role, status}
   */
  constructor({_id, email, name, role, status}) {
    this._id = _id;
    this.email = email;
    this.name = name;
    this.role = role;
    this.status = status;
  }
}

const schema = `
  type User {
    _id: ID!
    email: String!
    name: String
    role: Int
    status: Int
  }

  type Query {
    getUsers: [User]
    getUser(_id: ID!): User
    getUserByEmail(email: String!): User
  }

  type Mutation {
    createUser(email: String!, password: String!, name: String): String
    login(email: String!, password: String!): String
    updateUser(_id: ID!, email: String, name: String, role: Int, status: Int): String
    activateUser(activate: String!): String
    forgetPwd(email: String!): String
    resetPwd(reset: String!, password: String!): String
  }
`;

const resolver = {
  createUser: async ({email, password, name}) => {
    if (!/\S+@\S+\.\S+/.test(email)) {
      throw new Error(`invalid email - ${email}`);
    }

    const user = await db.findOne({
      filter: {email},
    });
    if (user) {
      throw new Error(`${email} is registered, you can use it to login or reset password`);
    }

    const token = utils.randomToken();
    const uri = `${appConfig.activateBaseUri}?activate=${utils.encodeObject({email, token})}`;
    await mail.sendHtml({
      to: email,
      subject: 'Account Activate',
      message: `<html><body><p>click or copy to browser to activate account:</p><p>${uri}</p></body></html>`,
    });
    await db.insertOne({
      data: {email, password: utils.cryptString(password), name, token},
    });
    return `activate link has sent to ${email}`;
  },
  updateUser: async ({_id, email, name, role, status}, request) => {
    const authUser = await auth.verify(request.token);
    if (!auth.authorize(authUser.role) && authUser._id != _id) {
      throw new Error('no access');
    }

    const data = {};
    email && (data.email = email);
    name && (data.name = name);
    if (auth.authorize(authUser.role)) {
      role && (data.role = role);
      status && (data.status = status);
    }
    await db.updateOne({
      filter: {_id},
      data,
    });
    return 'success to update';
  },
  activateUser: async ({activate}) => {
    const actObj = utils.decodeString(activate);
    const user = await db.findOne({
      filter: {email: actObj.email},
    });
    if (!user || user.token != actObj.token) {
      throw new Error(`invalid activate - ${activate}`);
    }

    await db.updateOne({
      filter: {_id: user._id},
      data: {status: 1, token: null},
    });
    return 'success to activate';
  },
  getUsers: async (args, request) => {
    const authUser = await auth.verify(request.token);
    if (!auth.authorize(authUser.role)) {
      throw new Error('no access');
    }

    const users = await db.find();
    return users.map((u) => new User({...u}));
  },
  getUser: async ({_id}, request) => {
    const authUser = await auth.verify(request.token);
    if (authUser._id == _id) {
      return new User({...authUser});
    } else if (!auth.authorize(authUser.role)) {
      throw new Error('no access');
    }

    const user = await db.findOne({
      filter: {_id},
    });
    if (!user) {
      throw new Error(`invalid ID - ${_id}`);
    }

    return new User({...user});
  },
  getUserByEmail: async ({email}, request) => {
    const authUser = await auth.verify(request.token);
    if ( authUser.email == email) {
      return new User({...authUser});
    } else if (!auth.authorize(authUser.role)) {
      throw new Error('no access');
    }

    const user = await db.findOne({
      filter: {email},
    });
    if (!user) {
      throw new Error(`${email} not registered`);
    }

    return new User({...user});
  },
  login: async ({email, password}) => {
    const user = await db.findOne({
      filter: {email},
    });
    if (!user) {
      throw new Error('account not registered');
    } else if (Number(user.status) != 1) {
      throw new Error('account not activated');
    } else if (user.password != utils.cryptString(password)) {
      throw new Error('wrong password');
    }

    return auth.sign(user);
  },
  forgetPwd: async ({email}) => {
    const user = await db.findOne({
      filter: {email},
    });
    if (!user) {
      throw new Error(`${email} not registered`);
    } else if (Number(user.status) != 1) {
      throw new Error('account not activated');
    }

    const resetToken = utils.randomToken();
    const uri = `${appConfig.resetBaseUri}?reset=${utils.encodeObject({email, resetToken})}`;
    await mail.sendHtml({
      to: email,
      subject: 'Password Reset',
      message: `<html><body><p>click or copy to browser to reset password:</p><p>${uri}</p></body></html>`,
    });
    await db.updateOne({
      filter: {email},
      data: {resetToken},
    });
    return `reset link has sent to ${email}`;
  },
  resetPwd: async ({reset, password}) => {
    const resetObj = utils.decodeString(reset);
    const user = await db.findOne({
      filter: {email: resetObj.email},
    });
    if (!user || user.resetToken != resetObj.resetToken) {
      throw new Error(`invalid reset - ${reset}`);
    } else if (Number(user.status) != 1) {
      throw new Error('account not activated');
    }

    await db.updateOne({
      filter: {_id: user._id},
      data: {password: utils.cryptString(password), resetToken: null},
    });
    return 'succeess to reset password';
  },
};

module.exports = {
  schema,
  resolver,
};
