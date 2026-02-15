import rateLimit from "express-rate-limit";

// Strict limiter for auth endpoints (login/signup)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // 15 attempts per window
    message: { message: "Too many attempts. Please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Moderate limiter for queue join (prevents spam joins)
export const queueJoinLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 30, // 30 joins per 5 min per IP
    message: { message: "Too many queue join attempts. Please slow down." },
    standardHeaders: true,
    legacyHeaders: false,
});

// General API limiter
export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: { message: "Too many requests. Please try again shortly." },
    standardHeaders: true,
    legacyHeaders: false,
});
