import { z } from "zod";

export const tweetSchema = z.object({
    body: z.object({
        content: z.string().min(1, "Tweet content is required").max(500, "Tweet cannot exceed 500 characters").trim()
    })
});
