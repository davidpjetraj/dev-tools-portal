import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from '../config';

@Module({
  imports: [
    MongooseModule.forRoot(config.mongodb_uri, {
      serverSelectionTimeoutMS: 5000,
    }),
  ],
})
export class DatabaseModule { }
