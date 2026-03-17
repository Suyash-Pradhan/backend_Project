import { ApiError } from "../utils/ApiError.js";

export const validate = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        // Extract Zod error messages
        const errorMessages = error.issues.map((issue) => issue.message).join(", ");
        next(new ApiError(400, `Validation Error: ${errorMessages}`, error.issues));
    }
}
