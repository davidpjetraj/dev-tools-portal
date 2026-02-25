import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType({ description: 'Refresh token input' })
export class RefreshTokenInput {
  @Field(() => String, { description: 'Refresh token' })
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}
