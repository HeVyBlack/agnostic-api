import { z } from "zod";
import { Basic } from "./basic.schema.ts";
import { Products } from "./product.schema.ts";

export const Role = z.enum(["user", "admin", "super-admin"]);

export type Role = z.infer<typeof Role>;

export const Roles = z.array(Role);

export type Roles = z.infer<typeof Roles>;

export const User = Basic.extend({
  email: z.string().email(),
  password: z.string(),
  verify_email: z.boolean(),
  roles: Roles,
  products: Products.default([]),
});

export const UserRaw = User.extend({
  products: z.array(z.string()).default([]),
});

export type UserRaw = z.infer<typeof UserRaw>;

export interface User extends z.infer<typeof User> {}

export const Users = z.array(User);

export type Users = z.infer<typeof Users>;
