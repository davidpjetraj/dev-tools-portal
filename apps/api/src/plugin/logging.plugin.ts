import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { Plugin } from '@nestjs/apollo';
import { normalizeIp } from '../utils/client-ip';
import { Request } from 'express';

@Plugin()
export class LoggingPlugin implements ApolloServerPlugin {
    async requestDidStart(ctx: any): Promise<GraphQLRequestListener<any>> {
        if (ctx.request.operationName !== 'IntrospectionQuery') {
            const clientIp = normalizeIp(
                ctx.request.http?.headers?.get?.('cf-connecting-ip') || '',
            );
            console.log(
                `GraphQL operation started: ${ctx.request.operationName || 'unnamed'} clientIp: ${clientIp}`,
                {
                    graphql: {
                        operation_name: ctx.request.operationName,
                        operation_type: this.getOperationType(ctx.request.query),
                    },
                },
            );
        }

        return {
            async didResolveOperation(ctx: any) {
                if (ctx.request.operationName !== 'IntrospectionQuery') {
                    console.debug(`GraphQL operation resolved: ${ctx.request.operationName}`, {
                        graphql: { operation_name: ctx.request.operationName },
                    });
                }
            },

            async didEncounterErrors(ctx: any) {
                if (ctx.errors) {
                    const error = ctx?.errors[0];
                    const clientIp = normalizeIp(
                        (ctx.request as unknown as Request & { clientIp?: string })?.clientIp,
                    );
                    console.error(`GraphQL error: ${error?.message} clientIp: ${clientIp}`, {
                        graphql: {
                            operation_name: ctx.request.operationName,
                            error: error?.message,
                        },
                        metadata: {
                            error,
                            stack: error?.stack?.toString(),
                            user: ctx?.contextValue?.req?.user?.user_id,
                            query: ctx?.request?.query,
                            variables: ctx?.request?.variables,
                        },
                    });
                }
            },

            async willSendResponse(ctx: any) {
                if (ctx.request.operationName !== 'IntrospectionQuery') {
                    console.log(
                        `GraphQL response sent for: ${ctx.request.operationName || 'unnamed'}`,
                        { graphql: { operation_name: ctx.request.operationName } },
                    );
                }
            },
        };
    }

    private getOperationType(query?: string): string {
        if (!query) return 'unknown';
        const trimmed = query.trim();
        if (trimmed.startsWith('query')) return 'query';
        if (trimmed.startsWith('mutation')) return 'mutation';
        if (trimmed.startsWith('subscription')) return 'subscription';
        return 'unknown';
    }
}
