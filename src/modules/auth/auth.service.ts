import { Repositories } from "@Repository";
import Repository = Repositories.Repository;

import { Schemas } from "@Schemas";
import User = Schemas.User;

import argon2 from "argon2";

import { SignUser } from "./auth.schemas.ts";

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
    throw new Error("EMAIL_IN_USE");
  }

  public async SignUser(user: SignUser): Promise<User> {
    const find = await this.repository.Find<"email">({ email: user.email });
    const match = argon2.verify(find["password"], user["password"]);

    if (!match) throw new Error("WRONG_PASSWORD");

    return find;
  }
}
