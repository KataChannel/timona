"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadScalar = void 0;
const graphql_1 = require("@nestjs/graphql");
const GraphQLUpload_mjs_1 = __importDefault(require("graphql-upload/GraphQLUpload.mjs"));
let UploadScalar = class UploadScalar {
    constructor() {
        this.description = 'Upload scalar type';
    }
    parseValue(value) {
        return GraphQLUpload_mjs_1.default.parseValue(value);
    }
    serialize(value) {
        return GraphQLUpload_mjs_1.default.serialize(value);
    }
    parseLiteral(ast) {
        return GraphQLUpload_mjs_1.default.parseLiteral(ast, {});
    }
};
exports.UploadScalar = UploadScalar;
exports.UploadScalar = UploadScalar = __decorate([
    (0, graphql_1.Scalar)('Upload')
], UploadScalar);
//# sourceMappingURL=upload.scalar.js.map