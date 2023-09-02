import { App } from "@App";
import { Auth } from "./auth/auth.ts";

import { Repositories } from "@Repository";
import Repository = Repositories.Repository;

import { Schemas } from "@Schemas";
import User = Schemas.User;

export class ModulesModulator {
  constructor(private readonly userRepository: Repository<User>) {}

  public readonly Plugin = async (app: App.Instance) => {
    const auth = new Auth(this.userRepository);
    await app.register(auth.Plugin, { prefix: "/auth" });
  };
}
