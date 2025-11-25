"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Upload = exports.UploadScalar = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_2 = require("graphql");
let UploadScalar = class UploadScalar {
    constructor() {
        this.description = 'Upload custom scalar type for file uploads';
    }
    parseValue(value) {
        return value;
    }
    serialize(value) {
        return value;
    }
    parseLiteral(ast) {
        if (ast.kind === graphql_2.Kind.STRING) {
            return ast.value;
        }
        return null;
    }
};
exports.UploadScalar = UploadScalar;
exports.UploadScalar = UploadScalar = __decorate([
    (0, graphql_1.Scalar)('Upload', () => Upload)
], UploadScalar);
class Upload {
}
exports.Upload = Upload;
//# sourceMappingURL=upload.scalar.js.map