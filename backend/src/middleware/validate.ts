import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Middleware factory to validate request body against Zod schema
 */
export const validateBody = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Validate and transform the request body
            req.body = await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: error.issues.map((err) => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            }

            // Handle unexpected errors
            console.error('Validation middleware error:', error);
            return res.status(500).json({ message: 'Internal validation error' });
        }
    };
};

/**
 * Middleware factory to validate request params against Zod schema
 */
export const validateParams = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await schema.parseAsync(req.params);
            req.params = validated as typeof req.params;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    message: 'Invalid URL parameters',
                    errors: error.issues.map((err) => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            }

            console.error('Validation middleware error:', error);
            return res.status(500).json({ message: 'Internal validation error' });
        }
    };
};

/**
 * Middleware factory to validate request query against Zod schema
 */
export const validateQuery = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await schema.parseAsync(req.query);
            req.query = validated as typeof req.query;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    message: 'Invalid query parameters',
                    errors: error.issues.map((err) => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            }

            console.error('Validation middleware error:', error);
            return res.status(500).json({ message: 'Internal validation error' });
        }
    };
};
