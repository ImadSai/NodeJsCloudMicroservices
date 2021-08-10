import { CustomError } from "./customError";

export class NotFoundError extends CustomError {

    statusCode = 404;

    constructor() {
        super();

        // Only beacause we are extending a built in class
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }

    serializeErrors() {
        return [
            { message: 'Not found' }
        ]
    }
}