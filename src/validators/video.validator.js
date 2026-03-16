import { z } from "zod";

export const uploadVideoSchema = z.object({
    body: z.object({
        title: z.string().min(3, "Title must be at least 3 characters long").trim(),
        description: z.string().min(5, "Description must be at least 5 characters long").trim()
    })
});

export const updateVideoSchema = z.object({
    body: z.object({
        title: z.string().trim().min(3, "Title must be at least 3 characters long").optional(),
        description: z.string().trim().min(5, "Description must be at least 5 characters long").optional()
    }).refine(data => data.title || data.description, {
        message: "At least one field (title or description) is required to update"
    })
});
});
