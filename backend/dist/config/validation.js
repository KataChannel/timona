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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationSchema = void 0;
const Joi = __importStar(require("joi"));
exports.validationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
    PORT: Joi.number().port().default(4000),
    FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
    DATABASE_URL: Joi.string().required()
        .pattern(/^postgresql:\/\//)
        .messages({ 'string.pattern.base': 'DATABASE_URL must be a valid PostgreSQL connection string' }),
    REDIS_HOST: Joi.string().default('localhost'),
    REDIS_PORT: Joi.number().port().default(6379),
    REDIS_PASSWORD: Joi.string().optional().allow(''),
    JWT_SECRET: Joi.string().min(32).required()
        .messages({ 'string.min': 'JWT_SECRET must be at least 32 characters long' }),
    JWT_EXPIRES_IN: Joi.string().default('7d')
        .pattern(/^(\d+[dwmy]|\d+)$/)
        .messages({ 'string.pattern.base': 'JWT_EXPIRES_IN must be a valid time string (e.g., "7d", "30m", "1y")' }),
    MINIO_ENDPOINT: Joi.string().default('localhost'),
    MINIO_PORT: Joi.number().port().default(9000),
    MINIO_ACCESS_KEY: Joi.string().required()
        .messages({ 'any.required': 'MINIO_ACCESS_KEY is required' }),
    MINIO_SECRET_KEY: Joi.string().required()
        .messages({ 'any.required': 'MINIO_SECRET_KEY is required' }),
    MINIO_USE_SSL: Joi.boolean().default(false),
    MINIO_BUCKET_NAME: Joi.string().default('uploads')
        .pattern(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/)
        .messages({ 'string.pattern.base': 'MINIO_BUCKET_NAME must be a valid S3 bucket name' }),
    NEXTAUTH_SECRET: Joi.string().optional(),
    NEXTAUTH_URL: Joi.string().uri().optional(),
    NEXT_PUBLIC_APP_URL: Joi.string().uri().optional(),
    NEXT_PUBLIC_GRAPHQL_ENDPOINT: Joi.string().uri().optional(),
    DOMAIN: Joi.when('NODE_ENV', {
        is: 'production',
        then: Joi.string().domain().required(),
        otherwise: Joi.string().optional(),
    }),
    SSL_EMAIL: Joi.when('NODE_ENV', {
        is: 'production',
        then: Joi.string().email().required(),
        otherwise: Joi.string().email().optional(),
    }),
    GRAFANA_PASSWORD: Joi.string().optional(),
});
//# sourceMappingURL=validation.js.map