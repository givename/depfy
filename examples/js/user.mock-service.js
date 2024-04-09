const depfy = require('../../src')

const UserServiceProvider = require("./user.service");

module.exports = depfy.replacement({
  name: "Mock [User service]",
  replaceable: UserServiceProvider,
  async factory() {
    /** @type { User[] } */
    const users = [];
    let idCounter = 0;

    return {
      async findAll() {
        return users;
      },
      insert(payload) {
        const id = idCounter++;
        const user = {
          id,
          ...payload,
        };
        users.push(user)
        return user;
      }
    }
  },
});
