import { FastifyReply, FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";

import { Schemas } from "@Schemas";
import Reply = Schemas.Reply;

export class AppHdlrs {
  public static async NotFoundHdlr(req: FastifyRequest, rep: FastifyReply): Promise<Reply> {
    const code: StatusCodes = StatusCodes["NOT_FOUND"];
    rep.code(code);

    return {
      code,
      message: `Cannot ${req.method} at ${req.originalUrl}`,
    };
  }
}
