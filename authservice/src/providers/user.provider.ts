import {Provider} from '@loopback/context';
import {verify} from 'jsonwebtoken';
import {VerifyFunction} from 'loopback4-authentication';
import {User} from '../models/user.model';

export class BearerTokenVerifyProvider
  implements Provider<VerifyFunction.BearerFn>
{
  constructor(  ) {}

  value(): VerifyFunction.BearerFn {
    console.log('log in provider');
    
    return async token => {
        console.log("Token from provider",token);
        
      const user = verify(token, 'your-jwt-secret', {
        issuer: process.env.JWT_ISSUER,
      }) as User;

      return user;
    };
  }
}