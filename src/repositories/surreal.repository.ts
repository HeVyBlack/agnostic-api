import { type Repository } from "../repositories.ts";
import { type Basic } from "../schemas.ts";
import { Surreal } from "surrealdb.js";

export class SurrealRepository<T extends Basic> implements Repository<T> {
  private constructor(name: string) {
    this.name = name;
  }

  name: string;

  private db = new Surreal("http://127.0.0.1:8000/rpc");

  public static async getInstance<T extends Basic>(name: string) {
    const instance = new SurrealRepository<T>(name);
    await instance.db.signin({ user: "api", pass: "root" });
    await instance.db.use({ ns: "api", db: "agnostic" });

    return instance;
  }

  async closeConnection(): Promise<void> {
    await this.db.close();
  }

  async find(query: Partial<T>) {
    const keys = Object.keys(query);

    if (keys.length === 0) throw new Error("INVALID_QUERY");

    let string_query = `SELECT * FROM ${this.name} WHERE`;

    keys.forEach((q) => {
      string_query += ` ${q} == $${q} AND `;
    });

    string_query = string_query.replace(/AND\s$/, ";");

    const [{ result = [] }] = await this.db.query<[T[]]>(string_query, query);

    return this.handleResult(result);
  }

  async findAll(): Promise<T[]> {
    const [{ result = [] }] = await this.db.query<[T[]]>(
      `SELECT * FROM ${this.name};`
    );

    return result;
  }

  private handleResult(result: T[]) {
    const user = result[0];

    if (!user) throw new Error("NOT_FOUND");

    return user;
  }

  async findByUuid(uuid: string): Promise<T> {
    const [{ result = [] }] = await this.db.query<[T[]]>(
      `SELECT * FROM ${this.name} WHERE uuid == $uuid`,
      { uuid }
    );

    return this.handleResult(result);
  }

  async updateWithUuid(uuid: string, up: Partial<T>): Promise<T> {
    const [{ result = [] }] = await this.db.query<[T[]]>(
      `UPDATE ${this.name} MERGE $up WHERE uuid == $uuid`,
      { up, uuid }
    );

    return this.handleResult(result);
  }

  async insertOne(thing: T): Promise<T> {
    try {
      const [inserted] = await this.db.create(this.name, thing);

      return inserted as T;
    } catch (e) {
      if (e instanceof Error) {
        if (e.message.endsWith("already exists"))
          throw new Error("ALREADY_EXISTS");
      }

      throw e;
    }
  }

  async deleteByUuid(uuid: string): Promise<void> {
    await this.db.query(`DELETE ${this.name} WHERE uuid == $uuid`, { uuid });
  }
}
