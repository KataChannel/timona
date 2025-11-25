import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import * as validator from 'validator';

@Injectable()
export class InputSanitizationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    
    if (req && req.body && req.body.variables) {
      req.body.variables = this.sanitizeInput(req.body.variables);
    }
    
    // For REST endpoints
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    
    if (request && request.body) {
      request.body = this.sanitizeInput(request.body);
    }
    
    return next.handle();
  }

  private sanitizeInput(obj: any): any {
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
        } else {
          return this.sanitizeInput(item);
        }
      });
    }
    
    if (typeof obj === 'object') {
      const sanitizedObj = { ...obj };
      Object.keys(sanitizedObj).forEach(key => {
        if (typeof sanitizedObj[key] === 'string') {
          sanitizedObj[key] = this.sanitizeString(sanitizedObj[key]);
        } else {
          sanitizedObj[key] = this.sanitizeInput(sanitizedObj[key]);
        }
      });
      return sanitizedObj;
    }

    return obj;
  }

  private sanitizeString(str: string): string {
    if (!str || typeof str !== 'string') {
      return str;
    }

    // Remove potentially dangerous HTML/JavaScript
    let sanitized = str
      // Remove script tags and their content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove javascript: protocol
      .replace(/javascript:/gi, '')
      // Remove on* event handlers
      .replace(/on\w+\s*=/gi, '')
      // Remove potentially dangerous tags
      .replace(/<(iframe|object|embed|link|style|meta|base|form|input|textarea|select|option|button)\b[^>]*>/gi, '')
      // Clean up common XSS patterns
      .replace(/eval\s*\(/gi, '')
      .replace(/expression\s*\(/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '');

    // Escape HTML entities for display safety
    sanitized = validator.escape(sanitized);
    
    // Normalize whitespace
    sanitized = sanitized.trim();
    
    return sanitized;
  }

  private isEmailField(fieldName: string): boolean {
    const emailFields = ['email', 'emailAddress', 'userEmail', 'contactEmail'];
    return emailFields.some(field => 
      fieldName.toLowerCase().includes(field.toLowerCase())
    );
  }

  private isUrlField(fieldName: string): boolean {
    const urlFields = ['url', 'website', 'link', 'href', 'src'];
    return urlFields.some(field => 
      fieldName.toLowerCase().includes(field.toLowerCase())
    );
  }
}