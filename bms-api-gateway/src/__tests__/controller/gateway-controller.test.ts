
import {expect} from 'chai';
import supertest from 'supertest';
import nock from 'nock';
import sinon from 'sinon';
import {BmsApplication} from '../../application'; // Adjust path as needed
import {setupApplication} from '../test-helper'; // Adjust path as needed
import dotenv from 'dotenv';
// import * as jwtLib from 'jsonwebtoken';
dotenv.config();

describe('GatewayController Integration Tests', () => {
  let app: BmsApplication;
  let client: any;
  let consoleErrorStub: sinon.SinonStub;

  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InIuY29tIiwicm9sZSI6IkFkbWluIiwicGVybWlzc2lvbnMiOlsiR0VUX0FVVEhPUiIsIlBPU1RfQVVUSE9SIiwiUEFUQ0hfQVVUSE9SIiwiREVMRVRFX0FVVEhPUiIsIkdFVF9BVVRIT1JfQllfSUQiLCJHRVRfQk9PSyIsIlBPU1RfQk9PSyIsIlBBVENIX0JPT0siLCJERUxFVEVfQk9PSyIsIkdFVF9CT09LX0JZX0lEIiwiR0VUX0NBVEVHT1JZIiwiUE9TVF9DQVRFR09SWSIsIlBBVENIX0NBVEVHT1JZIiwiREVMRVRFX0NBVEVHT1JZIiwiR0VUX0NBVEVHT1JZX0JZX0lEIl0sImlhdCI6MTc0NDE4MTQ0NH0.ql0D6hIwvTj3PdNkmtIA1pJaeSIBivsPrgEEQOcR0Kw'; // Mock bearer token
  const baseUrlAuthors = 'http://localhost:3001';
  const baseUrlBooks = 'http://localhost:3002';
  const baseUrlCategories = 'http://localhost:3003';

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
    // sinon.stub(jwtLib, 'verify').callsFake(() => ({ userId: 1, email: 'test@example.com' }));
    consoleErrorStub = sinon.stub(console, 'error');
  });

  after(async () => {
    await app.stop();
    consoleErrorStub.restore();
  });

  afterEach(() => {
    nock.cleanAll();
    sinon.restore();
  });

  const withAuth = (req: supertest.Request) =>
    req.set('Authorization', `Bearer ${mockToken}`);

  // Author Endpoints
  describe('Author Endpoints', () => {
    describe('GET /authors', () => {
      it('should return 200 with list of authors', async () => {
        const mockAuthors = {authodId: 1, authorName: 'John Doe'};
        nock(baseUrlAuthors).get('/authors').reply(200, mockAuthors);
        const res = await withAuth(client.get('/authors'));
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal({authodId: 1, authorName: 'John Doe'});
      });

      it('should return 500 if downstream service fails', async () => {
        nock(baseUrlAuthors).get('/').reply(500, {message: 'Server Error'});

        const res = await withAuth(client.get('/authors'));
        expect(res.status).to.equal(500);
        expect(res.body).to.have.property('error');
      });
    });

    describe('POST /authors', () => {
      it('should return 200 with created author', async () => {
        const mockAuthor = {authorName: 'Jane Doe'};

        nock(baseUrlAuthors)
          .post('/authors', mockAuthor)
          .reply(200, mockAuthor);
        const res = await withAuth(client.post('/authors').send(mockAuthor));
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal(mockAuthor);
      });

      it('should return 400 for invalid author data', async () => {
        const invalidAuthor = {authorName: ''};
        const res = await withAuth(client.post('/authors').send(invalidAuthor));
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property('error');
      });
    });

    describe('PATCH /authors/{id}', () => {
      it('should return 200 with updated author', async () => {
        const mockUpdate = {authorName: 'Jane Updated'};
        nock(baseUrlAuthors)
          .patch('/authors/1', mockUpdate)
          .reply(200, {authorId: 1, ...mockUpdate});

        const res = await withAuth(client.patch('/authors/1').send(mockUpdate));
        expect(res.status).to.equal(200);
        expect(res.body.authorName).to.equal('Jane Updated');
      });
    });

    describe('DELETE /authors/{id}', () => {
      it('should return 200 on successful deletion', async () => {
        nock(baseUrlAuthors)
          .delete('/authors/1')
          .reply(200, {message: 'Author deleted'});

        const res = await withAuth(client.delete('/authors/1'));
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('message', 'Author deleted');
      });
    });

    describe('GET /authors/{id}', () => {
      it('should return 200 with author details', async () => {
        const mockAuthor = {authorId: 1, authorName: 'John Doe'};
        nock(baseUrlAuthors).get('/authors/1').reply(200, mockAuthor);

        const res = await withAuth(client.get('/authors/1'));
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal(mockAuthor);
      });

      it('should return 404 if author not found', async () => {
        nock(baseUrlAuthors)
          .get('/authors/999')
          .reply(404, {message: 'Not Found'});

        const res = await withAuth(client.get('/authors/999'));
        expect(res.status).to.equal(404);
        expect(res.body).to.have.property('error');
      });
    });
  });

  // Book Endpoints
  describe('Book Endpoints', () => {
    describe('GET /books', () => {
      it('should return 200 with enriched book list', async () => {
        const mockBooks = [
          {bookId: 1, authorId: 1, categoryId: 1, title: 'Book 1'},
        ];
        const mockAuthor = {authorId: 1, authorName: 'John Doe'};
        const mockCategory = {categoryId: 1, genre: 'Fiction'};

        nock(baseUrlBooks).get('/books').reply(200, mockBooks);
        nock(baseUrlAuthors).get('/authors/1').reply(200, mockAuthor);
        nock(baseUrlCategories).get('/categories/1').reply(200, mockCategory);

        const res = await withAuth(client.get('/books'));
        expect(res.status).to.equal(200);
        expect(res.body[0]).to.deep.include({
          bookId: 1,
          title: 'Book 1',
          author: mockAuthor,
          category: mockCategory,
        });
      });
    });

    describe('POST /books', () => {
      it('should return 201 with created book', async () => {
        const mockBookInput = {
          title: 'New Book',
          authorName: 'John Doe',
          categoryName: 'Fiction',
        };
        const mockAuthor = {authorId: 1, authorName: 'John Doe'};
        const mockCategory = {categoryId: 1, genre: 'Fiction'};
        const mockBook = {
          bookId: 1,
          title: 'New Book',
          authorId: 1,
          categoryId: 1,
        };

        nock(baseUrlAuthors).get('/authors').reply(200, [mockAuthor]);
        nock(baseUrlCategories).get('/categories').reply(200, [mockCategory]);
        nock(baseUrlBooks)
          .post('/books', {title: 'New Book', authorId: 1, categoryId: 1})
          .reply(200, mockBook);

        const res = await withAuth(client.post('/books').send(mockBookInput));        
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.include({
          title: 'New Book',
          author: mockAuthor,
          category: mockCategory,
        });
      });      it('should return 404 if author not found', async () => {
        const mockBookInput = {title: 'New Book', authorName: 'Unknown'};
        nock(baseUrlAuthors).get('/authors').reply(200, []);

        const res = await withAuth(client.post('/books').send(mockBookInput));
        expect(res.status).to.equal(404);
        expect(res.body).to.have.property('error');
      });
    });

    describe('PATCH /books/{id}', () => {
      it('should return 200 with updated book', async () => {
        const mockUpdate = {title: 'Updated Book', authorName: 'John Doe'};
        const mockAuthor = {authorId: 1, authorName: 'John Doe'};
        const mockUpdatedBook = {bookId: 1, title: 'Updated Book', authorId: 1};

        nock(baseUrlAuthors).get('/authors').reply(200, [mockAuthor]);
        nock(baseUrlBooks)
          .patch('/books/1', {title: 'Updated Book', authorId: 1})
          .reply(200, mockUpdatedBook);

        const res = await withAuth(client.patch('/books/1').send(mockUpdate));
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.include(mockUpdatedBook);
      });
    });

    describe('DELETE /books/{id}', () => {
      it('should return 200 on successful deletion', async () => {
        nock(baseUrlBooks)
          .delete('/books/1')
          .reply(200, {message: 'Book deleted'});

        const res = await withAuth(client.delete('/books/1'));
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('message', 'Book deleted');
      });
    });

    describe('GET /books/{id}', () => {
      it('should return 200 with enriched book details', async () => {
        const mockBook = {
          bookId: 1,
          authorId: 1,
          categoryId: 1,
          title: 'Book 1',
        };
        const mockAuthor = {authorId: 1, authorName: 'John Doe'};
        const mockCategory = {categoryId: 1, genre: 'Fiction'};

        nock(baseUrlBooks).get('/books/1').reply(200, mockBook);
        nock(baseUrlAuthors).get('/authors/1').reply(200, mockAuthor);
        nock(baseUrlCategories).get('/categories/1').reply(200, mockCategory);

        const res = await withAuth(client.get('/books/1'));
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.include({
          ...mockBook,
          author: mockAuthor,
          category: mockCategory,
        });
      });
    });
  });

  // Category Endpoints
  describe('Category Endpoints', () => {
    describe('GET /categories', () => {
      it('should return 200 with list of categories', async () => {
        const mockCategories = [{categoryId: 1, genre: 'Fiction'}];
        nock(baseUrlCategories).get('/categories').reply(200, mockCategories);

        const res = await withAuth(client.get('/categories'));
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal(mockCategories);
      });
    });

    describe('POST /categories', () => {
      it('should return 201 with created category', async () => {
        const mockCategory = {categoryId: 1, genre: 'Non-Fiction'};
        nock(baseUrlCategories)
          .post('/categories', mockCategory)
          .reply(200, mockCategory);

        const res = await withAuth(
          client.post('/categories').send(mockCategory),
        );
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal(mockCategory);
      });
    });

    describe('PATCH /categories/{id}', () => {
      it('should return 200 with updated category', async () => {
        const mockUpdate = {genre: 'Updated Genre'};
        nock(baseUrlCategories)
          .patch('/categories/1', mockUpdate)
          .reply(200, {categoryId: 1, ...mockUpdate});

        const res = await withAuth(
          client.patch('/categories/1').send(mockUpdate),
        );
        expect(res.status).to.equal(200);
        expect(res.body.genre).to.equal('Updated Genre');
      });
    });

    describe('DELETE /categories/{id}', () => {
      it('should return 200 on successful deletion', async () => {
        nock(baseUrlCategories)
          .delete('/categories/1')
          .reply(200, {message: 'Category deleted'});

        const res = await withAuth(client.delete('/categories/1'));
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('message', 'Category deleted');
      });
    });

    describe('GET /categories/{id}', () => {
      it('should return 200 with category details', async () => {
        const mockCategory = {categoryId: 1, genre: 'Fiction'};
        nock(baseUrlCategories).get('/categories/1').reply(200, mockCategory);

        const res = await withAuth(client.get('/categories/1'));
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal(mockCategory);
      });
    });
  });
});