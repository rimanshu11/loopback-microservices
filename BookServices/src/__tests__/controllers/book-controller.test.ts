import {expect} from 'chai';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {describe, it, beforeEach} from 'mocha';
import {BookController} from '../../controllers/book.controller';
import {BookRepository} from '../../repositories/book.repository';
import {Book} from '../../models';

chai.use(sinonChai);

describe('BookController Unit Tests', () => {
  let controller: BookController;
  let repoStub: sinon.SinonStubbedInstance<BookRepository>;

  beforeEach(() => {
    repoStub = sinon.createStubInstance(BookRepository);
    controller = new BookController(repoStub);
  });

  describe('create', () => {
    it('creates a new book successfully', async () => {
      const bookData = { title: 'Test Book' } as Omit<Book, 'bookId'>;
      const createdBook = { bookId: 1, title: 'Test Book' } as Book;
      repoStub.create.resolves(createdBook);

      const result = await controller.create(bookData);
      expect(result).to.deep.equal(createdBook);
      expect(repoStub.create).to.have.been.calledOnceWith(bookData);
    });
  });

  describe('count', () => {
    it('returns the count of books', async () => {
      const where = { title: 'Test' };
      const countResult = { count: 5 };
      repoStub.count.resolves(countResult);

      const result = await controller.count(where);
      expect(result).to.deep.equal(countResult);
      expect(repoStub.count).to.have.been.calledOnceWith(where);
    });

    it('counts all books when no where clause is provided', async () => {
      const countResult = { count: 10 };
      repoStub.count.resolves(countResult);

      const result = await controller.count();
      expect(result).to.deep.equal(countResult);
      expect(repoStub.count).to.have.been.calledOnceWith(undefined);
    });
  });

  describe('find', () => {
    it('returns an array of books', async () => {
      const filter = { where: { title: 'Test' } };
      const books = [
        { bookId: 1, title: 'Test Book 1' },
        { bookId: 2, title: 'Test Book 2' },
      ] as Book[];
      repoStub.find.resolves(books);

      const result = await controller.find(filter);
      expect(result).to.deep.equal(books);
      expect(repoStub.find).to.have.been.calledOnceWith(filter);
    });

    it('returns all books when no filter is provided', async () => {
      const books = [{ bookId: 1, title: 'Book 1' }] as Book[];
      repoStub.find.resolves(books);

      const result = await controller.find();
      expect(result).to.deep.equal(books);
      expect(repoStub.find).to.have.been.calledOnceWith(undefined);
    });
  });

  describe('updateAll', () => {
    it('updates all books matching the where clause', async () => {
      const bookData = { title: 'Updated Title' } as Book;
      const where = { title: 'Test' };
      const countResult = { count: 3 };
      repoStub.updateAll.resolves(countResult);

      const result = await controller.updateAll(bookData, where);
      expect(result).to.deep.equal(countResult);
      expect(repoStub.updateAll).to.have.been.calledOnceWith(bookData, where);
    });
  });

  describe('findById', () => {
    it('returns a book by ID', async () => {
      const id = 1;
      const filter = { fields: { title: true } };
      const book = { bookId: id, title: 'Test Book' } as Book;
      repoStub.findById.resolves(book);

      const result = await controller.findById(id, filter);
      expect(result).to.deep.equal(book);
      expect(repoStub.findById).to.have.been.calledOnceWith(id, filter);
    });
  });

  describe('updateById', () => {
    it('updates a book by ID', async () => {
      const bookId = 1;
      const bookData = { title: 'Updated Book' } as Book;
      repoStub.updateById.resolves();

      await controller.updateById(bookId, bookData);
      expect(repoStub.updateById).to.have.been.calledOnceWith(bookId, bookData);
    });
  });

  describe('replaceById', () => {
    it('replaces a book by ID', async () => {
      const id = 1;
      const bookData = { bookId: id, title: 'Replaced Book' } as Book;
      repoStub.replaceById.resolves();

      await controller.replaceById(id, bookData);
      expect(repoStub.replaceById).to.have.been.calledOnceWith(id, bookData);
    });
  });

  describe('deleteById', () => {
    it('deletes a book by ID', async () => {
      const id = 1;
      repoStub.deleteById.resolves();

      await controller.deleteById(id);
      expect(repoStub.deleteById).to.have.been.calledOnceWith(id);
    });
  });
});