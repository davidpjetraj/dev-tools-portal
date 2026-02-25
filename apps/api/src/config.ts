import { z } from 'zod';
import 'dotenv/config';

const appEnvSchema = z.object({
    PORT: z.string().default('4000'),
    CORS_ORIGIN: z.string().default('http://localhost:3000'),
    MONGODB_URI: z.string().min(1),
    JWT_SECRET: z.string().min(1),
    ADMIN_USERNAME: z.string().default(''),
    ADMIN_PASSWORD: z.string().default(''),
    ACCESS_TOKEN_EXPIRES_IN: z.string().default('900'),
    REFRESH_TOKEN_EXPIRES_IN: z.string().default('604800'),
    SWAGGER_USER: z.string().default('admin'),
    SWAGGER_PASSWORD: z.string().default('admin'),
    APP_NAME: z.string().default('Dev Tools Portal API'),
    NODE_ENV: z.string().default('development'),
});

const APP_ENV = appEnvSchema.parse(process.env);

export const config = {
    port: parseInt(APP_ENV.PORT, 10),
    corsOrigin: APP_ENV.CORS_ORIGIN.split(',').map((o) => o.trim()),
    mongodb_uri: APP_ENV.MONGODB_URI,
    jwt_secret: APP_ENV.JWT_SECRET,
    admin_username: APP_ENV.ADMIN_USERNAME,
    admin_password: APP_ENV.ADMIN_PASSWORD,
    access_token_expires_in: parseInt(APP_ENV.ACCESS_TOKEN_EXPIRES_IN, 10),
    refresh_token_expires_in: parseInt(APP_ENV.REFRESH_TOKEN_EXPIRES_IN, 10),
    swagger_user: APP_ENV.SWAGGER_USER,
    swagger_password: APP_ENV.SWAGGER_PASSWORD,
    app_name: APP_ENV.APP_NAME,
    environment: APP_ENV.NODE_ENV,
};

export type Config = typeof config;
