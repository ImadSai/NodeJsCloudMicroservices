/**
 * Définition de l'Error Handler en tant que middleware
 */
import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/customError";

// Error Handler
export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {

    // If the error is Custom Error
    if (err instanceof CustomError) {
        return res.status(err.statusCode).send({ errors: err.serializeErrors() });
    }

    // Generic Error if Unknown
    res.status(500).send({ errors: [{ message: "Something went wrong !" }] });
};