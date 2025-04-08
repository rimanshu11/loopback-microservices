// import { expect } from 'chai';
// import { MyLoopback4Application } from '../application'; // Adjust path if necessary
// import { Client, createRestAppClient } from '@loopback/testlab';
// import { User } from '../models'; // Adjust the path to your model
// import { UserRepository } from '../repositories'; // Adjust path if necessary

// describe('UserController', () => {
//   let app: MyLoopback4Application;
//   let client: Client;
//   let userRepo: UserRepository;

//   // Start up the application before each test
//   beforeEach(async () => {
//     app = new MyLoopback4Application();
//     await app.boot();
//     await app.start();
//     client = createRestAppClient(app);
//     userRepo = await app.get('repositories.UserRepository');
//   });

//   // Stop the application after each test
//   afterEach(async () => {
//     await app.stop();
//   });

//   // Test the POST /users endpoint
//   it('should create a new user', async () => {
//     const userData: User = {
//       name: 'John Doe',
//       email: 'john@example.com',
//     };

//     const response = await client.post('/users').send(userData).expect(200);
//     expect(response.body).to.have.property('name', 'John Doe');
//     expect(response.body).to.have.property('email', 'john@example.com');
//   });

//   // Test the GET /users/{id} endpoint
//   it('should return a user by ID', async () => {
//     const newUser = await userRepo.create({
//       name: 'Jane Doe',
//       email: 'jane@example.com',
//     });

//     const response = await client
//       .get(`/users/${newUser.id}`)
//       .expect(200);

//     expect(response.body).to.have.property('name', 'Jane Doe');
//     expect(response.body).to.have.property('email', 'jane@example.com');
//   });

//   // Test invalid user lookup (GET /users/{id} with non-existing id)
//   it('should return a 404 for a non-existent user', async () => {
//     const invalidId = 'non-existent-id';

//     const response = await client.get(`/users/${invalidId}`).expect(404);
//     expect(response.body.error).to.exist;
//   });
// });
