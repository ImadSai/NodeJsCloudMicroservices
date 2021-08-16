import { CustomError } from './customError';

export class DatabaseConnectionError extends CustomError {

    statusCode = 500;
    reason = 'Error connection to Database';

    constructor() {
        super();

        // Only beacause we are extending a built in class
        Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
    }

    serializeErrors() {
        return [
            { message: this.reason }
        ]
    }
}