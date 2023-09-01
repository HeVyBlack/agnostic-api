import { KeyInKeys, RepositoriesRepository } from "./repositories.ts";
import { Schemas } from "@Schemas";
import Schema = Schemas.Schema;

import { Surreal } from "surrealdb.js";

export class SurrealRepository<T extends Schema>
  implements RepositoriesRepository<T>
{
  public name: string;
  private db: Surreal;
  private constructor(name: string, uri: string) {
    this.name = name;
    this.db = new Surreal(uri);
  }

  public static async GetInstance<T extends Schema>(name: string, uri: string) {
    const instance: SurrealRepository<T> = new SurrealRepository<T>(name, uri);

    await instance.db.signin({ user: "api", pass: "root" });
    await instance.db.use({ ns: "api", db: name });

    return instance;
  }

  closeConnection(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  find(query: KeyInKeys<T>): Promise<T> {
    query;
    throw new Error("Method not implemented.");
  }

  findAll(): Promise<T[]> {
    throw new Error("Method not implemented.");
  }

  update(query: KeyInKeys<T>, up: KeyInKeys<T>): Promise<T> {
    query;
    up;
    throw new Error("Method not implemented.");
  }

  insertOne(thing: T): Promise<T> {
    thing;
    throw new Error("Method not implemented.");
  }

  delete(query: KeyInKeys<T>): Promise<T> {
    query;
    throw new Error("Method not implemented.");
  }
}
