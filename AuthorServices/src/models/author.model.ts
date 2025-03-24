import {Entity, model, property} from '@loopback/repository';

@model()
export class Author extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  authorId?: number;

  @property({
    type: 'string',
    required: true,
  })
  authorName: string;


  constructor(data?: Partial<Author>) {
    super(data);
  }
}

export interface AuthorRelations {
  // describe navigational properties here
}

export type AuthorWithRelations = Author & AuthorRelations;
