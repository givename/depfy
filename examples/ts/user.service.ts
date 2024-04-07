import * as depfy from  "../../src";

import UserInterfaceServiceProvider from "./user.interface-service";

import DatabaseProvider from "./database.provider";
import { User } from "./types";

export default depfy.injectable({
  name: "User service",
  implemented: UserInterfaceServiceProvider,
  dependencies: {
    database: DatabaseProvider,
  },
  async factory({ dependencies }) {
    // if (!dependencies.database) {
    //   throw new Error("dependencies.database is not implemented");
    // }

    return {
      async findAll(): Promise<User[]> {
        throw new Error("dependencies.database is not implemented");
      },
      async insert(payload: Omit<User, "id">): Promise<User> {
        throw new Error("dependencies.database is not implemented");
      },
    };
  },
});
