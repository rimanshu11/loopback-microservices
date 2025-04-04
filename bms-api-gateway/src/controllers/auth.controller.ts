import { post, requestBody } from '@loopback/rest';
import axios from 'axios';
import { HttpErrors } from '@loopback/rest';
import dotenv from 'dotenv';
import { Validation } from '../validation/user.validation'; // Adjust the path if needed

dotenv.config();


export class AuthController {
  constructor() {}

  @post('/signup')
  async postSignup(@requestBody() userData: any): Promise<any> {
    try {
      // Validate email and password
      Validation.validateEmail(userData.email);
      Validation.validatePassword(userData.password);

      console.log('Signup endpoint hit with data:', userData);
      console.log('URL:', process.env.BASE_URL_USER_SIGNUP);

      // Make the downstream request
      const response = await axios.post(`${process.env.BASE_URL_USER_SIGNUP}`, userData);
      return response.data;
    } catch (error) {
      if (error instanceof HttpErrors.HttpError) throw error;
      throw new HttpErrors.InternalServerError(`Failed to create user: ${error.message}`);
    }
  }
  @post('/login')
  async postLogin(@requestBody() userData: any): Promise<any> {
    try {
      // Validate email and password
      Validation.validateEmail(userData.email);
      Validation.validatePassword(userData.password);
      const response = await axios.post(`${process.env.BASE_URL_USER_LOGIN}`, userData);
      return response.data;
    } catch (error) {
      if (error instanceof HttpErrors.HttpError) throw error;
      throw new HttpErrors.InternalServerError(`Failed to create user: ${error.message}`);
    }
  }
}
