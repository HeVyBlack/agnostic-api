import { z } from "zod";
import { SchemaSchema } from "./schemas.ts";

export type UserSchema = z.infer<typeof UserSchema>;
export const UserSchema = SchemaSchema.extend({
  email: z.string().email(),
  password: z.string().min(6),
  verify_email: z.boolean().default(false),
});
