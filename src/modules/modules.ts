import { App } from "@App";
import { Auth } from "./auth/auth.ts";

import { Repositories } from "@Repository";
import Repository = Repositories.Repository;

import { Schemas } from "@Schemas";
import User = Schemas.User;

export function ModulesModulator(
  user_repository: Repository<User>
): App.FunctionRegister {
  return async function (app: App.Instance) {
    await app.register(Auth(user_repository), { prefix: "/auth" });
  };
}
