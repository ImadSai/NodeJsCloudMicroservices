import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';

let mongo: any;

/**
 * Hook Function - Before we launch the tests : 
 *  - Create a MongoMemoryServer
 *  - Connect Mongoose to the MongoMemoryServer
 */
beforeAll(async () => {

    // Init ENV variables
    process.env.JWT_KEY = 'asdf';

    // Init Mongo Memory Server
    mongo = await MongoMemoryServer.create();

    // Get URI of the server
    const mongoUri = await mongo.getUri();

    // Connect Mongoose to the MongoMemoryServer
    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

/**
 * Hook Function - Before every Test :
 *  - Clean database
 */
beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

/**
 * Hook Function - After All Tests :
 *  - Stop MongoMemoryServer
 *  - Close Mongoose connection
 */
afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

// Declare a global Function signin
declare global {
    var signin: () => Promise<string[]>;
}

/**
 * Define the Signin Function 
 *  - Signup an user
 *  - Return a cookie (with a valid JWT)
 * 
 * This function will be used by all the functions that require a valid cookie
 */
global.signin = async () => {
    const email = "test@test.com";
    const password = "password";

    const response = await request(app)
        .post('/api/users/signup')
        .send({ email, password })
        .expect(201);

    const cookie = response.get('Set-Cookie');

    return cookie;
};