import { expect } from 'chai';
import supertest from 'supertest';
import request from 'supertest';

const gatewayUrl = 'http://localhost:3000';

const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJpbTNAcmltLmNvbSIsInJvbGUiOiJBZG1pbiIsInBlcm1pc3Npb25zIjpbIkdFVF9BVVRIT1IiLCJQT1NUX0FVVEhPUiIsIlBBVENIX0FVVEhPUiIsIkRFTEVURV9BVVRIT1IiLCJHRVRfQVVUSE9SX0JZX0lEIiwiR0VUX0JPT0siLCJQT1NUX0JPT0siLCJQQVRDSF9CT09LIiwiREVMRVRFX0JPT0siLCJHRVRfQk9PS19CWV9JRCIsIkdFVF9DQVRFR09SWSIsIlBPU1RfQ0FURUdPUlkiLCJQQVRDSF9DQVRFR09SWSIsIkRFTEVURV9DQVRFR09SWSIsIkdFVF9DQVRFR09SWV9CWV9JRCJdLCJpYXQiOjE3NDQyNjkxMTN9.0JClARq8gdPHpywdcj2IZohoVwlM6JrbinPL4UwRY3o'; // Mock bearer token

  const withAuth = (req: supertest.Request) =>
    req.set('Authorization', `Bearer ${mockToken}`);

describe('E2E: Book Management Flow', () => {
  it('should create author, category, and book via API Gateway', async () => {
    // 1. Create Author
    const authorRes = await withAuth(request(gatewayUrl)
      .post('/authors')
      .send({ authorName: 'E2E Author' }));
    // console.log("authorRes", authorRes.body);
    const authorName=  authorRes.body.authorName
    expect(authorRes.status).to.equal(200);
    const authorId = authorRes.body.authorId;

    // 2. Create Category
    const categoryRes = await withAuth(request(gatewayUrl)
      .post('/categories')
      .send({ genre: 'E2E Category' }));
    //   console.log("categoryRes", categoryRes.body);
      const categoryName = categoryRes.body.genre
    expect(categoryRes.status).to.equal(200);
    const categoryId = categoryRes.body.categoryId;

    // 3. Create Book
    const bookRes = await withAuth(request(gatewayUrl)
      .post('/books')
      .send({
        title: 'E2E Book',
        isbn: '1234567890123',
        price: 121,
        publicationDate: "2018-11-01T00:00:00.000Z",
        authorName: authorName,
        categoryName: categoryName,
      }));
    //   console.log("bookRes", bookRes.body, bookRes.status);
    //   console.log("bookResAll", bookRes);

    expect(bookRes.status).to.equal(200);
    const bookId = bookRes.body.bookId;

    // 4. Fetch Book
    const getBookRes = await withAuth(request(gatewayUrl).get(`/books/${bookId}`));
    // console.log("getBookRes", getBookRes.body);
    
    expect(getBookRes.status).to.equal(200);
    expect(getBookRes.body.title).to.equal('E2E Book');
    expect(getBookRes.body.authorId).to.equal(authorId);
    expect(getBookRes.body.categoryId).to.equal(categoryId);
  });
});
