import { ErrorInjectedInfo } from "./types";

export class DepfyError extends Error {}

export class DepfyMemoryCleanedError extends DepfyError {}

export class DepfyReplacebleNotImplementedError extends DepfyError {
  constructor(public injected: ErrorInjectedInfo) {
    super(
      `replaceable not implemented for ${injected.name}::${injected.token}`
    );
  }
}

export class DepfyReplacementDuplicateError extends DepfyError {
  constructor(
    public injected: ErrorInjectedInfo,
    public first: ErrorInjectedInfo,
    public second: ErrorInjectedInfo
  ) {
    super(
      `replacement ${injected.name}::${injected.token} duplicate for ${first.name}::${first.token} and ${second.name}::${second.token}`
    );
  }
}

export class DepfyCycleDependencyError extends DepfyError {
  constructor(public cyclePath: [string, string][], message: string) {
    super(message);
  }
}

export class DepfyCatchedError extends DepfyError {
  constructor(public error: Error, message: string) {
    super(message);
  }
}
