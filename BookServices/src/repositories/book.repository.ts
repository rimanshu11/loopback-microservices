import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {BookDataSource} from '../datasources';
import {Book, BookRelations} from '../models';

export class BookRepository extends DefaultCrudRepository<
  Book,
  typeof Book.prototype.bookId,
  BookRelations
> {
  constructor(
    @inject('datasources.book') dataSource: BookDataSource,
  ) {
    super(Book, dataSource);
  }
}
