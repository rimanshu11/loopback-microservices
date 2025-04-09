import {expect} from 'chai';
import nock from 'nock';
import sinon from 'sinon';
import {BmsApplication} from '../../application';
import {setupApplication} from '../test-helper';
import dotenv from 'dotenv';

dotenv.config();

// auth controller integration testing
describe('AuthController Integration Tests', () => {
  let app: BmsApplication;
  let client: any;
  let consoleErrorStub: sinon.SinonStub;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
    consoleErrorStub = sinon.stub(console, 'error');
  });

  after(async () => {
    await app.stop();
    consoleErrorStub.restore();
  });

  afterEach(() => {
    nock.cleanAll();
    sinon.restore();
  });

  // signup integration testing

  describe('POST /signup', () => {
    it('should return 201 with user data when signup succeeds', async () => {
      const mockUser = {
        username: 'rim',
        email: 'test1@example.com',
        password: 'Password@123',
        role: 'Admin',
      };
      nock('http://127.0.0.1:3004')
        .post('/jwt/auth/signup', mockUser)
        .reply(201, {
          message: 'User created successfully',
          user: {id: 1, email: mockUser.email},
        });

      const res = await client
        .post('/signup')
        .send(mockUser)
        .set('Accept', 'application/json');
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message', 'User created successfully');
      expect(res.body.user).to.have.property('email', mockUser.email);
      expect(res.body.user).to.have.property('id').that.is.a('number');
    });

    it('should return 500 if signup fails downstream', async () => {
      const mockUser = {
        email: 'fail@example.com',
        password: 'Password@123',
      };

      nock('http://127.0.0.1:3004')
        .post('/jwt/auth/signup', mockUser)
        .reply(500, {message: 'Internal Server Error'});

      const res = await client
        .post('/signup')
        .send(mockUser)
        .set('Accept', 'application/json');
      expect(res.status).to.equal(422);
      expect(res.body).to.have.property('error');
    });

    it('should return 422 for invalid signup data', async () => {
      const invalidUser = {email: 'invalid-email', password: ''};
      nock('http://127.0.0.1:3004')
        .post('/jwt/auth/signup', invalidUser)
        .reply(400, {error: 'Invalid input'});

      const res = await client
        .post('/signup')
        .send(invalidUser)
        .set('Accept', 'application/json');
      expect(res.status).to.equal(422);
      expect(res.body).to.have.property('error');
    });
  });

  // login integration testing

  describe('POST /login', () => {
    it('should return 200 with token when login succeeds', async () => {
      const mockUser = {
        email: 'test@example.com',
        password: 'Password@123',
      };

      nock('http://127.0.0.1:3004')
        .post('/jwt/auth/login', mockUser)
        .reply(200, {token: 'mock-jwt-token'});

      const res = await client
        .post('/login')
        .send(mockUser)
        .set('Accept', 'application/json');
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token', 'mock-jwt-token');
    });

    it('should return 401 if login fails with invalid credentials', async () => {
      const mockUser = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      nock('http://127.0.0.1:3004')
        .post('/jwt/auth/login', mockUser)
        .reply(401, {message: 'Unauthorized'});

      const res = await client
        .post('/login')
        .send(mockUser)
        .set('Accept', 'application/json');
      expect(res.status).to.equal(401);
      expect(res._body.error).to.have.property('message', 'Unauthorized');
    });

    it('should return 500 if login service is down', async () => {
      const mockUser = {
        email: 'test@example.com',
        password: 'Password@123',
      };

      nock('http://127.0.0.1:3004')
        .post('/jwt/auth/login', mockUser)
        .reply(503, {message: 'Service Unavailable'});

      const res = await client
        .post('/login')
        .send(mockUser)
        .set('Accept', 'application/json');

      expect(res.status).to.equal(500);
      expect(res.body).to.have.property('error');
    });
  });
});
