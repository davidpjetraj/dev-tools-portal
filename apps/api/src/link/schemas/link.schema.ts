import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LinkDocument = Link & Document;

@Schema({ timestamps: true, versionKey: false })
export class Link {
  @Prop({ required: true, trim: true, maxlength: 120 })
  title: string;

  @Prop({
    required: true,
    trim: true,
    validate: {
      validator: (v: string) => /^https?:\/\/.+/.test(v),
      message: 'URL must start with http:// or https://',
    },
  })
  url: string;

  @Prop({ trim: true, default: null })
  icon?: string;

  @Prop({ trim: true, maxlength: 500, default: null })
  description?: string;

  @Prop({ trim: true, default: 'General' })
  category?: string;

  @Prop({ default: 0 })
  order: number;

  createdAt: Date;
  updatedAt: Date;
}

export const LinkSchema = SchemaFactory.createForClass(Link);
LinkSchema.index({ category: 1, order: 1 });
