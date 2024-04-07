import * as depfy from "../../src";

import AppProvider from "./app.provider";
import UserMockServiceProvider from "./user.mock-service";

async function bootstrap() {
  const replacements: depfy.ReplacementInjectedDescriptor[] = [
    UserMockServiceProvider,
  ];

  const appContex = await depfy.resolver({
    dependency: AppProvider,
    replacements,
  });

  const app = appContex.root;

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
