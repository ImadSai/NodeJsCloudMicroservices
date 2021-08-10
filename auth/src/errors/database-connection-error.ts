import { CustomError } from './customError';

export class databaseConnectionError extends CustomError {

    statusCode = 500;
    reason = 'Error connection to Database';

    constructor() {
        super();

        // Only beacause we are extending a built in class
        Object.setPrototypeOf(this, databaseConnectionError.prototype);
    }

    serializeErrors() {
        return [
            { message: this.reason }
        ]
    }
}