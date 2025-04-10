import {expect} from 'chai';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import {describe, it, beforeEach} from 'mocha';
import {UserController} from '../../controllers/user.controller';
import {UserRepository} from '../../repositories/user.repository';
import {User} from '../../models';
import {TokenService} from '@loopback/authentication';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import {UserRole} from '../../enums/role.enum';
import {RolePermissions} from '../../config/role-permission.config';
import {securityId} from '@loopback/security';

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('UserController Unit Tests', () => {
  let controller: UserController;
  let userRepoStub: sinon.SinonStubbedInstance<UserRepository>;
  let tokenServiceStub: Partial<TokenService>;

  beforeEach(() => {
    userRepoStub = sinon.createStubInstance(UserRepository);
    tokenServiceStub = {
      generateToken: sinon.stub().resolves('mock-token'),
    };
    controller = new UserController(userRepoStub, tokenServiceStub as TokenService);
  });

  describe('jwtSignup', () => {
    it('creates a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.USER,
      };
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const newUser = {
        userId: 1,
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        permissions: RolePermissions[userData.role],
      } as User;
      userRepoStub.findOne.resolves(null);
      userRepoStub.create.resolves(newUser);

      const result = await controller.jwtSignup(userData);
      expect(result.message).to.equal('User registered successfully');
      expect(result.user).to.deep.equal({
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.USER,
        permissions: RolePermissions[userData.role],
      });
      expect(userRepoStub.create).to.have.been.calledOnceWith({
        username: userData.username,
        email: userData.email,
        password: sinon.match.string, // Match any string (hashed password)
        role: userData.role,
        permissions: RolePermissions[userData.role],
      });
      expect(userRepoStub.create.args[0][0].password).to.not.equal('password123');
    });

    it('throws an error if user already exists', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.USER,
      };
      userRepoStub.findOne.resolves({ email: userData.email } as User);

      await expect(controller.jwtSignup(userData)).to.be.rejectedWith(
        'User with this email already exists',
      );
    });

    it('throws an error if role is invalid', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'invalidRole' as UserRole,
      };
      userRepoStub.findOne.resolves(null);

      await expect(controller.jwtSignup(userData)).to.be.rejectedWith(
        `Invalid role. Allowed roles: ${Object.values(UserRole).join(', ')}`,
      );
    });
  });

  describe('jwtLogin', () => {
    it('logs in a user and returns a token', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const hashedPassword = await bcrypt.hash(credentials.password, 10);
      const user = {
        userId: 1,
        username: 'testuser',
        email: credentials.email,
        password: hashedPassword,
        role: UserRole.USER,
        permissions: RolePermissions[UserRole.USER],
      } as User;
      const mockToken = jwt.sign(
        { ...user, userId: undefined, username: undefined, password: undefined, [securityId]: 1 },
        'your-jwt-secret',
      );
      userRepoStub.findOne.resolves(user);
      userRepoStub.updateById.resolves();

      const result = await controller.jwtLogin(credentials);
      expect(result).to.deep.equal({
        username: 'testuser',
        email: 'test@example.com',
        token: mockToken,
        role: UserRole.USER,
      });
      expect(userRepoStub.findOne).to.have.been.calledOnceWith({
        where: { email: credentials?.email },
      });
      expect(userRepoStub.updateById).to.have.been.calledOnceWith(1, { token: mockToken });
    });

    it('throws an error for invalid credentials (user not found)', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      userRepoStub.findOne.resolves(null);

      await expect(controller.jwtLogin(credentials)).to.be.rejectedWith('Invalid credentials');
    });

    it('throws an error for invalid password', async () => {
      const credentials = { email: 'test@example.com', password: 'wrongpassword' };
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = {
        userId: 1,
        username: 'testuser',
        email: credentials.email,
        password: hashedPassword,
        role: UserRole.USER,
      } as User;
      userRepoStub.findOne.resolves(user);

      await expect(controller.jwtLogin(credentials)).to.be.rejectedWith('Invalid credentials');
    });
  });

  describe('find', () => {
    it('returns an array of users', async () => {
      const filter = { where: { role: UserRole.USER } };
      const users = [
        { userId: 1, username: 'user1', email: 'user1@example.com', role: UserRole.USER },
        { userId: 2, username: 'user2', email: 'user2@example.com', role: UserRole.USER },
      ] as User[];
      userRepoStub.find.resolves(users);

      const result = await controller.find(filter);
      expect(result).to.deep.equal(users);
      expect(userRepoStub.find).to.have.been.calledOnceWith(filter);
    });

    it('returns all users when no filter is provided', async () => {
      const users = [
        { userId: 1, username: 'user1', email: 'user1@example.com', role: UserRole.USER },
      ] as User[];
      userRepoStub.find.resolves(users);

      const result = await controller.find();
      expect(result).to.deep.equal(users);
      expect(userRepoStub.find).to.have.been.calledOnceWith(undefined);
    });
  });
});