import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Link, LinkDocument } from './schemas/link.schema';
import { CreateLinkInput, UpdateLinkInput } from './input/link.input';
import { LinkModel } from './model/link.model';

@Injectable()
export class LinkService {
  constructor(@InjectModel(Link.name) private readonly linkModel: Model<LinkDocument>) {}

  private formatLink(doc: LinkDocument): LinkModel {
    return {
      id: doc._id.toString(),
      title: doc.title,
      url: doc.url,
      icon: doc.icon ?? undefined,
      description: doc.description ?? undefined,
      category: doc.category ?? 'General',
      order: doc.order,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  async findAll(category?: string): Promise<LinkModel[]> {
    const filter = category ? { category } : {};
    const docs = await this.linkModel
      .find(filter)
      .sort({ category: 1, order: 1, createdAt: 1 })
      .exec();
    return docs.map((doc) => this.formatLink(doc));
  }

  async findOne(id: string): Promise<LinkModel> {
    const doc = await this.linkModel.findById(id).exec();
    if (!doc) {
      throw new NotFoundException(`Link with id "${id}" not found.`);
    }
    return this.formatLink(doc);
  }

  async getCategories(): Promise<string[]> {
    return this.linkModel.distinct('category').exec();
  }

  async create(input: CreateLinkInput): Promise<LinkModel> {
    const doc = await this.linkModel.create(input);
    return this.formatLink(doc);
  }

  async update(id: string, input: UpdateLinkInput): Promise<LinkModel> {
    const doc = await this.linkModel
      .findByIdAndUpdate(id, input, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!doc) {
      throw new NotFoundException(`Link with id "${id}" not found.`);
    }
    return this.formatLink(doc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.linkModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Link with id "${id}" not found.`);
    }
    return true;
  }
}
