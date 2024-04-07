import * as uuid from "uuid";
import * as dgraph from "dependency-graph";

import { DI_MEMORY } from "./memory";
import { DI_INJECTED, DI_OPTIONS, DI_REPLACEMENT } from "./constants";

import {
  DepfyAlreadyImplementedError,
  DepfyCycleDependencyError,
  DepfyReplacebleNotImplementedError,
  DepfyReplacementDuplicateError,
} from "./exceptions";

import {
  InjectedMemoryFactoryItem,
  InferInjectedDependencies,
  InjectedDescriptor,
  ReplacementInjectedDescriptor,
  InferInjectedDependency,
} from "./types";

const identity = <T>(props: { dependencies: T }) => props.dependencies;

export function injectable<
  _O = undefined,
  _D extends Record<string, InjectedDescriptor<any>> = {},
  _T = InferInjectedDependencies<_D>
>(props: {
  name?: string;
  options?: _O;
  dependencies?: _D;
  implemented?: InjectedDescriptor<_T, _O>;
  factory?: (props: {
    token: string;
    name: string;
    options: _O;
    dependencies: InferInjectedDependencies<_D>;
  }) => _T | Promise<_T>;
}): InjectedDescriptor<_T, _O> {
  const maybeImplementedToken = props.implemented?.token;
  const maybeImplementedName = props.implemented?.name;

  const token = maybeImplementedToken ?? uuid.v4();
  const {
    name = maybeImplementedName ?? token,
    dependencies = {},
    factory = identity,
    options,
  } = props;

  if (maybeImplementedToken) {
    if (DI_MEMORY.IMPLEMENTED.has(maybeImplementedToken)) {
      throw new DepfyAlreadyImplementedError(
        {
          token: maybeImplementedToken!,
          name: maybeImplementedName!,
        },
        { token, name }
      );
    }

    DI_MEMORY.IMPLEMENTED.add(maybeImplementedToken);
  }

  DI_MEMORY.FACTORIES.set(token, {
    name,
    options,
    dependencies,
    factory: factory as any,
  });

  return {
    name,
    token,
    clone(params) {
      return injectable({
        ...props,
        name: params.name ?? name,
        options: params.options ?? options,
      });
    },
    [DI_OPTIONS]: options as _O,
    [DI_INJECTED]: null as _T /** metafield */,
  };
}

type _ReplacementItem = {
  injected: InjectedDescriptor;
  [DI_REPLACEMENT]: InjectedDescriptor;
};

const assertReplacementsOnDuplicate = (replacements: _ReplacementItem[]) => {
  const injectables = new Map<string, InjectedDescriptor>();

  for (const { injected, [DI_REPLACEMENT]: replacement } of replacements) {
    const token = injected.token;
    if (injectables.has(token)) {
      const injectable = injectables.get(token)!;

      throw new DepfyReplacementDuplicateError(
        {
          name: injectable.name,
          token: injected.token,
        },
        {
          name: replacement.name,
          token: replacement.token,
        },
        {
          name: replacement.name,
          token: replacement.token,
        }
      );
    }

    injectables.set(token, replacement);
  }
};

export async function resolver<_T>(props: {
  dependency: InjectedDescriptor<_T>;
  replacements?: _ReplacementItem[];
}) {
  const { dependency, replacements = [] } = props;

  assertReplacementsOnDuplicate(replacements);

  let rootToken = dependency.token;

  const graph = new dgraph.DepGraph<InjectedMemoryFactoryItem>();
  const resolved = new Map<string, any>();
  const factories = new Map(DI_MEMORY.FACTORIES.entries());

  for (const { injected, [DI_REPLACEMENT]: replacement } of replacements) {
    factories.set(injected.token, factories.get(replacement.token)!);
  }

  for (const [root, data] of factories) {
    graph.addNode(root, data);
  }

  for (const [root, { dependencies }] of factories) {
    for (const { token } of Object.values(dependencies)) {
      graph.addDependency(root, token);
    }
  }

  let resolvedSeq = [] as string[];

  try {
    resolvedSeq = graph.dependenciesOf(rootToken);
    resolvedSeq.push(rootToken);
  } catch (error) {
    if (error instanceof dgraph.DepGraphCycleError) {
      const cyclePath: [string, string][] = error.cyclePath.map((token) => {
        const injected = factories.get(token);
        return [injected?.name ?? token, token];
      });
      throw new DepfyCycleDependencyError(cyclePath, error.message);
    }
  }

  for (const token of resolvedSeq) {
    const { factory, dependencies, options, name } = factories.get(token)!;
    const resolvedDependencies: Record<string, any> = {};

    for (const [name, { token }] of Object.entries(dependencies)) {
      resolvedDependencies[name] = resolved.get(token)!;
    }

    const instance = await factory({
      name,
      token,
      options,
      dependencies: resolvedDependencies,
    });

    resolved.set(token, instance);
  }

  const orderProviding = resolvedSeq.map((token) => {
    const { name } = factories.get(token)!;
    return `${name} :: ${token}`;
  });

  const root = await (resolved.get(dependency.token)! as Promise<_T>);

  return {
    root,
    find<T extends InjectedDescriptor>(injected: T) {
      const instance = resolved.get(injected.token) as
        | undefined
        | InferInjectedDependency<T>;
      return instance;
    },
    debug: {
      order: orderProviding,
    },
  };
}

type _InferInjectorTypes<
  T extends InjectedDescriptor,
  D extends Record<string, InjectedDescriptor<any>> = {}
> = T extends InjectedDescriptor<infer T, infer O>
  ? {
      factory: Parameters<typeof injectable<O, D, T>>[0]["factory"];
      options: O;
    }
  : never;

export function replacement<
  _I extends InjectedDescriptor,
  _D extends Record<string, InjectedDescriptor<any>> = {},
  _InjectorTypes extends _InferInjectorTypes<_I, _D> = _InferInjectorTypes<
    _I,
    _D
  >
>(props: {
  implemented: _I;
  factory: _InjectorTypes["factory"];
  name?: string;
  dependencies?: _D;
}): ReplacementInjectedDescriptor<_I, _InjectorTypes["options"]> {
  return {
    injected: props.implemented,
    [DI_REPLACEMENT]: injectable({
      name: props.name,
      dependencies: props.dependencies,
      factory: props.factory,
      options: props.implemented[DI_OPTIONS],
    }),
  };
}

export function replaceable<T, O = undefined>(
  ...args: O extends undefined
    ? [props?: { name?: string }]
    : [props: { name?: string } & { options: O }]
) {
  const props = args[0];
  return injectable<O, {}, T>({
    name: props?.name,
    options: props && "options" in props ? props?.options : undefined,
    factory: ({ token, name }) => {
      throw new DepfyReplacebleNotImplementedError({
        name,
        token,
      });
    },
  });
}
