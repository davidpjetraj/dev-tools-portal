import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Link, LinkSchema } from './schemas/link.schema';
import { LinkService } from './link.service';
import { LinkResolver } from './link.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Link.name, schema: LinkSchema }]),
  ],
  providers: [LinkService, LinkResolver],
  exports: [LinkService],
})
export class LinkModule {}
