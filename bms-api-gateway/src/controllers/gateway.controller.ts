import {del, get, param, patch, post, requestBody} from '@loopback/rest';
import axios from 'axios';
import {
  validateAuthorPost,
  validateAuthorPatch,
  validateBookPatch,
  validateBookPost,
} from '../validation/validation';
import {HttpErrors} from '@loopback/rest';
import dotenv from 'dotenv';
import {authenticate, STRATEGY} from 'loopback4-authentication';
import {authorize} from 'loopback4-authorization';

dotenv.config();

interface AuthorData {
  authorName: string;
  authorId: number;
}
interface CategoryData {
  genre: string;
  categoryId: number;
}
interface BookDetails {
  bookId?: number; // optional, in case it's not present during creation
  title?: string;
  isbn?: string;
  price?: number;
  discountPrice?: number;
  publicationDate?: string; // or Date if using native Date object
  authorId?: number;
  categoryId?: number;
  author?: {
    authorId: number;
    authorName: string;
  };
  category?: {
    categoryId: number;
    genre: string;
  };
  authorName?: string; // flattened form
  categoryName?: string; // flattened form
}

export class GatewayController {
  // function to fetch author by name
  private async getAuthorByName(name: string): Promise<AuthorData> {
    try {
      const response = await axios.get(`${process.env.BASE_URL_AUTHORS}`);
      const authors = response.data;
      const author = authors.find(
        (a: AuthorData) => a.authorName.toLowerCase() === name.toLowerCase(),
      );
      if (!author) {
        throw new HttpErrors.NotFound(`Author with name "${name}" not found`);
      }
      return author;
    } catch (error) {
      if (error instanceof HttpErrors.HttpError) throw error;
      throw new HttpErrors.InternalServerError(
        `Failed to fetch authors: ${error.message}`,
      );
    }
  }

  // function to fetch category by name
  private async getCategoryByName(genre: string): Promise<CategoryData> {
    try {
      const response = await axios.get(`${process.env.BASE_URL_CATEGORIES}`);
      const categories = response.data;
      const category = categories.find(
        (c: CategoryData) => c.genre.toLowerCase() === genre.toLowerCase(),
      );
      if (!category) {
        throw new HttpErrors.NotFound(
          `Category with name "${genre}" not found`,
        );
      }
      return category;
    } catch (error) {
      if (error instanceof HttpErrors.HttpError) throw error;
      throw new HttpErrors.InternalServerError(
        `Failed to fetch categories: ${error.message}`,
      );
    }
  }

  // Author Endpoints
  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['GET_AUTHOR']})
  @get('/authors')
  async getAuthors(): Promise<[]> {
    try {
      const response = await axios.get(`${process.env.BASE_URL_AUTHORS}`);
      return response.data;
    } catch (error) {
      throw new HttpErrors.InternalServerError(
        `Failed to retrieve authors: ${error.message}`,
      );
    }
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['POST_AUTHOR']})
  @post('/authors')
  async postAuthors(@requestBody() authorData: AuthorData): Promise<object> {
    try {
      validateAuthorPost(authorData);
      console.log('Author data from controller:', authorData);

      const response = await axios.post(
        `${process.env.BASE_URL_AUTHORS}`,
        authorData,
      );
      return response.data;
    } catch (error) {
      if (error instanceof HttpErrors.HttpError) throw error;
      throw new HttpErrors.InternalServerError(
        `Failed to create author: ${error.message}`,
      );
    }
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['PATCH_AUTHOR']})
  @patch('/authors/{id}')
  async updateAuthor(
    @param.path.string('id') id: string,
    @requestBody() authorData: object,
  ): Promise<object> {
    try {
      validateAuthorPatch(authorData);
      const response = await axios.patch(
        `${process.env.BASE_URL_AUTHORS}/${id}`,
        authorData,
      );
      return response.data;
    } catch (error) {
      if (error instanceof HttpErrors.HttpError) throw error;
      throw new HttpErrors.InternalServerError(
        `Failed to update author: ${error.message}`,
      );
    }
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['DELETE_AUTHOR']})
  @del('/authors/{id}')
  async deleteAuthor(@param.path.number('id') id: number): Promise<object> {
    try {
      const response = await axios.delete(
        `${process.env.BASE_URL_AUTHORS}/${id}`,
      );
      return response.data;
    } catch (error) {
      throw new HttpErrors.InternalServerError(
        `Failed to delete author: ${error.message}`,
      );
    }
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['GET_AUTHOR_BY_ID']})
  @get('/authors/{id}')
  async getAuthorById(@param.path.string('id') id: string): Promise<object> {
    try {
      const response = await axios.get(`${process.env.BASE_URL_AUTHORS}/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new HttpErrors.NotFound(`Author with ID "${id}" not found`);
      }
      throw new HttpErrors.InternalServerError(
        `Failed to retrieve author: ${error.message}`,
      );
    }
  }

  // Book Endpoints
  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['GET_BOOK']})
  @get('/books')
  async getBooks(): Promise<object> {
    try {
      const booksResponse = await axios.get(`${process.env.BASE_URL_BOOKS}`);
      const books = booksResponse.data;
      // console.log("Books:",books);

      const enrichedBooks = await Promise.all(
        books.map(async (book: BookDetails) => {
          try {
            const author = await axios
              .get(`${process.env.BASE_URL_AUTHORS}/${book.authorId}`)
              .then(res => res.data);
            const category = book.categoryId
              ? await axios
                  .get(`${process.env.BASE_URL_CATEGORIES}/${book.categoryId}`)
                  .then(res => res.data)
              : null;
            return {...book, author, category};
          } catch (error) {
            console.log('Error:', error);
            throw new HttpErrors.InternalServerError(
              `Failed to enrich books: ${error.message}`,
            );
          }
        }),
      );
      return enrichedBooks;
    } catch (error) {
      if (error instanceof HttpErrors.HttpError) throw error;
      throw new HttpErrors.InternalServerError(
        `Failed to retrieve books: ${error.message}`,
      );
    }
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['POST_BOOK']})
  @post('/books')
  async postBooks(@requestBody() bookData: BookDetails): Promise<BookDetails> {
    try {
      // validateBookPost(bookData);
      console.log("bookData from controller:",bookData);
      const author = await this.getAuthorByName(bookData.authorName!);
      const authorId = author?.authorId;

      let categoryId = null;
      let category = null;
      if (bookData.categoryName!) {
        category = await this.getCategoryByName(bookData.categoryName!);
        categoryId = category?.categoryId;
      }

      delete bookData.authorName;
      delete bookData.categoryName;
      const bookDataPayload = {...bookData, authorId, categoryId};

      const response = await axios.post(
        process.env.BASE_URL_BOOKS as string,
        bookDataPayload,
      );
      const createdBook = response.data;

      return {...createdBook, author, category};
    } catch (error) {
      if (error instanceof HttpErrors.HttpError) throw error;
      throw new HttpErrors.InternalServerError(
        `Failed to create book: ${error.message}`,
      );
    }
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['PATCH_BOOK']})
  @patch('/books/{id}')
  async updateBook(
    @param.path.string('id') id: string,
    @requestBody() bookData: Partial<BookDetails>,
  ): Promise<BookDetails> {
    try {
      validateBookPatch(bookData);

      const updatedData: Partial<BookDetails> = {};

      if (bookData.title) updatedData.title = bookData.title;
      if (bookData.isbn) updatedData.isbn = bookData.isbn;
      if (bookData.publicationDate)
        updatedData.publicationDate = bookData.publicationDate;
      if (bookData.price !== undefined) updatedData.price = bookData.price;
      if (bookData.discountPrice !== undefined)
        updatedData.discountPrice = bookData.discountPrice;

      if (bookData.authorName) {
        const author = await this.getAuthorByName(bookData.authorName);
        updatedData.authorId = author.authorId;
      }

      if (bookData.categoryName) {
        const category = await this.getCategoryByName(bookData.categoryName);
        updatedData.categoryId = category.categoryId;
      }

      const response = await axios.patch(
        `${process.env.BASE_URL_BOOKS}/${id}`,
        updatedData,
      );
      return response.data;
    } catch (error) {
      if (error instanceof HttpErrors.HttpError) throw error;
      throw new HttpErrors.InternalServerError(
        `Failed to update book: ${error.message}`,
      );
    }
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['DELETE_BOOK']})
  @del('/books/{id}')
  async deleteBook(@param.path.string('id') id: string): Promise<BookDetails> {
    try {
      const response = await axios.delete(
        `${process.env.BASE_URL_BOOKS}/${id}`,
      );
      return response.data;
    } catch (error) {
      throw new HttpErrors.InternalServerError(
        `Failed to delete book: ${error.message}`,
      );
    }
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['GET_BOOK_BY_ID']})
  @get('/books/{id}')
  async getBookById(@param.path.string('id') id: string): Promise<BookDetails> {
    try {
      const bookResponse = await axios.get(
        `${process.env.BASE_URL_BOOKS}/${id}`,
      );
      const book = bookResponse.data;

      const author = await axios
        .get(`${process.env.BASE_URL_AUTHORS}/${book.authorId}`)
        .then(res => res.data);
      const category = book.categoryId
        ? await axios
            .get(`${process.env.BASE_URL_CATEGORIES}/${book.categoryId}`)
            .then(res => res.data)
        : null;

      return {...book, author, category};
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new HttpErrors.NotFound(`Book with ID "${id}" not found`);
      }
      throw new HttpErrors.InternalServerError(
        `Failed to retrieve book: ${error.message}`,
      );
    }
  }

  // Category Endpoints
  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['GET_CATEGORY']})
  @get('/categories')
  async getCategories(): Promise<CategoryData> {
    try {
      const response = await axios.get(`${process.env.BASE_URL_CATEGORIES}`);
      return response.data;
    } catch (error) {
      throw new HttpErrors.InternalServerError(
        `Failed to retrieve categories: ${error.message}`,
      );
    }
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['POST_CATEGORY']})
  @post('/categories')
  async categoryPost(
    @requestBody() categoryData: CategoryData,
  ): Promise<CategoryData> {
    try {
      // validateCategoryPost(categoryData);      
      const response = await axios.post(
        `${process.env.BASE_URL_CATEGORIES}`,
        categoryData,
      );
      return response.data;
    } catch (error) {
      if (error instanceof HttpErrors.HttpError) throw error;
      throw new HttpErrors.InternalServerError(
        `Failed to create category: ${error.message}`,
      );
    }
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['PATCH_BOOK']})
  @patch('/categories/{id}')
  async updateCategory(
    @param.path.string('id') id: string,
    @requestBody() categoryData: CategoryData,
  ): Promise<CategoryData> {
    try {
      // validateCategoryPatch(categoryData);
      const response = await axios.patch(
        `${process.env.BASE_URL_CATEGORIES}/${id}`,
        categoryData,
      );
      return response.data;
    } catch (error) {
      if (error instanceof HttpErrors.HttpError) throw error;
      throw new HttpErrors.InternalServerError(
        `Failed to update category: ${error.message}`,
      );
    }
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['DELETE_BOOK']})
  @del('/categories/{id}')
  async deleteCategory(
    @param.path.number('id') id: number,
  ): Promise<CategoryData> {
    try {
      const response = await axios.delete(
        `${process.env.BASE_URL_CATEGORIES}/${id}`,
      );
      return response.data;
    } catch (error) {
      throw new HttpErrors.InternalServerError(
        `Failed to delete category: ${error.message}`,
      );
    }
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['GET_CATEGORY_BY_ID']})
  @get('/categories/{id}')
  async getCategoryById(
    @param.path.string('id') id: string,
  ): Promise<CategoryData> {
    try {
      const response = await axios.get(
        `${process.env.BASE_URL_CATEGORIES}/${id}`,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new HttpErrors.NotFound(`Category with ID "${id}" not found`);
      }
      throw new HttpErrors.InternalServerError(
        `Failed to retrieve category: ${error.message}`,
      );
    }
  }
}
