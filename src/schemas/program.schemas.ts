import { z } from "zod";

export type EnvSchema = z.infer<typeof EnvSchema>;
export const EnvSchema = z
  .object({
    PORT: z.string(),
    MONGO_URI: z.string(),
    SURREAL_URI: z.string(),
    SURREAL_USER: z.string(),
    SURREAL_PASS: z.string(),
    SECRET_PASSWORD: z.string(),
    NODE_ENV: z.string().default("development"),
  })
  .passthrough();
