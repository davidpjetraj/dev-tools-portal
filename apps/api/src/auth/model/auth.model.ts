import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Sign in model' })
export class AuthModel {
    @Field(() => String)
    access_token: string;

    @Field(() => String)
    refresh_token: string;
}
