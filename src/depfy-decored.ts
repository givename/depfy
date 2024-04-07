import * as depfy from "./depfy";
import { DI_MEMORY } from "./memory";
import {
  DepfyCatchedError,
  DepfyError,
  DepfyMemoryCleanedError,
} from "./exceptions";

const depfyExtendCleaner = () => {
  DI_MEMORY.IS_CLEANDED = true;
  DI_MEMORY.FACTORIES.clear();
  DI_MEMORY.IMPLEMENTED.clear();

  (DI_MEMORY.FACTORIES as any) = null;
  (DI_MEMORY.IMPLEMENTED as any) = null;
};

const assertMemoryAllowed = () => {
  if (DI_MEMORY.IS_CLEANDED) {
    throw new DepfyMemoryCleanedError();
  }
};

const errorWrapper = (error: unknown) => {
  if (error instanceof DepfyError) {
    return error;
  }
  if (error instanceof Error) {
    return new DepfyCatchedError(error, error.message);
  }
  return new DepfyError(`unknown error: ${error}`);
};

const decoratorDepfyErrorHandler = <F extends (...args: any[]) => any>(
  f: F
) => {
  return ((...args: any[]) => {
    assertMemoryAllowed();

    try {
      const maybeValue = f(...args);
      if (!(maybeValue instanceof Promise)) {
        return maybeValue;
      }

      return maybeValue.catch((error) => {
        throw errorWrapper(error);
      });
    } catch (error) {
      throw errorWrapper(error);
    }
  }) as any as F;
};

export const injectable = decoratorDepfyErrorHandler(depfy.injectable);
export const replaceable = decoratorDepfyErrorHandler(depfy.replaceable);
export const replacement = decoratorDepfyErrorHandler(depfy.replacement);
export const resolver = decoratorDepfyErrorHandler(depfy.resolver);
export const cleaner = decoratorDepfyErrorHandler(depfyExtendCleaner);
