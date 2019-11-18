const {MongoClient, ObjectId} = require('mongodb');
const mongoConfig = require('../../../config/mongo');

const connected = new Map();

/**
 * @param {Object} {database}
 * @return {Promise}
 */
function connect({database}) {
  if (!mongoConfig[database]) {
    return Promise.reject(new Error('unknow db'));
  }

  const cfg = mongoConfig[database];
  if (!connected.get(cfg.db)) {
    const c = new MongoClient(cfg.uri, {useUnifiedTopology: true});
    const p = new Promise((resolve, reject) => {
      c.connect((e) => {
        if (e) {
          return reject(new Error(`failed to connect to ${cfg.db} with ${e}`));
        }

        const db = c.db(cfg.db);
        return resolve(db);
      });
    });

    connected.set(cfg.db, {c, p});
  }

  return connected.get(cfg.db).p;
}

/**
 * @param {Object} {database}
 */
function close({database}) {
  const conn = connected.get(database);
  conn && conn.c.close();
  connected.set(database, null);
}

/**
 */
function closeAll() {
  [...connected.keys()].forEach((k) => close({database: k}));
}

/**
 * @param {Object} {database, collection, data}
 * @return {Promise}
 */
function insertMany({database, collection, data}) {
  return connect({database}).then((db) => {
    const coll = db.collection(collection);
    return coll.insertMany(data);
  });
}

/**
 * @param {Object} {database, collections, data}
 * @return {Promise}
 */
function insertOne({database, collection, data}) {
  return connect({database}).then((db) => {
    const coll = db.collection(collection);
    return coll.insertOne(data);
  });
}

/**
 * @param {Object} {database, collections, filter, data}
 * @return {Promise}
 */
function updateOne({database, collection, filter = {}, data = {}}) {
  return connect({database}).then((db) => {
    const coll = db.collection(collection);
    if (filter._id) {
      filter._id = new ObjectId(filter._id);
    }
    return coll.updateOne(filter, {$set: data}, {upsert: true});
  });
}

/**
 * @param {Object} {database, collection, filter, opts}
 * @return {Promise}
 */
function find({database, collection, filter = {}, opts = {}}) {
  if (filter._id) {
    filter._id = new ObjectId(filter._id);
  }

  return connect({database}).then((db) => {
    const coll = db.collection(collection);
    let cursor = coll.find(filter);
    // count
    if (opts.count) {
      return cursor.count();
    }

    // skip
    if (Number(opts.skip) && opts.skip > 0) {
      cursor = cursor.skip(opts.skip);
    }

    // sort
    if (Array.isArray(opts.sort)) {
      const asc = opts.sort.filter((s) => {
        const keys = Object.keys(s);
        if (Array.isArray(keys) && keys.length > 0 && s[keys[0]] == 1) {
          return true;
        } else {
          return false;
        }
      }).map((s) => Object.keys(s)[0]);
      const desc = opts.sort.filter((s) => {
        const keys = Object.keys(s);
        if (Array.isArray(keys) && keys.length > 0 && s[keys[0]] == -1) {
          return true;
        } else {
          return false;
        }
      }).map((s) => Object.keys(s)[0]);

      if (asc.length > 0) {
        cursor.sort(asc, 1);
      }

      if (desc.length > 0) {
        cursor.sort(desc, -1);
      }
    }

    // limit
    if (Number(opts.limit) && opts.limit > 0) {
      cursor = cursor.limit(opts.limit);
    }

    return cursor.toArray();
  });
}

/**
 * @param {Object} {database, collection, filter, opts}
 * @return {Promise}
 */
function findOne({database, collection, filter = {}, opts = {}}) {
  if (filter._id) {
    filter._id = new ObjectId(filter._id);
  }
  return connect({database}).then((db) => {
    const coll = db.collection(collection);
    return coll.findOne(filter, opts);
  });
}

module.exports = {
  connect,
  close,
  closeAll,
  insertMany,
  insertOne,
  updateOne,
  find,
  findOne,
};
