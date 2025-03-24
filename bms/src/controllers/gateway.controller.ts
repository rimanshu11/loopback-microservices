import {del, get, param, patch, post, requestBody} from '@loopback/rest';
import axios from 'axios';

export class GatewayController {
  // API gateway url for Author Service
  @get('/authors')
  async getAuthors(): Promise<any> {
    const response = await axios.get('http://localhost:3001/authors');
    return response.data;
  }
  @post('/authors')
  async postAuthors(@requestBody() authorData:any): Promise<any> {
    const response = await axios.post('http://localhost:3001/authors',authorData);
    return response.data;
  }
  @patch('/authors/{id}')
  async updateAuthor(
    @param.path.string('id') id: string,
    @requestBody() authorData: any,
  ): Promise<any> {
    const response = await axios.patch(`http://localhost:3001/authors/${id}`, authorData);
    return response.data;
  }
  @del('/authors/{id}')
  async deleteAuthor(
    @param.path.number('id') id:number
  ):Promise<any>{
    const response= await axios.delete(`http://localhost:3001/authors/${id}`)
    return response.data;
  }

  @get('/authors/{id}')
  async getAuthorById(@param.path.string('id') id: string): Promise<any> {
    const response = await axios.get(`http://localhost:3001/authors/${id}`);
    return response.data;
  }

  // API gateway url for Book Service
  @get('/books')
  async getBooks(): Promise<any> {
    const response = await axios.get('http://localhost:3002/books');
    return response.data;
  }
  @post('/books')
  async postBooks(@requestBody() bookData:any): Promise<any> {
    const response = await axios.post('http://localhost:3002/books',bookData);
    console.log("response book",response);
    
    return response.data;
  }
  @patch('/books/{id}')
  async updateBook(
    @param.path.string('id') id: string,
    @requestBody() bookData: any,
  ): Promise<any> {
    const response = await axios.patch(`http://localhost:3002/books/${id}`, bookData);
    return response.data;
  }
  @del('/books/{id}')
  async deleteBook(
    @param.path.string('id') id:string
  ):Promise<any>{
    const response= await axios.delete(`http://localhost:3002/books/${id}`)
    return response.data;
  }
  @get('/books/{id}')
  async getBookById(@param.path.string('id') id: string): Promise<any> {
    const response = await axios.get(`http://localhost:3002/books/${id}`);
    return response.data;
  }

  // API gateway url for Category Service
  @get('/categories')
  async getCategories(): Promise<any> {
    const response = await axios.get('http://localhost:3003/categories');
    return response.data;
  }
  @post('/categories')
  async categoryPost(@requestBody() categoryData:any): Promise<any> {
    const response = await axios.post('http://localhost:3003/categories',categoryData);
    return response.data;
  }
  @patch('/categories/{id}')
  async updateCategory(
    @param.path.string('id') id: string,
    @requestBody() categoryData: any,
  ): Promise<any> {
    const response = await axios.patch(`http://localhost:3003/categories/${id}`, categoryData);
    return response.data;
  }
  @del('/categories/{id}')
  async deleteCategory(
    @param.path.number('id') id:number
  ):Promise<any>{
    const response= await axios.delete(`http://localhost:3003/categories/${id}`)
    return response.data;
  }
  @get('/categories/{id}')
  async getCategoryById(@param.path.string('id') id: string): Promise<any> {
    const response = await axios.get(`http://localhost:3003/categories/${id}`);
    return response.data;
  }
}