const depfy = require('../../src')

const UserServiceProvider = require('./user.service')

module.exports = depfy.injectable({
  name: "App",
  dependencies: {
    userService: UserServiceProvider,
  },
  factory({ dependencies }) {
    return {
      userService: dependencies.userService,
    };
  },
});
