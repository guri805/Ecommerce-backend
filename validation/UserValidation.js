const { z } = require('zod');

const SignupFormSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters long")
        .max(50, "Name must be at most 50 characters long")
        .nonempty("Name is required"),
    email: z
        .string()
        .email("Invalid email address")
        .nonempty("Email is required"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .nonempty("Password is required"),
    mobile: z
        .string()
        .regex(/^[6-9]\d{9}$/, "Invalid mobile number")
        .nonempty("Password is required"),

});

module.exports = SignupFormSchema