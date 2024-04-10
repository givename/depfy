# Install from npm
```bash
npm i depfy
```
```bash
yarn add depfy
```


# Minimalistic dependency injection mechanism

- Very easy to use
- Perfect for `VanillaJS`
- All providers are asynchronous
- Full type system support in `TypeScript` (for convenience in `IDE`)
- Ability to replace providers (mocks)

## Example for TypeScript

```ts
/// types.ts
export type User = {
  id: number;
  email: string;
  username: string;
};
```

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
/// user.interface-service.ts
import * as depfy from "depfy";

import { User } from "./types";

export default depfy.replaceable<{
  findAll(): Promise<User[]>;
  insert(payload: Omit<User, "id">): Promise<User>;
}>();
```

```ts
/// user.mock-service.ts
import * as depfy from "depfy";

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
```

```ts
/// user.service.ts
import * as depfy from "depfy";

import UserInterfaceServiceProvider from "./user.interface-service";

import DatabaseProvider from "./database.provider";
import { User } from "./types";

export default depfy.injectable({
  name: "User service",
  replaceable: UserInterfaceServiceProvider,
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
```

```ts
/// app.provider.ts
import * as depfy from "depfy";

import UserServiceProvider from "./user.service";

export default depfy.injectable({
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
```

```ts
import * as depfy from "depfy";

import AppProvider from "./app.provider";
import UserMockServiceProvider from "./user.mock-service";

type AppContext = depfy.InferResolver<typeof AppProvider>;

async function bootstrap_prod() {
  const appContex: AppContext = await depfy.resolver({
    dependency: AppProvider,
  });

  return appContex;
}

async function bootstrap_dev() {
  const appContex: AppContext = await depfy.resolver({
    dependency: AppProvider,
    replacements: [UserMockServiceProvider],
  });

  return appContex;
}

async function bootstrap() {
  const isDev = process.env.NODE_ENV === "development";
  const appContext = await (isDev ? bootstrap_dev : bootstrap_prod)();

  const { root: app } = appContext;

  {
    await app.userService.insert({
      email: "1@1.ru",
      username: "1",
    });

    const users = await app.userService.findAll();

    console.log(users);
  }
}

bootstrap();
```

## Example for JavaScript

```js
/// types.js
/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} email
 * @property {string} username
 */
```

```js
/// config.provider.js
const depfy = require("depfy");

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
```

```js
/// database.provider.js
const depfy = require("depfy");

const ConfigProvider = require("./config.provider");

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
```

```js
/// user.service.js
const depfy = require("depfy");

const DatabaseProvider = require("./database.provider");

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
```

```js
/// user.mock-service.js
const depfy = require("depfy");

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
        users.push(user);
        return user;
      },
    };
  },
});
```

```js
/// app.provider.js
const depfy = require("depfy");

const UserServiceProvider = require("./user.service");

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
```

```js
/// main.js
const depfy = require("depfy");

const AppProvider = require("./app.provider");
const UserMockServiceProvider = require("./user.mock-service");

async function bootstrap_prod() {
  const appContex = await depfy.resolver({
    dependency: AppProvider,
  });

  return appContex;
}

async function bootstrap_dev() {
  const appContex = await depfy.resolver({
    dependency: AppProvider,
    replacements: [UserMockServiceProvider],
  });

  return appContex;
}

async function bootstrap() {
  const isDev = process.env.NODE_ENV === "development";
  const appContext = await (isDev ? bootstrap_dev : bootstrap_prod)();

  const { root: app } = appContext;

  {
    await app.userService.insert({
      email: "1@1.ru",
      username: "1",
    });

    const users = await app.userService.findAll();

    console.log(users);
  }
}

bootstrap();
```
