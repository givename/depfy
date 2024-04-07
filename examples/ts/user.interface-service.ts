import * as depfy from  "../../src";

import { User } from "./types";

export default depfy.replaceable<{
  findAll(): Promise<User[]>;
  insert(payload: Omit<User, "id">): Promise<User>;
}>();
