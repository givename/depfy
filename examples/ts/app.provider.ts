import * as depfy from "../../src";

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
