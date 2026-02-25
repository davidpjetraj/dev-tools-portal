import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Resolve env files from the repo root, not from the workspace cwd
const rootDir = path.resolve(__dirname, '../../..');

// Load base .env, then overlay environment-specific file if present
dotenv.config({ path: path.join(rootDir, '.env') });

const nodeEnv = process.env.NODE_ENV ?? 'development';
dotenv.config({ path: path.join(rootDir, `.env.${nodeEnv}`) });

const appEnvSchema = z.object({
    PORT: z.string().default('4000'),
    CORS_ORIGIN: z.string().default('http://localhost:3000'),
    MONGODB_URI: z.string().min(1),
    JWT_SECRET: z.string().min(1),
    ADMIN_USERNAME: z.string().default(''),
    ADMIN_PASSWORD: z.string().default(''),
    ACCESS_TOKEN_EXPIRES_IN: z.string().default('1d'),
    REFRESH_TOKEN_EXPIRES_IN: z.string().default('1d'),
    SWAGGER_USER: z.string().default('admin'),
    SWAGGER_PASSWORD: z.string().default('admin'),
    APP_NAME: z.string().default('Dev Tools Portal API'),
    NODE_ENV: z.string().default('development'),
    STORAGE_ENDPOINT: z.string().default(''),
    STORAGE_KEY: z.string().default(''),
    STORAGE_SECRET: z.string().default(''),
    PUBLIC_BUCKET: z.string().default(''),
    CDN_ENDPOINT: z.string().default(''),
    STORAGE_REGION: z.string().default('auto'),
});


const APP_ENV = appEnvSchema.parse(process.env);

export const config = {
    port: parseInt(APP_ENV.PORT, 10),
    corsOrigin: APP_ENV.CORS_ORIGIN.split(',').map((o) => o.trim()),
    mongodb_uri: APP_ENV.MONGODB_URI,
    jwt_secret: APP_ENV.JWT_SECRET,
    admin_username: APP_ENV.ADMIN_USERNAME,
    admin_password: APP_ENV.ADMIN_PASSWORD,
    access_token_expires_in: APP_ENV.ACCESS_TOKEN_EXPIRES_IN,
    refresh_token_expires_in: APP_ENV.REFRESH_TOKEN_EXPIRES_IN,
    swagger_user: APP_ENV.SWAGGER_USER,
    swagger_password: APP_ENV.SWAGGER_PASSWORD,
    app_name: APP_ENV.APP_NAME,
    environment: APP_ENV.NODE_ENV,
    storage_endpoint: APP_ENV.STORAGE_ENDPOINT,
    storage_key: APP_ENV.STORAGE_KEY,
    storage_secret: APP_ENV.STORAGE_SECRET,
    public_bucket: APP_ENV.PUBLIC_BUCKET,
    cdn_endpoint: APP_ENV.CDN_ENDPOINT,
    storage_region: APP_ENV.STORAGE_REGION,
};



export type Config = typeof config;
