import { InjectedMemoryFactoryItem } from "./types";

export const DI_MEMORY = {
  IS_CLEANDED: false,
  FACTORIES: new Map<string, InjectedMemoryFactoryItem>(),
};
