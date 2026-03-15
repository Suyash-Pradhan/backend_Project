import { z } from "zod";

export const playlistSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Playlist name is required").trim(),
        description: z.string().trim().optional()
    })
});
