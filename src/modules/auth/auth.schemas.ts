import { z } from "zod";
import { Schemas } from "@Schemas";
import User = Schemas.User;

export type SignUser = z.infer<typeof SignUser>;
export const SignUser = User.pick({
  email: true,
  password: true,
});

export type SignUpUser = z.infer<typeof SignUpUser>;
export const SignUpUser = User.pick({
  email: true,
  password: true,
}).extend({
  confirm_password: z.string(),
});
