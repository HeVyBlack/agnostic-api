import jwt from "jsonwebtoken";
import { FastifyRequest } from "fastify";
import { Schemas } from "@Schemas";
import User = Schemas.User;
import Reply = Schemas.Reply;

import { AuthService } from "./auth.service.ts";
import { SignUpUser, SignUser } from "./auth.schemas.ts";

export class AuthHdlrs {
  constructor(private readonly service: AuthService) {}

  public readonly PostSignUp = async (
    req: FastifyRequest<{ Body: SignUpUser }>
  ): Promise<Reply> => {
    try {
      const user: User = User.parse(req.body);

      await this.service.CreateUser(user);

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

  public readonly PostSignIn = async (
    req: FastifyRequest<{ Body: SignUser }>
  ): Promise<Reply> => {
    const user = await this.service.SignUser(req.body);

    const token = jwt.sign(
      { uuid: user["uuid"] },
      `${process.env["SECRET_PASSWORD"]}`,
      { expiresIn: "12h" }
    );

    return {
      code: 200,
      message: "OK",
      token,
    };
  };
}
