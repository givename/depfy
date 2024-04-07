import * as depfy from  "../../src";

import ConfigProvider from "./config.provider";

export default depfy.injectable({
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
