# Minimalistic dependency injection mechanism

- Very easy to use
- Perfect for `VanillaJS`
- All providers are asynchronous
- Full type system support in `TypeScript` (for convenience in `IDE`)
- Ability to replace providers (mocks)

## Example for TypeScript

```ts
/// config.provider.ts
import * as depfy from "depfy";

export default depfy.injectable({
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
```

```ts
/// database.provider.ts
import * as depfy from "depfy";

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
```

```ts
import * as depfy from "depfy";

export type User = {
  id: number;
  email: string;
  username: string;
};

export default depfy.replaceable<{
  findAll(): Promise<User[]>;
  insert(payload: Omit<User, "id">): Promise<User>;
}>();
```

```ts
/// user.mock-service.ts
import * as depfy from "depfy";

import InterfaceUserServiceProvider, { User } from "./user.interface-service";

export default depfy.replacement({
  name: "Mock [User service]",
  injected: InterfaceUserServiceProvider,
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
```
