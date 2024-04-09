const depfy = require('../../src')

const AppProvider = require('./app.provider')
const UserMockServiceProvider = require('./user.mock-service')

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
