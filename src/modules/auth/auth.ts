import { App } from "@App";

import { Repositories } from "@Repository";
import Repository = Repositories.Repository;

import { Schemas } from "@Schemas";
import User = Schemas.User;
import GetReply = Schemas.GetReply;

import { AuthService } from "./auth.service.ts";
import { AuthHdlrs } from "./auth.hdlrs.ts";
import { SignUpUser } from "./auth.schemas.ts";

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
      hdlrs.postSignUp
    );
  };
}
