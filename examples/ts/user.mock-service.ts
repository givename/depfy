import * as depfy from  "../../src";

import UserInterfaceServiceProvider from "./user.interface-service";

import { User } from "./types";

export default depfy.replacement({
  name: "Mock [User service]",
  replaceable: UserInterfaceServiceProvider,
  async factory() {
    return new (class {
      private users: User[] = [];
      private idCounter = 0;

      public async findAll() {
        return this.users;
      }

      public async insert(payload: Omit<User, "id">) {
        const id = this.idCounter++;
        const user: User = {
          id,
          ...payload,
        };

        this.users.push(user);
        return user;
      }
    })();
  },
});
