"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepfyCatchedError = exports.DepfyCycleDependencyError = exports.DepfyAlreadyImplementedError = exports.DepfyReplacementDuplicateError = exports.DepfyReplacebleNotImplementedError = exports.DepfyMemoryCleanedError = exports.DepfyError = void 0;
class DepfyError extends Error {
}
exports.DepfyError = DepfyError;
class DepfyMemoryCleanedError extends DepfyError {
}
exports.DepfyMemoryCleanedError = DepfyMemoryCleanedError;
class DepfyReplacebleNotImplementedError extends DepfyError {
    constructor(injected) {
        super(`replaceable not implemented for ${injected.name}::${injected.token}`);
        this.injected = injected;
    }
}
exports.DepfyReplacebleNotImplementedError = DepfyReplacebleNotImplementedError;
class DepfyReplacementDuplicateError extends DepfyError {
    constructor(injected, first, second) {
        super(`replacement ${injected.name}::${injected.token} duplicate for ${first.name}::${first.token} and ${second.name}::${second.token}`);
        this.injected = injected;
        this.first = first;
        this.second = second;
    }
}
exports.DepfyReplacementDuplicateError = DepfyReplacementDuplicateError;
class DepfyAlreadyImplementedError extends DepfyError {
    constructor(replaceable, implemented) {
        super(`dependency ${implemented.name}::${implemented.token} already implemented for ${replaceable.name}::${replaceable.token}`);
        this.replaceable = replaceable;
        this.implemented = implemented;
    }
}
exports.DepfyAlreadyImplementedError = DepfyAlreadyImplementedError;
class DepfyCycleDependencyError extends DepfyError {
    constructor(cyclePath, message) {
        super(message);
        this.cyclePath = cyclePath;
    }
}
exports.DepfyCycleDependencyError = DepfyCycleDependencyError;
class DepfyCatchedError extends DepfyError {
    constructor(error, message) {
        super(message);
        this.error = error;
    }
}
exports.DepfyCatchedError = DepfyCatchedError;
