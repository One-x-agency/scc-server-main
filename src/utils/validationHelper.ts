import Joi from 'joi';
import z from 'zod';
import { Request, Response, NextFunction } from 'express';
import qs from 'qs';

class ValidationError extends Error {
  isJoi: boolean;

  details: any;

  constructor(errorMessage: string, details: any) {
    super('Validation Error');
    this.name = 'ValidationError';
    this.message = errorMessage || 'Validation Error';
    this.isJoi = true;
    this.details = details;
  }
}

function parseQuery(req: Request) {
  const rawQuery = req.url.split('?')[1] || '';
  return qs.parse(rawQuery);
}

const validate = (schema: { [key: string]: z.ZodObject<any, any> | Joi.ObjectSchema<any> }) => (req: Request, res: Response, next: NextFunction) => {
  req.body = req.body || {};

  Object.keys(schema).forEach((key) => {

    let error: z.ZodError<any> | Joi.ValidationError | undefined; let
      value: any;

    if (schema[key] instanceof z.ZodObject) {
      const result = key === 'query' ? schema[key].safeParse(parseQuery(req)) : schema[key].safeParse(req[key]);
      if (result.success) {
        value = result.data;
      } else {
        error = result.error;
      }

    } else {
      const result = key === 'query' ? schema[key].validate(parseQuery(req)) : schema[key].validate(req[key]);
      if (result.error) {
        error = result.error;
      } else {
        value = result.value;
      }
    }

    if (error) {
      if (error instanceof z.ZodError) {
        const details = { [key]: {} };
        let errorMessage:string;
        error.issues.forEach((issue) => {
          details[key][issue.path[0]] = issue.message;
          if (!errorMessage) errorMessage = issue.message;
        });

        throw new ValidationError(errorMessage, details);

      } else {
        const details = { [key]: {} };
        let errorMessage:string;

        error.details.forEach((detail) => {
          details[key][detail.path[0]] = detail.message;
          if (!errorMessage) errorMessage = detail.message;
        });

        throw new ValidationError(errorMessage, details);
      }
    }

    if (key === 'query') {
      (req as Request & { validatedQuery: object }).validatedQuery = value;
    } else {
      (req as any)[key] = value;
    }

  });
  next();

};

export { validate, ValidationError, Joi, z };
