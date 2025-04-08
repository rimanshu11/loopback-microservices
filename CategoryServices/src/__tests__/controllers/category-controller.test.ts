import {expect} from 'chai';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {describe, it, beforeEach} from 'mocha';
import { CategoryController } from '../../controllers';
import { Category } from '../../models';
import { CategoryRepository } from '../../repositories';

chai.use(sinonChai); // Enable sinon-chai once

describe('AuthorController Unit Tests', () => {
  let controller: CategoryController;
  let repoStub: sinon.SinonStubbedInstance<CategoryRepository>;

  beforeEach(() => {
    repoStub = sinon.createStubInstance(CategoryRepository);
    controller = new CategoryController(repoStub);
  });

  describe('create', () => {
    it('creates a new category successfully', async () => {
      const authorData = { genre: 'Fiction' } as Omit<Category, 'authorId'>;
      const createdAuthor = { categoryId: 1, genre: 'John Doe' } as Category;
      repoStub.create.resolves(createdAuthor);

      const result = await controller.create(authorData);
      expect(result).to.deep.equal(createdAuthor);
      expect(repoStub.create).to.have.been.calledOnceWith(authorData); 
    });
  });

  describe('count', () => {
    it('returns the count of category', async () => {
      const where = { genre: 'Fiction' };
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
    it('returns an array of categories', async () => {
      const filter = { where: { genre: 'Novel' } };
      const authors = [
        { categoryId: 1, genre: 'Fiction' },
        { categoryId: 2, genre: 'Horror' },
      ] as Category[];
      repoStub.find.resolves(authors);

      const result = await controller.find(filter);
      expect(result).to.deep.equal(authors);
      expect(repoStub.find).to.have.been.calledOnceWith(filter); 
    });

    it('returns all category when no filter is provided', async () => {
      const authors = [{ categoryId: 1, genre: 'Jane' }] as Category[];
      repoStub.find.resolves(authors);

      const result = await controller.find();
      expect(result).to.deep.equal(authors);
      expect(repoStub.find).to.have.been.calledOnceWith(undefined); 
    });
  });

  describe('updateAll', () => {
    it('updates all categories matching the where clause', async () => {
      const categoryData = { genre: 'Updated Name' } as Category; 
      const where = { genre: 'John' };
      const countResult = { count: 3 };
      repoStub.updateAll.resolves(countResult);

      const result = await controller.updateAll(categoryData, where);
      expect(result).to.deep.equal(countResult);
      expect(repoStub.updateAll).to.have.been.calledOnceWith(categoryData, where); 
    });
  });

  describe('findById', () => {
    it('returns an category by ID', async () => {
      const id = 1;
      const filter = { fields: { genre: true } };
      const author = { categoryId: id, genre: 'Novel' } as Category;
      repoStub.findById.resolves(author);

      const result = await controller.findById(id, filter);
      expect(result).to.deep.equal(author);
      expect(repoStub.findById).to.have.been.calledOnceWith(id, filter); 
    });
  });

  describe('updateById', () => {
    it('updates an category by ID', async () => {
      const id = 1;
      const categoryData = { genre: 'Fiction' } as Category;
      repoStub.updateById.resolves();

      await controller.updateById(id, categoryData);
      expect(repoStub.updateById).to.have.been.calledOnceWith(id, categoryData);
    });
  });

  describe('replaceById', () => {
    it('replaces an category by ID', async () => {
      const id = 1;
      const categoryData = { categoryId: id, genre: 'Replaced John' } as Category;
      repoStub.replaceById.resolves();

      await controller.replaceById(id, categoryData);
      expect(repoStub.replaceById).to.have.been.calledOnceWith(id, categoryData); 
    });
  });

  describe('deleteById', () => {
    it('deletes an category by ID', async () => {
      const id = 1;
      repoStub.deleteById.resolves();

      await controller.deleteById(id);
      expect(repoStub.deleteById).to.have.been.calledOnceWith(id); 
    });
  });

});