import { ReplySchema, GetReplySchema } from "./app.schemas.ts";
import { SchemaSchema } from "./schemas.ts";
import { UserSchema } from "./user.schema.ts";

export namespace Schemas {
  export type Reply = ReplySchema;
  export const Reply = ReplySchema;
  export const GetReply = GetReplySchema;

  export type Schema = SchemaSchema;
  export const Schema = SchemaSchema;

  export type User = UserSchema;
  export const User = UserSchema;
}
