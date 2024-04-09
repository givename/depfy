const depfy = require('../../src')

const DatabaseProvider = require('./database.provider')

module.exports = depfy.injectable({
  name: "User service",
  dependencies: {
    database: DatabaseProvider,
  },
  async factory({ dependencies }) {
    // if (!dependencies.database) {
    //   throw new Error("dependencies.database is not implemented");
    // }

    return {
      /**
       * @returns {Promise<User[]>}
       */
      async findAll() {
        throw new Error("dependencies.database is not implemented");
      },
      /**
       * @param {Omit<User, 'id'>} payload 
       * @returns {Promise<User>}
       */
      async insert(payload) {
        throw new Error("dependencies.database is not implemented");
      },
    };
  },
});