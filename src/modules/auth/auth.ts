import { App } from "@App";

import { Repositories } from "@Repository";
import Repository = Repositories.Repository;

import { Schemas } from "@Schemas";
import User = Schemas.User;
import Reply = Schemas.Reply;
import GetReply = Schemas.GetReply;

import { AuthService } from "./auth.service.ts";
import { AuthHdlrs } from "./auth.hdlrs.ts";
import { AuthSchemas } from "./auth.schemas.ts";

import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import { FastifyReply } from "fastify";

export class Auth {
  public constructor(private readonly userRepository: Repository<User>) {}

  public readonly Plugin = async (app: App.Instance): Promise<void> => {
    const service: AuthService = new AuthService(this.userRepository);
    const hdlrs: AuthHdlrs = new AuthHdlrs(service);

    app.post(
      "/sign-up",
      {
        schema: {
          body: AuthSchemas.SignUpUser,
          response: { 200: GetReply(200), 400: GetReply(400) },
        },
      },
      hdlrs.PostSignUp
    );

    app.post(
      "/sing-in",
      {
        schema: {
          body: AuthSchemas.SignUser,
          response: {
            200: Reply.extend({
              token: z.string(),
              code: z.number().default(200),
            }),
            400: GetReply(400),
          },
        },
      },
      hdlrs.PostSignIn
    );
  };
}

export namespace Auth {
  export const Error = class AuthError {
    code?: StatusCodes;
    message: string;
    public constructor(message: string, code?: StatusCodes) {
      if (code) this.code = code;
      this.message = message;
    }

    public static Handler(e: AuthError, rep: FastifyReply): Reply {
      const code: StatusCodes = e.code || StatusCodes["BAD_REQUEST"];
      const message: string = e.message;
      rep.code(code);
      return { code, message };
    }
  };
}
