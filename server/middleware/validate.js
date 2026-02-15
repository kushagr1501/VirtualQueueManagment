import { z } from "zod";

// --- Schemas ---

export const signupSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    companyName: z.string().min(1, "Company name is required").max(100),
    location: z.string().min(1, "Location is required").max(200),
    description: z.string().max(500).optional(),
    category: z.enum(["restaurant", "retail", "hospital", "government", "other"]).optional(),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export const joinQueueSchema = z.object({
    userName: z.string().min(1, "Name is required").max(100),
    queueName: z.string().max(50).optional(),
});

export const addPlaceSchema = z.object({
    name: z.string().min(1, "Place name is required").max(100),
    description: z.string().min(1, "Description is required").max(500),
    location: z.string().min(1, "Location is required").max(200),
    category: z.enum(["restaurant", "retail", "hospital", "government", "other"]).optional(),
});

export const verifyTokenSchema = z.object({
    placeId: z.string().min(1, "Place ID is required"),
    verificationCode: z.string().min(1, "Verification code is required"),
});

export const createQueueSchema = z.object({
    queueName: z.string().min(1, "Queue name is required").max(50),
});

export const updatePlaceSchema = z.object({
    name: z.string().min(1, "Place name is required").max(100).optional(),
    description: z.string().max(500).optional(),
    location: z.string().max(200).optional(),
    category: z.enum(["restaurant", "retail", "hospital", "government", "other"]).optional(),
});

// --- Validation Middleware ---

/**
 * Creates an express middleware that validates req.body against a Zod schema.
 * Returns 400 with the first error message on failure.
 */
export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const firstError = result.error?.issues?.[0]?.message
            || result.error?.message
            || "Invalid input";
        return res.status(400).json({ message: firstError });
    }
    req.body = result.data; // Use parsed/sanitized data
    next();
};
