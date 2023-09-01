import { Repositories } from "@Repository";
import Repository = Repositories.Repository;

import { Schemas } from "@Schemas";
import User = Schemas.User;

import argon2 from "argon2";

export class AuthService {
  constructor(private readonly repository: Repository<User>) {}

  public async createUser(user: User): Promise<User> {
    try {
      await this.repository.find({ email: user["email"] });
    } catch (e) {
      user["password"] = await argon2.hash(user["password"]);
      const inserted: User = await this.repository.insertOne(user);
      return inserted;
    }
    throw new Error("EMAIL_IN_USE");
  }

  public async getUser(uuid: string) {
    return this.repository.find({ uuid });
  }
}
