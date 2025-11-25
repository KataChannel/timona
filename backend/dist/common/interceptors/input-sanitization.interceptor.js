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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.InputSanitizationInterceptor = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const validator = __importStar(require("validator"));
let InputSanitizationInterceptor = class InputSanitizationInterceptor {
    intercept(context, next) {
        const ctx = graphql_1.GqlExecutionContext.create(context);
        const { req } = ctx.getContext();
        if (req && req.body && req.body.variables) {
            req.body.variables = this.sanitizeInput(req.body.variables);
        }
        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest();
        if (request && request.body) {
            request.body = this.sanitizeInput(request.body);
        }
        return next.handle();
    }
    sanitizeInput(obj) {
        if (obj === null || obj === undefined) {
            return obj;
        }
        if (typeof obj === 'string') {
            return this.sanitizeString(obj);
        }
        if (Array.isArray(obj)) {
            return obj.map((item, index) => {
                if (typeof item === 'string') {
                    return this.sanitizeString(item);
                }
                else {
                    return this.sanitizeInput(item);
                }
            });
        }
        if (typeof obj === 'object') {
            const sanitizedObj = { ...obj };
            Object.keys(sanitizedObj).forEach(key => {
                if (typeof sanitizedObj[key] === 'string') {
                    sanitizedObj[key] = this.sanitizeString(sanitizedObj[key]);
                }
                else {
                    sanitizedObj[key] = this.sanitizeInput(sanitizedObj[key]);
                }
            });
            return sanitizedObj;
        }
        return obj;
    }
    sanitizeString(str) {
        if (!str || typeof str !== 'string') {
            return str;
        }
        let sanitized = str
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .replace(/<(iframe|object|embed|link|style|meta|base|form|input|textarea|select|option|button)\b[^>]*>/gi, '')
            .replace(/eval\s*\(/gi, '')
            .replace(/expression\s*\(/gi, '')
            .replace(/vbscript:/gi, '')
            .replace(/data:/gi, '');
        sanitized = validator.escape(sanitized);
        sanitized = sanitized.trim();
        return sanitized;
    }
    isEmailField(fieldName) {
        const emailFields = ['email', 'emailAddress', 'userEmail', 'contactEmail'];
        return emailFields.some(field => fieldName.toLowerCase().includes(field.toLowerCase()));
    }
    isUrlField(fieldName) {
        const urlFields = ['url', 'website', 'link', 'href', 'src'];
        return urlFields.some(field => fieldName.toLowerCase().includes(field.toLowerCase()));
    }
};
exports.InputSanitizationInterceptor = InputSanitizationInterceptor;
exports.InputSanitizationInterceptor = InputSanitizationInterceptor = __decorate([
    (0, common_1.Injectable)()
], InputSanitizationInterceptor);
//# sourceMappingURL=input-sanitization.interceptor.js.map