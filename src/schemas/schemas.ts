import { v4 } from "uuid";
import { z } from "zod";

export type SchemaSchema = z.infer<typeof SchemaSchema>;
export const SchemaSchema: z.SomeZodObject = z.object({
  uuid: z.string().uuid().default(v4),
});
