import { v4 } from "uuid";
import { z } from "zod";

export const Basic = z.object({
  uuid: z.string().default(v4),
});

export type Basic = z.infer<typeof Basic>;
