import { z } from "zod";

export const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const promoteSchema = z.object({
  role: z.enum(["ASSET_MANAGER", "DEPARTMENT_HEAD"]),
});
export type PromoteInput = z.infer<typeof promoteSchema>;

export const bookingSchema = z
  .object({
    resourceId: z.coerce.number().int().positive(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    purpose: z.string().max(300).optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export type BookingInput = z.infer<typeof bookingSchema>;
