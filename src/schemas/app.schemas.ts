import { StatusCodes } from "http-status-codes";
import { z } from "zod";

export type ReplySchema = z.infer<typeof ReplySchema>;
export const ReplySchema: z.SomeZodObject = z
  .object({
    code: z.nativeEnum(StatusCodes),
    message: z.string(),
  })
  .passthrough();

export function GetReplySchema(code: StatusCodes): typeof ReplySchema {
  return ReplySchema.extend({ code: z.number().default(code) });
}
