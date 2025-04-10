import {expect} from 'chai';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {describe, it, beforeEach} from 'mocha';
import {AuthorController} from '../../controllers/author.controller';
import {AuthorRepository} from '../../repositories/author.repository';
import {Author} from '../../models';

chai.use(sinonChai);

describe('AuthorController Unit Tests', () => {
  let controller: AuthorController;
  let repoStub: sinon.SinonStubbedInstance<AuthorRepository>;

  beforeEach(() => {
    repoStub = sinon.createStubInstance(AuthorRepository);
    controller = new AuthorController(repoStub);
  });

  describe('create', () => {
    it('creates a new author successfully', async () => {
      const authorData = { authorName: 'John Doe' } as Omit<Author, 'authorId'>;
      const createdAuthor = { authorId: 1, authorName: 'John Doe' } as Author;
      repoStub.create.resolves(createdAuthor);

      const result = await controller.create(authorData);
      expect(result).to.deep.equal(createdAuthor);
      expect(repoStub.create).to.have.been.calledOnceWith(authorData); 
    });
  });

  describe('count', () => {
    it('returns the count of authors', async () => {
      const where = { authorName: 'John' };
      const countResult = { count: 5 };
      repoStub.count.resolves(countResult);

      const result = await controller.count(where);
      expect(result).to.deep.equal(countResult);
      expect(repoStub.count).to.have.been.calledOnceWith(where); 
    });

    it('counts all authors when no where clause is provided', async () => {
      const countResult = { count: 10 };
      repoStub.count.resolves(countResult);

      const result = await controller.count();
      expect(result).to.deep.equal(countResult);
      expect(repoStub.count).to.have.been.calledOnceWith(undefined);
    });
  });

  describe('find', () => {
    it('returns an array of authors', async () => {
      const filter = { where: { authorName: 'John' } };
      const authors = [
        { authorId: 1, authorName: 'John' },
        { authorId: 2, authorName: 'John Doe' },
      ] as Author[];
      repoStub.find.resolves(authors);

      const result = await controller.find(filter);
      expect(result).to.deep.equal(authors);
      expect(repoStub.find).to.have.been.calledOnceWith(filter); 
    });

    it('returns all authors when no filter is provided', async () => {
      const authors = [{ authorId: 1, authorName: 'Jane' }] as Author[];
      repoStub.find.resolves(authors);

      const result = await controller.find();
      expect(result).to.deep.equal(authors);
      expect(repoStub.find).to.have.been.calledOnceWith(undefined); 
    });
  });

  describe('updateAll', () => {
    it('updates all authors matching the where clause', async () => {
      const authorData = { authorName: 'Updated Name' } as Author; 
      const where = { authorName: 'John' };
      const countResult = { count: 3 };
      repoStub.updateAll.resolves(countResult);

      const result = await controller.updateAll(authorData, where);
      expect(result).to.deep.equal(countResult);
      expect(repoStub.updateAll).to.have.been.calledOnceWith(authorData, where); 
    });
  });

  describe('findById', () => {
    it('returns an author by ID', async () => {
      const id = 1;
      const filter = { fields: { authorName: true } };
      const author = { authorId: id, authorName: 'John Doe' } as Author;
      repoStub.findById.resolves(author);

      const result = await controller.findById(id, filter);
      expect(result).to.deep.equal(author);
      expect(repoStub.findById).to.have.been.calledOnceWith(id, filter); 
    });
  });

  describe('updateById', () => {
    it('updates an author by ID', async () => {
      const id = 1;
      const authorData = { authorName: 'Updated John' } as Author;
      repoStub.updateById.resolves();

      await controller.updateById(id, authorData);
      expect(repoStub.updateById).to.have.been.calledOnceWith(id, authorData);
    });
  });

  describe('replaceById', () => {
    it('replaces an author by ID', async () => {
      const id = 1;
      const authorData = { authorId: id, authorName: 'Replaced John' } as Author;
      repoStub.replaceById.resolves();

      await controller.replaceById(id, authorData);
      expect(repoStub.replaceById).to.have.been.calledOnceWith(id, authorData); 
    });
  });

  describe('deleteById', () => {
    it('deletes an author by ID', async () => {
      const id = 1;
      repoStub.deleteById.resolves();

      await controller.deleteById(id);
      expect(repoStub.deleteById).to.have.been.calledOnceWith(id); 
    });
  });
});