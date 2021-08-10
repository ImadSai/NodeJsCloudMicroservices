/**
 * Abstract Class qui va obliger toutes les classes qui l'implementent à définir 
 * --> la valeur de : statusCode
 * --> la fonction  : serializeErrors
 * 
 * De cette façon toutes les erreurs auront le même format et grace à TS on pourra savoir
 * si une classe ne défini pas les choses proprement.
 */

export abstract class CustomError extends Error {

    abstract statusCode: number;

    abstract serializeErrors(): { message: string, field?: string }[]

    constructor() {
        super();
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}