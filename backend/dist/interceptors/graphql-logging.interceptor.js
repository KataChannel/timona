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
exports.GraphQLLoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const operators_1 = require("rxjs/operators");
const logger_service_1 = require("../logger/logger.service");
let GraphQLLoggingInterceptor = class GraphQLLoggingInterceptor {
    constructor(logger) {
        this.logger = logger;
    }
    intercept(context, next) {
        const gqlContext = graphql_1.GqlExecutionContext.create(context);
        const info = gqlContext.getInfo();
        const args = gqlContext.getArgs();
        const ctx = gqlContext.getContext();
        if (!info || !info.operation) {
            return next.handle();
        }
        const operationName = info.operation.name?.value || 'Unknown';
        const fieldName = info.fieldName || 'Unknown';
        const operation = info.operation.operation || 'unknown';
        const query = info.source?.body || 'N/A';
        const userId = ctx.req?.user?.id;
        const userEmail = ctx.req?.user?.email;
        const startTime = Date.now();
        this.logger.debug(`${operation.toUpperCase()} ${operationName}.${fieldName} started`, 'GraphQL', {
            operationName,
            fieldName,
            operation,
            userId,
            userEmail,
            variables: args,
        });
        return next.handle().pipe((0, operators_1.tap)({
            next: (data) => {
                const duration = Date.now() - startTime;
                this.logger.logGraphQLOperation(`${operationName}.${fieldName}`, query, args, duration, userId);
                if (duration > 1000) {
                    this.logger.logPerformance(`GraphQL ${operation.toUpperCase()} ${operationName}.${fieldName}`, duration, {
                        operationName,
                        fieldName,
                        userId,
                        slow: true,
                    });
                }
            },
            error: (error) => {
                const duration = Date.now() - startTime;
                this.logger.error(`GraphQL Error in ${operation.toUpperCase()} ${operationName}.${fieldName}`, error.stack, 'GraphQL', {
                    operationName,
                    fieldName,
                    operation,
                    userId,
                    userEmail,
                    duration,
                    variables: args,
                    errorMessage: error.message,
                    errorCode: error.extensions?.code,
                });
            },
        }));
    }
};
exports.GraphQLLoggingInterceptor = GraphQLLoggingInterceptor;
exports.GraphQLLoggingInterceptor = GraphQLLoggingInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logger_service_1.LoggerService])
], GraphQLLoggingInterceptor);
//# sourceMappingURL=graphql-logging.interceptor.js.map