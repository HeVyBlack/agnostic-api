import { Repositories } from "@Repository";
import Repository = Repositories.Repository;

import { Schemas } from "@Schemas";
import User = Schemas.User;

import argon2 from "argon2";
import { StatusCodes } from "http-status-codes";

import { AuthSchemas } from "./auth.schemas.ts";
import { Auth } from "./auth.ts";

export class AuthService {
  constructor(private readonly repository: Repository<User>) {}

  public async CreateUser(user: User): Promise<User> {
    try {
      await this.repository.Find<"email">({ email: user["email"] });
    } catch (e) {
      user["password"] = await argon2.hash(user["password"]);

      const inserted: User = await this.repository.InsertOne(user);

      return inserted;
    }
    throw new Auth.Error("EMAIL_IN_USE", StatusCodes["BAD_REQUEST"]);
  }

  public async SignUser(user: AuthSchemas.SignUser): Promise<User> {
    try {
      const find = await this.repository.Find<"email">({ email: user.email });
      const match = argon2.verify(find["password"], user["password"]);

      if (!match) throw new Auth.Error("WRONG_PASSWORD", StatusCodes["BAD_REQUEST"]);

      return find;
    } catch (e) {
      if (e instanceof Repositories.Error) {
        if (e.code === StatusCodes["NOT_FOUND"])
          throw new Auth.Error("USER_NOT_FOUND", StatusCodes["NOT_FOUND"]);
      }
      throw new Auth.Error("BAD_REQUEST", StatusCodes["BAD_REQUEST"]);
    }
  }
}
