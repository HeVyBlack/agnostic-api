import jwt from "jsonwebtoken";
import { FastifyReply, FastifyRequest } from "fastify";

import { Schemas } from "@Schemas";
import User = Schemas.User;
import Reply = Schemas.Reply;

import { Utils } from "@Utils";
import Env = Utils.Env;

import { AuthService } from "./auth.service.ts";
import { AuthSchemas } from "./auth.schemas.ts";
import { Auth } from "./auth.ts";

export class AuthHdlrs {
  constructor(private readonly service: AuthService) {}

  public readonly PostSignUp = async (
    req: FastifyRequest<{ Body: AuthSchemas.SignUpUser }>,
    rep: FastifyReply
  ): Promise<Reply> => {
    try {
      const user: User = User.parse(req.body);

      await this.service.CreateUser(user);

      return {
        code: 200,
        message: "OK",
      };
    } catch (e) {
      if (e instanceof Auth.Error) return Auth.Error.Handler(e, rep);

      throw e;
    }
  };

  public readonly PostSignIn = async (
    req: FastifyRequest<{ Body: AuthSchemas.SignUser }>,
    rep: FastifyReply
  ): Promise<Reply> => {
    try {
      const user = await this.service.SignUser(req.body);

      const token = jwt.sign({ uuid: user["uuid"] }, `${Env["SECRET_PASSWORD"]}`, {
        expiresIn: "12h",
      });

      return {
        code: 200,
        message: "OK",
        token,
      };
    } catch (e) {
      if (e instanceof Auth.Error) return Auth.Error.Handler(e, rep);

      throw e;
    }
  };
}
