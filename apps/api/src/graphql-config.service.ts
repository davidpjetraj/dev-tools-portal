import { ApolloDriverConfig } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { GqlOptionsFactory } from '@nestjs/graphql';
import type { Request, Response } from 'express';
import depthLimit from 'graphql-depth-limit';
import { join } from 'path';

@Injectable()
export class GqlConfigService implements GqlOptionsFactory {
  createGqlOptions(): ApolloDriverConfig {
    return {
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: false,
      introspection: process.env.NODE_ENV !== 'production',
      validationRules: [depthLimit(6)],
      context: ({ req, res }: { req: Request; res: Response }) => {
        const clientIp =
          req?.headers?.['cf-connecting-ip'] ??
          req?.headers?.['x-forwarded-for'] ??
          (req as { ip?: string })?.ip ??
          '';
        return { req, res, clientIp: typeof clientIp === 'string' ? clientIp.split(',')[0].trim() : '' };
      },
      formatError: (formattedError) => {
        if (process.env.NODE_ENV === 'production') {
          return { message: formattedError.message, code: formattedError.extensions?.code };
        }
        return formattedError;
      },
    };
  }
}
