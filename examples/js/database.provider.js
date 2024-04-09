const depfy = require('../../src')

const ConfigProvider = require('./config.provider')

module.exports = depfy.injectable({
  name: "Database",
  dependencies: {
    config: ConfigProvider,
  },
  async factory({ dependencies }) {
    const { db_host, db_port, db_password, db_username, db_database } =
      dependencies.config;

    /// TODO: add orm database (maybe knex?)
    /// create instance connect database
    const connect = null;
    return connect;
  },
});