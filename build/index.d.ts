import { resolver } from "./depfy-decored";
import { InjectedDescriptor } from "./types";
export { injectable, replaceable, replacement, resolver, cleaner, } from "./depfy-decored";
export { DepfyError, DepfyMemoryCleanedError, DepfyReplacebleNotImplementedError, DepfyCycleDependencyError, DepfyReplacementDuplicateError, DepfyCatchedError, DepfyAlreadyImplementedError, } from "./exceptions";
export { InjectedDescriptor, ReplacementInjectedDescriptor, InferInjectedDependency, InferInjectedDependencies, } from "./types";
export type InferResolver<T extends InjectedDescriptor> = T extends InjectedDescriptor<infer I> ? Awaited<ReturnType<typeof resolver<I>>> : never;
