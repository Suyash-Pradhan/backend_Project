import { z } from "zod";

export const registerUserSchema = z.object({
    body: z.object({
        fullName: z.string().min(2, "Full name must be at least 2 characters long").trim(),
        username: z.string().min(3, "Username must be at least 3 characters long").toLowerCase().trim(),
        email: z.string().email("Invalid email format").trim(),
        password: z.string().min(6, "Password must be at least 6 characters long")
    })
});

export const loginUserSchema = z.object({
    body: z.object({
        username: z.string().trim().optional(),
        email: z.string().email("Invalid email format").trim().optional(),
        password: z.string().min(1, "Password is required")
    }).refine((data) => data.username || data.email, {
        message: "Either username or email is required",
        path: ["username"]
    })
});

export const changePasswordSchema = z.object({
    body: z.object({
        oldPassword: z.string().min(1, "Old password is required"),
        newPassword: z.string().min(6, "New password must be at least 6 characters long")
    })
});

export const updateAccountSchema = z.object({
    body: z.object({
        fullName: z.string().min(2, "Full name must be at least 2 characters long").trim(),
        email: z.string().email("Invalid email format").trim()
    })
});
