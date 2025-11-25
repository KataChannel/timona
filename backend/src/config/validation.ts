import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Application Environment
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(4000),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
  
  // Database Configuration
  DATABASE_URL: Joi.string().required()
    .pattern(/^postgresql:\/\//)
    .messages({'string.pattern.base': 'DATABASE_URL must be a valid PostgreSQL connection string'}),
  
  // Redis Configuration
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_PASSWORD: Joi.string().optional().allow(''),
  
  // JWT Configuration
  JWT_SECRET: Joi.string().min(32).required()
    .messages({'string.min': 'JWT_SECRET must be at least 32 characters long'}),
  JWT_EXPIRES_IN: Joi.string().default('7d')
    .pattern(/^(\d+[dwmy]|\d+)$/)
    .messages({'string.pattern.base': 'JWT_EXPIRES_IN must be a valid time string (e.g., "7d", "30m", "1y")'}),
  
  // Minio Object Storage Configuration
  MINIO_ENDPOINT: Joi.string().default('localhost'),
  MINIO_PORT: Joi.number().port().default(9000),
  MINIO_ACCESS_KEY: Joi.string().required()
    .messages({'any.required': 'MINIO_ACCESS_KEY is required'}),
  MINIO_SECRET_KEY: Joi.string().required()
    .messages({'any.required': 'MINIO_SECRET_KEY is required'}),
  MINIO_USE_SSL: Joi.boolean().default(false),
  MINIO_BUCKET_NAME: Joi.string().default('uploads')
    .pattern(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/)
    .messages({'string.pattern.base': 'MINIO_BUCKET_NAME must be a valid S3 bucket name'}),

  // NextAuth Configuration (for frontend compatibility)
  NEXTAUTH_SECRET: Joi.string().optional(),
  NEXTAUTH_URL: Joi.string().uri().optional(),

  // Additional Environment Variables
  NEXT_PUBLIC_APP_URL: Joi.string().uri().optional(),
  NEXT_PUBLIC_GRAPHQL_ENDPOINT: Joi.string().uri().optional(),
  
  // Production-specific variables
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

  // Monitoring (optional)
  GRAFANA_PASSWORD: Joi.string().optional(),
});
