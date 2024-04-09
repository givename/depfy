const depfy = require('../../src')

module.exports = depfy.injectable({
  name: "Main config",
  async factory() {
    return {
      db_host: process.env["DB_HOST"],
      db_port: process.env["DB_PORT"],
      db_username: process.env["DB_USERNAME"],
      db_password: process.env["DB_PASSWORD"],
      db_database: process.env["DB_DATABASE"],
    };
  },
});