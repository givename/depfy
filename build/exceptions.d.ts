import { ErrorInjectedInfo } from "./types";
export declare class DepfyError extends Error {
}
export declare class DepfyMemoryCleanedError extends DepfyError {
}
export declare class DepfyReplacebleNotImplementedError extends DepfyError {
    injected: ErrorInjectedInfo;
    constructor(injected: ErrorInjectedInfo);
}
export declare class DepfyReplacementDuplicateError extends DepfyError {
    injected: ErrorInjectedInfo;
    first: ErrorInjectedInfo;
    second: ErrorInjectedInfo;
    constructor(injected: ErrorInjectedInfo, first: ErrorInjectedInfo, second: ErrorInjectedInfo);
}
export declare class DepfyAlreadyImplementedError extends DepfyError {
    replaceable: ErrorInjectedInfo;
    implemented: ErrorInjectedInfo;
    constructor(replaceable: ErrorInjectedInfo, implemented: ErrorInjectedInfo);
}
export declare class DepfyCycleDependencyError extends DepfyError {
    cyclePath: [string, string][];
    constructor(cyclePath: [string, string][], message: string);
}
export declare class DepfyCatchedError extends DepfyError {
    error: Error;
    constructor(error: Error, message: string);
}
