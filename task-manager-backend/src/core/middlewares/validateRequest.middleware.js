import { z } from "zod";
import ApiError from "../errors/ApiError.js";

/**
 * Middleware factory to validate request data against a Zod schema.
 * @param {z.ZodSchema} schema - The Zod schema to validate against.
 * @param {'body' | 'query' | 'params'} source - The part of the request to validate (default: 'body').
 */
export const validateRequest = (schema, source = "body") => (req, res, next) => {
    try {
        if (!schema) {
            console.error("validateRequest: Schema is undefined");
            throw new Error("Validation schema is missing");
        }
        const data = req[source];
        console.log(`Validating ${source}:`, data);
        const parsed = schema.parse(data);

        // Attach validated data to request object for easy access
        req.validatedData = { ...req.validatedData, [source]: parsed };

        // Also update the original source to reflected parsed/transformed values
        req[source] = parsed;

        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Format Zod errors into a readable string or object
            const errorMessage = error.errors
                .map((e) => `${e.path.join(".")}: ${e.message}`)
                .join(", ");

            next(new ApiError("VALIDATION_ERROR", errorMessage, 400));
        } else {
            next(error);
        }
    }
};
