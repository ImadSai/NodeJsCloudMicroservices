import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

// promisify is used to convert a method that returns responses using a callback function to return responses in a promise object
const scryptAsync = promisify(scrypt);

export class Password {

    // Return a hashed password
    static async toHash(password: string) {

        const salt = randomBytes(8).toString('hex');
        const buf = (await scryptAsync(password, salt, 64)) as Buffer;

        return `${buf.toString('hex')}.${salt}`;
    }

    // Return bool : Compare stored password and supplied password
    static async compare(storedPassword: string, suppliedPassword: string) {

        const [hashedPassword, salt] = storedPassword.split('.');

        const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;

        return buf.toString('hex') === hashedPassword;
    }
}