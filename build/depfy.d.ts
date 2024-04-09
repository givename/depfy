import { DI_REPLACEMENT } from "./constants";
import { InferInjectedDependencies, InjectedDescriptor, ReplacementInjectedDescriptor, InferInjectedDependency } from "./types";
export declare function injectable<_O = undefined, _D extends Record<string, InjectedDescriptor<any>> = {}, _T = InferInjectedDependencies<_D>>(props: {
    name?: string;
    options?: _O;
    dependencies?: _D;
    replaceable?: InjectedDescriptor<_T, _O>;
    factory?: (props: {
        token: string;
        name: string;
        options: _O;
        dependencies: InferInjectedDependencies<_D>;
    }) => _T | Promise<_T>;
}): InjectedDescriptor<_T, _O>;
type _ReplacementItem = {
    injected: InjectedDescriptor;
    [DI_REPLACEMENT]: InjectedDescriptor;
};
export declare function resolver<_T>(props: {
    dependency: InjectedDescriptor<_T>;
    replacements?: _ReplacementItem[];
}): Promise<{
    root: Awaited<_T>;
    find<T extends InjectedDescriptor>(injected: T): InferInjectedDependency<T> | undefined;
    debug: {
        order: string[];
    };
}>;
type _InferInjectorTypes<T extends InjectedDescriptor, D extends Record<string, InjectedDescriptor<any>> = {}> = T extends InjectedDescriptor<infer T, infer O> ? {
    factory: Parameters<typeof injectable<O, D, T>>[0]["factory"];
    options: O;
} : never;
export declare function replacement<_I extends InjectedDescriptor, _D extends Record<string, InjectedDescriptor<any>> = {}, _InjectorTypes extends _InferInjectorTypes<_I, _D> = _InferInjectorTypes<_I, _D>>(props: {
    replaceable: _I;
    factory: _InjectorTypes["factory"];
    name?: string;
    dependencies?: _D;
}): ReplacementInjectedDescriptor<_I, _InjectorTypes["options"]>;
export declare function replaceable<T, O = undefined>(...args: O extends undefined ? [props?: {
    name?: string;
}] : [props: {
    name?: string;
} & {
    options: O;
}]): InjectedDescriptor<T, O>;
export {};
