import {Provider} from '@loopback/context';
import {verify} from 'jsonwebtoken';
import {VerifyFunction} from 'loopback4-authentication';

interface IAuthUser {
  email: string;
  username: string;
  role: 'Admin' | 'User' | 'Other'; 
  permissions: string[]; 
  iat: number;
}

export class BearerTokenVerifyProvider
  implements Provider<VerifyFunction.BearerFn>
{
  constructor() {}

  value(): VerifyFunction.BearerFn {    
    return async token => {        
      try {
        const user = verify(token, process.env.JWT_SECRET as string) as IAuthUser;
        return user;
      } catch (error) {
        console.error("Error verifying token:", error);
        throw new Error("Invalid token");
      }
    };
  }
}
