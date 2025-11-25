"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONScalar = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
let JSONScalar = class JSONScalar {
    constructor() {
        this.description = 'JSON custom scalar type';
    }
    parseValue(value) {
        return graphql_type_json_1.GraphQLJSON.parseValue(value);
    }
    serialize(value) {
        return graphql_type_json_1.GraphQLJSON.serialize(value);
    }
    parseLiteral(ast) {
        return graphql_type_json_1.GraphQLJSON.parseLiteral(ast, {});
    }
};
exports.JSONScalar = JSONScalar;
exports.JSONScalar = JSONScalar = __decorate([
    (0, graphql_1.Scalar)('JSON', () => JSON)
], JSONScalar);
//# sourceMappingURL=json.scalar.js.map