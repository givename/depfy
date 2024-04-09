import { DI_INJECTED, DI_OPTIONS, DI_REPLACEMENT } from "./constants";
export type InjectedDescriptor<T = any, O = any> = {
    name: string;
    token: string;
    clone(props: {
        options?: O;
        name?: string;
    }): InjectedDescriptor<T, O>;
    [DI_OPTIONS]: O;
    [DI_INJECTED]: T /** metafield */;
};
export type InferInjectedDependency<T extends InjectedDescriptor> = T extends InjectedDescriptor<infer T> ? T : never;
export type InferInjectedDependencies<T extends Record<string, InjectedDescriptor>> = {
    [K in keyof T]: T[K][typeof DI_INJECTED];
};
export type InjectedMemoryFactoryItem = {
    name: string;
    options: any;
    dependencies: Record<string, InjectedDescriptor>;
    factory: (props: {
        token: string;
        name: string;
        dependencies: Record<string, any>;
        options: any;
    }) => Promise<any>;
};
export type ReplacementInjectedDescriptor<T = any, O = any> = {
    injected: InjectedDescriptor<T, O>;
    [DI_REPLACEMENT]: InjectedDescriptor<T, O>;
};
export type ErrorInjectedInfo = {
    name: string;
    token: string;
};
