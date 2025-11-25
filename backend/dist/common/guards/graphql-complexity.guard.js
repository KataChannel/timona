"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLComplexityGuard = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const graphql_2 = require("graphql");
const graphql_depth_limit_1 = require("graphql-depth-limit");
let GraphQLComplexityGuard = class GraphQLComplexityGuard {
    constructor(maxDepth = 10) {
        this.maxDepth = maxDepth;
    }
    canActivate(context) {
        const ctx = graphql_1.GqlExecutionContext.create(context);
        const { req } = ctx.getContext();
        const query = req.body?.query;
        if (!query) {
            return true;
        }
        try {
            const document = (0, graphql_2.parse)(query);
            const schema = ctx.getInfo().schema;
            const depthRule = (0, graphql_depth_limit_1.depthLimit)(this.maxDepth);
            const errors = (0, graphql_2.validate)(schema, document, [depthRule]);
            if (errors.length > 0) {
                throw new common_1.BadRequestException(`Query depth validation failed: ${errors.map(e => e.message).join(', ')}`);
            }
            return true;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            console.error('GraphQL depth validation error:', error);
            return true;
        }
    }
};
exports.GraphQLComplexityGuard = GraphQLComplexityGuard;
exports.GraphQLComplexityGuard = GraphQLComplexityGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Number])
], GraphQLComplexityGuard);
//# sourceMappingURL=graphql-complexity.guard.js.map