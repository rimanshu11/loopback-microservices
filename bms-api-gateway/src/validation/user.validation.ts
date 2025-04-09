import { HttpErrors } from '@loopback/rest';

interface IUser {
  email?: string;
  username?: string;
  password?: string;
  role?: string;
}
export class Validation {
  static allowedRoles = ['User', 'Admin', 'Librarian'];

  static verifySignupData(signupData: IUser): void {
    if (!signupData.email || !this.validateEmail(signupData.email)) {
      throw new HttpErrors.UnprocessableEntity('Invalid email format');
    }

    if (!signupData.password || signupData.password.length < 8) {
      throw new HttpErrors.UnprocessableEntity('Password must be at least 8 characters long');
    }

    if (!signupData.role || !this.allowedRoles.includes(signupData.role)) {
      throw new HttpErrors.UnprocessableEntity('Invalid or missing role');
    }
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): boolean {
    return typeof password === 'string' && password.length >= 8;
  }
}
