import { z } from "zod";

export const commentSchema = z.object({
    body: z.object({
        content: z.string().min(1, "Comment content is required").trim()
    })
});
