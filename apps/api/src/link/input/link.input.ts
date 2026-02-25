import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsInt, Matches, MaxLength } from 'class-validator';

@InputType()
export class CreateLinkInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  title: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @Matches(/^https?:\/\/.+/, { message: 'URL must start with http:// or https://' })
  url: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  icon?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  order?: number;
}

@InputType()
export class UpdateLinkInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  title: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @Matches(/^https?:\/\/.+/, { message: 'URL must start with http:// or https://' })
  url: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  icon?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  order?: number;
}
