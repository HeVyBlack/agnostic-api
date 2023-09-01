import { App } from "@App";

import { Repositories } from "@Repository";
import Repository = Repositories.Repository;

import { Schemas } from "@Schemas";
import User = Schemas.User;
import Reply = Schemas.Reply;
import GetReply = Schemas.GetReply;

import { AuthService } from "./auth.service.ts";
import { AuthHdlrs } from "./auth.hdlrs.ts";
import { SignUpUser, SignUser } from "./auth.schemas.ts";
import { z } from "zod";

export function Auth(user_repository: Repository<User>): App.FunctionRegister {
  return async function (app: App.Instance): Promise<void> {
    const service: AuthService = new AuthService(user_repository);
    const hdlrs: AuthHdlrs = new AuthHdlrs(service);

    app.post(
      "/sign-up",
      {
        schema: {
          body: SignUpUser,
          response: { 200: GetReply(200), 400: GetReply(400) },
        },
      },
      hdlrs.PostSignUp
    );

    app.post(
      "/sing-in",
      {
        schema: {
          body: SignUser,
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
