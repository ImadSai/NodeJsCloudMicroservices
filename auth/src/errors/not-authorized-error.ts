import { CustomError } from "./customError";

export class NotAuthorizedError extends CustomError {

    statusCode = 401;
    reason = 'Not Authorized';

    constructor() {
        super();

        // Only beacause we are extending a built in class
        Object.setPrototypeOf(this, NotAuthorizedError.prototype);
    }

    serializeErrors() {
        return [
            { message: this.reason }
        ]
    }
}