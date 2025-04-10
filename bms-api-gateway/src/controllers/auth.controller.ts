import {post, requestBody, HttpErrors} from '@loopback/rest';
import axios from 'axios';
import dotenv from 'dotenv';
import {Validation} from '../validation/user.validation'; // Adjust the path if needed

dotenv.config();

interface UserData {
  username?: string;
  email: string;
  password: string;
  role?: string;
}

export class AuthController {
  constructor() {}

  @post('/signup')
  async postSignup(@requestBody() userData: UserData): Promise<UserData> {
    try {
      // Validate user data
      // console.log("UserData:", userData);

      Validation.verifySignupData(userData);

      // Make downstream request
      const response = await axios.post(
        `${process.env.BASE_URL_USER_SIGNUP}`,
        userData,
      );
      return response.data;
    } catch (error) {
      // Catch thrown validation errors
      if (error instanceof HttpErrors.HttpError) {
        console.log('Error from Signup', error.status);
        throw error;
      }

      // Handle Axios errors from downstream service
      if (axios.isAxiosError(error) && error.response) {
        console.log('Error from Signup axios', error.status);
        const status = error.response.status;
        const message =
          error.response.data?.message || 'Downstream service error';

        switch (status) {
          case 400:
            throw new HttpErrors.BadRequest(message);
          case 401:
            throw new HttpErrors.Unauthorized(message);
          case 403:
            throw new HttpErrors.Forbidden(message);
          default:
            throw new HttpErrors.InternalServerError(message);
        }
      }
      // Any other unknown error
      throw new HttpErrors.InternalServerError(
        `Failed to create user: ${error.message}`,
      );
    }
  }

  @post('/login')
  async postLogin(@requestBody() userData: UserData): Promise<object> {
    try {
      Validation.validateEmail(userData.email);
      Validation.validatePassword(userData.password);

      const response = await axios.post(
        `${process.env.BASE_URL_USER_LOGIN}`,
        userData,
      );
      return response.data;
    } catch (error) {
      if (error instanceof HttpErrors.HttpError) {
        throw error;
      }

      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const message =
          error.response.data?.message || 'Downstream login error';

        switch (status) {
          case 400:
            throw new HttpErrors.BadRequest(message);
          case 401:
            throw new HttpErrors.Unauthorized(message);
          case 403:
            throw new HttpErrors.Forbidden(message);
          case 422:
            throw new HttpErrors.UnprocessableEntity(message);
          default:
            throw new HttpErrors.InternalServerError(message);
        }
      }

      throw new HttpErrors.InternalServerError(
        `Failed to login: ${error.message}`,
      );
    }
  }
}
