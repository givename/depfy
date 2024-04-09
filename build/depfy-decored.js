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
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleaner = exports.resolver = exports.replacement = exports.replaceable = exports.injectable = void 0;
const depfy = __importStar(require("./depfy"));
const memory_1 = require("./memory");
const exceptions_1 = require("./exceptions");
const depfyExtendCleaner = () => {
    memory_1.DI_MEMORY.IS_CLEANDED = true;
    memory_1.DI_MEMORY.FACTORIES.clear();
    memory_1.DI_MEMORY.IMPLEMENTED.clear();
    memory_1.DI_MEMORY.FACTORIES = null;
    memory_1.DI_MEMORY.IMPLEMENTED = null;
};
const assertMemoryAllowed = () => {
    if (memory_1.DI_MEMORY.IS_CLEANDED) {
        throw new exceptions_1.DepfyMemoryCleanedError();
    }
};
const errorWrapper = (error) => {
    if (error instanceof exceptions_1.DepfyError) {
        return error;
    }
    if (error instanceof Error) {
        return new exceptions_1.DepfyCatchedError(error, error.message);
    }
    return new exceptions_1.DepfyError(`unknown error: ${error}`);
};
const decoratorDepfyErrorHandler = (f) => {
    return ((...args) => {
        assertMemoryAllowed();
        try {
            const maybeValue = f(...args);
            if (!(maybeValue instanceof Promise)) {
                return maybeValue;
            }
            return maybeValue.catch((error) => {
                throw errorWrapper(error);
            });
        }
        catch (error) {
            throw errorWrapper(error);
        }
    });
};
exports.injectable = decoratorDepfyErrorHandler(depfy.injectable);
exports.replaceable = decoratorDepfyErrorHandler(depfy.replaceable);
exports.replacement = decoratorDepfyErrorHandler(depfy.replacement);
exports.resolver = decoratorDepfyErrorHandler(depfy.resolver);
exports.cleaner = decoratorDepfyErrorHandler(depfyExtendCleaner);
