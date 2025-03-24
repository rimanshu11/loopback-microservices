import { /* inject, */ BindingScope, injectable, Provider} from '@loopback/core';

/*
 * Fix the service type. Possible options can be:
 * - import {Bms} from 'your-module';
 * - export type Bms = string;
 * - export interface Bms {}
 */
export type Bms = unknown;

@injectable({scope: BindingScope.TRANSIENT})
export class BmsProvider implements Provider<Bms> {
  constructor(/* Add @inject to inject parameters */) { }

  value() {
    // Add your implementation here
    throw new Error('To be implemented');
  }
}
