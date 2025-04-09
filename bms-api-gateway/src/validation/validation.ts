import {HttpErrors} from '@loopback/rest';

interface AuthorData {
  authorName: string;
}

interface AuthorPatchData {
  authorName?: string;
}

interface BookData {
  title?: string;
  isbn?: string;
  price?: number;
  authorName?: string;
  categoryName?: string;
}

interface BookPatchData {
  title?: string;
  isbn?: string;
  price: number;
  authorName?: string;
  categoryName?: string;
}

interface CategoryData {
  categoryName: string;
}

interface CategoryPatchData {
  categoryName?: string;
}

// Author Validation
export const validateAuthorPost = (data: AuthorData): void => {
  if (!data || typeof data !== 'object') {
    throw new HttpErrors.BadRequest('Request body must be an object');
  }
  if (!data.authorName || typeof data.authorName !== 'string') {
    throw new HttpErrors.BadRequest('Name is required and must be a string');
  }
};

export const validateAuthorPatch = (data: Partial<AuthorPatchData>): void => {
  if (!data || typeof data !== 'object') {
    throw new HttpErrors.BadRequest('Request body must be an object');
  }
  if (data.authorName && typeof data.authorName !== 'string') {
    throw new HttpErrors.BadRequest('Name must be a string');
  }
};

// Book Validation
export const validateBookPost = (data: BookData): void => {  
  if (!data || typeof data !== 'object') {
    throw new HttpErrors.BadRequest('Request body must be an object');
  }
  if (!data.title || typeof data.title !== 'string') {
    throw new HttpErrors.BadRequest('Title is required and must be a string');
  }
  if (!data.isbn || typeof data.isbn !== 'string') {
    throw new HttpErrors.BadRequest('ISBN is required and at least 13');
  }
  if (!data.price || typeof data.price !== 'number') {
    throw new HttpErrors.BadRequest('Price is required');
  }
  if (!data.authorName || typeof data.authorName !== 'string') {
    throw new HttpErrors.BadRequest('Author name is required and must be a string');
  }
  if (data.categoryName && typeof data.categoryName !== 'string') {
    throw new HttpErrors.BadRequest('Category name must be a string');
  }
};

export const validateBookPatch = (data: Partial<BookPatchData>): void => {
  if (!data || typeof data !== 'object') {
    throw new HttpErrors.BadRequest('Request body must be an object');
  }
  if (data.title && typeof data.title !== 'string') {
    throw new HttpErrors.BadRequest('Title must be a string');
  }
  if (data.isbn && typeof data.isbn !== 'string') {
    throw new HttpErrors.BadRequest('ISBN must be a string');
  }
  if (data.price && typeof data.price !== 'number') {
    throw new HttpErrors.BadRequest('Price must be a number');
  }
  if (data.authorName && typeof data.authorName !== 'string') {
    throw new HttpErrors.BadRequest('Author name must be a string');
  }
  if (data.categoryName && typeof data.categoryName !== 'string') {
    throw new HttpErrors.BadRequest('Category name must be a string');
  }
};

// Category Validation
export const validateCategoryPost = (data: CategoryData): void => {
  if (!data || typeof data !== 'object') {
    throw new HttpErrors.BadRequest('Request body must be an object');
  }
  console.log("Data:", data);
  
  if (!data.categoryName || typeof data.categoryName !== 'string') {
    throw new HttpErrors.BadRequest('Genre is required and must be a string');
  }
};

export const validateCategoryPatch = (data: Partial<CategoryPatchData>): void => {
  if (!data || typeof data !== 'object') {
    throw new HttpErrors.BadRequest('Request body must be an object');
  }
  if (data.categoryName && typeof data.categoryName !== 'string') {
    throw new HttpErrors.BadRequest('Name must be a string');
  }
};

export { AuthorData, AuthorPatchData, BookData, BookPatchData, CategoryData, CategoryPatchData };