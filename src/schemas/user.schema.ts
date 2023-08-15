import { z } from "zod";
import { v4 } from "uuid";

export const Role = z.enum(["user", "admin", "super-admin"]);

export type Role = z.infer<typeof Role>;

export const Roles = z.array(Role);

export type Roles = z.infer<typeof Roles>;

export const User = z.object({
  id: z.string().default(v4),
  email: z.string().email(),
  password: z.string(),
  code: z.string().default(v4),
  verify_email: z.boolean(),
  roles: Roles,
});

export interface User extends z.infer<typeof User> {}

export const Users = z.array(User);

export type Users = z.infer<typeof Users>;
