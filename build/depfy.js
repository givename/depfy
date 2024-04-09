"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceable = exports.replacement = exports.resolver = exports.injectable = void 0;
const uuid = __importStar(require("uuid"));
const dgraph = __importStar(require("dependency-graph"));
const memory_1 = require("./memory");
const constants_1 = require("./constants");
const exceptions_1 = require("./exceptions");
const identity = (props) => props.dependencies;
function injectable(props) {
    var _a, _b;
    const maybeImplementedToken = (_a = props.replaceable) === null || _a === void 0 ? void 0 : _a.token;
    const maybeImplementedName = (_b = props.replaceable) === null || _b === void 0 ? void 0 : _b.name;
    const token = maybeImplementedToken !== null && maybeImplementedToken !== void 0 ? maybeImplementedToken : uuid.v4();
    const { name = maybeImplementedName !== null && maybeImplementedName !== void 0 ? maybeImplementedName : token, dependencies = {}, factory = identity, options, } = props;
    if (maybeImplementedToken) {
        if (memory_1.DI_MEMORY.IMPLEMENTED.has(maybeImplementedToken)) {
            throw new exceptions_1.DepfyAlreadyImplementedError({
                token: maybeImplementedToken,
                name: maybeImplementedName,
            }, { token, name });
        }
        memory_1.DI_MEMORY.IMPLEMENTED.add(maybeImplementedToken);
    }
    memory_1.DI_MEMORY.FACTORIES.set(token, {
        name,
        options,
        dependencies,
        factory: factory,
    });
    return {
        name,
        token,
        clone(params) {
            var _a, _b;
            return injectable(Object.assign(Object.assign({}, props), { name: (_a = params.name) !== null && _a !== void 0 ? _a : name, options: (_b = params.options) !== null && _b !== void 0 ? _b : options }));
        },
        [constants_1.DI_OPTIONS]: options,
        [constants_1.DI_INJECTED]: null /** metafield */,
    };
}
exports.injectable = injectable;
const assertReplacementsOnDuplicate = (replacements) => {
    const injectables = new Map();
    for (const { injected, [constants_1.DI_REPLACEMENT]: replacement } of replacements) {
        const token = injected.token;
        if (injectables.has(token)) {
            const injectable = injectables.get(token);
            throw new exceptions_1.DepfyReplacementDuplicateError({
                name: injectable.name,
                token: injected.token,
            }, {
                name: replacement.name,
                token: replacement.token,
            }, {
                name: replacement.name,
                token: replacement.token,
            });
        }
        injectables.set(token, replacement);
    }
};
function resolver(props) {
    return __awaiter(this, void 0, void 0, function* () {
        const { dependency, replacements = [] } = props;
        assertReplacementsOnDuplicate(replacements);
        let rootToken = dependency.token;
        const graph = new dgraph.DepGraph();
        const resolved = new Map();
        const factories = new Map(memory_1.DI_MEMORY.FACTORIES.entries());
        for (const { injected, [constants_1.DI_REPLACEMENT]: replacement } of replacements) {
            factories.set(injected.token, factories.get(replacement.token));
        }
        for (const [root, data] of factories) {
            graph.addNode(root, data);
        }
        for (const [root, { dependencies }] of factories) {
            for (const { token } of Object.values(dependencies)) {
                graph.addDependency(root, token);
            }
        }
        let resolvedSeq = [];
        try {
            resolvedSeq = graph.dependenciesOf(rootToken);
            resolvedSeq.push(rootToken);
        }
        catch (error) {
            if (error instanceof dgraph.DepGraphCycleError) {
                const cyclePath = error.cyclePath.map((token) => {
                    var _a;
                    const injected = factories.get(token);
                    return [(_a = injected === null || injected === void 0 ? void 0 : injected.name) !== null && _a !== void 0 ? _a : token, token];
                });
                throw new exceptions_1.DepfyCycleDependencyError(cyclePath, error.message);
            }
        }
        for (const token of resolvedSeq) {
            const { factory, dependencies, options, name } = factories.get(token);
            const resolvedDependencies = {};
            for (const [name, { token }] of Object.entries(dependencies)) {
                resolvedDependencies[name] = resolved.get(token);
            }
            const instance = yield factory({
                name,
                token,
                options,
                dependencies: resolvedDependencies,
            });
            resolved.set(token, instance);
        }
        const orderProviding = resolvedSeq.map((token) => {
            const { name } = factories.get(token);
            return `${name} :: ${token}`;
        });
        const root = yield resolved.get(dependency.token);
        return {
            root,
            find(injected) {
                const instance = resolved.get(injected.token);
                return instance;
            },
            debug: {
                order: orderProviding,
            },
        };
    });
}
exports.resolver = resolver;
function replacement(props) {
    return {
        injected: props.replaceable,
        [constants_1.DI_REPLACEMENT]: injectable({
            name: props.name,
            dependencies: props.dependencies,
            factory: props.factory,
            options: props.replaceable[constants_1.DI_OPTIONS],
        }),
    };
}
exports.replacement = replacement;
function replaceable(...args) {
    const props = args[0];
    return injectable({
        name: props === null || props === void 0 ? void 0 : props.name,
        options: props && "options" in props ? props === null || props === void 0 ? void 0 : props.options : undefined,
        factory: ({ token, name }) => {
            throw new exceptions_1.DepfyReplacebleNotImplementedError({
                name,
                token,
            });
        },
    });
}
exports.replaceable = replaceable;
