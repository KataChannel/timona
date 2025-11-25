# Docker configurations for PostgreSQL
CREATE DATABASE IF NOT EXISTS rausachcore;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';
