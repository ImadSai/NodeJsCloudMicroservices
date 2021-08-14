import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { RequestValidationError } from '../errors/request-validation-error';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {

    const errors = validationResult(req);

    // If there's an error we throw a Request Validation Error
    if (!errors.isEmpty()) {
        throw new RequestValidationError(errors.array());
    }

    // If everything's good we call the next function
    next();
};