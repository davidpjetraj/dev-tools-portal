import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LinkModel {
  @Field(() => String)
  id: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  url: string;

  @Field(() => String, { nullable: true })
  icon?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String)
  category: string;

  @Field(() => Int)
  order: number;

  @Field(() => String)
  createdAt: string;

  @Field(() => String)
  updatedAt: string;
}
