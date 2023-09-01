import { FastifyRequest } from "fastify";
import { Schemas } from "@Schemas";
import User = Schemas.User;
import Reply = Schemas.Reply;

import { AuthService } from "./auth.service.ts";
import { SignUpUser } from "./auth.schemas.ts";

export class AuthHdlrs {
  constructor(public readonly service: AuthService) {}

  public readonly postSignUp = async (
    req: FastifyRequest<{ Body: SignUpUser }>
  ): Promise<Reply> => {
    try {
      const user: User = User.parse(req.body);

      await this.service.createUser(user);

      return {
        code: 200,
        message: "OK",
      };
    } catch (e) {
      return {
        code: 400,
        message: "EMAIL_IN_USE",
      };
    }
  };
}
