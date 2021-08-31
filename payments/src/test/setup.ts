import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';


let mongo: any;

// Mock Nats Wrapper and Stripe
jest.mock(('../nats-wrapper'));
jest.mock(('../stripe'));

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
    await mongoose.connect(mongoUri);
});

/**
 * Hook Function - Before every Test :
 *  - Clean database
 *  - Clear all Mocks
 */
beforeEach(async () => {

    // Clear all Mocks
    jest.clearAllMocks();

    // Clean database
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
    var signin: (id?: string) => string[];
}

/**
 * Define the Signin Function 
 *  - Signup an user
 *  - Return a cookie (with a valid JWT)
 * 
 * This function will be used by all the functions that require a valid cookie
 */
global.signin = (id?: string) => {

    // Build a JWT payload { id, email }
    const payload = {
        id: id || new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    };

    // Build a JWT Token
    const JWT_KEY = 'asdf';

    // Generate the JWT 
    const userJwt = jwt.sign(payload, JWT_KEY!);

    // Build a session Object. { jwt: MY_JWT }
    const session = {
        jwt: userJwt
    };

    // Turn that session into JSON
    const sessionJson = JSON.stringify(session);

    // converte that JSON into base64
    const base64Session = Buffer.from(sessionJson).toString('base64');

    // Return a Cookie with th enncoded data
    return [`express:sess=${base64Session}`];
};