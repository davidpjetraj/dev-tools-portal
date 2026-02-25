import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LinkService } from './link.service';
import { LinkModel } from './model/link.model';
import { CreateLinkInput, UpdateLinkInput } from './input/link.input';
import { Auth } from '../decorators/auth.decorator';

@Resolver(() => LinkModel)
export class LinkResolver {
  constructor(private readonly linkService: LinkService) {}

  @Query(() => [LinkModel])
  links(@Args('category', { nullable: true }) category?: string) {
    return this.linkService.findAll(category);
  }

  @Query(() => LinkModel, { nullable: true })
  link(@Args('id') id: string) {
    return this.linkService.findOne(id);
  }

  @Query(() => [String])
  categories() {
    return this.linkService.getCategories();
  }

  @Auth()
  @Mutation(() => LinkModel)
  createLink(@Args('input') input: CreateLinkInput) {
    return this.linkService.create(input);
  }

  @Auth()
  @Mutation(() => LinkModel)
  updateLink(@Args('id') id: string, @Args('input') input: UpdateLinkInput) {
    return this.linkService.update(id, input);
  }

  @Auth()
  @Mutation(() => Boolean)
  deleteLink(@Args('id') id: string) {
    return this.linkService.delete(id);
  }
}
