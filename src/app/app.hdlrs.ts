import { FastifyReply, FastifyRequest } from "fastify";
import { Schemas } from "@Schemas";
import { StatusCodes } from "http-status-codes";

export namespace AppHdlrs {
  import Reply = Schemas.Reply;

  export async function NotFoundHdlr(
    req: FastifyRequest,
    rep: FastifyReply
  ): Promise<Reply> {
    const code: StatusCodes = StatusCodes["NOT_FOUND"];
    rep.code(code);

    return {
      code,
      message: `Cannot ${req.method} at ${req.originalUrl}`,
    };
  }
}
