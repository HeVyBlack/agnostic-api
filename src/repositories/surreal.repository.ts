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

    await instance.db.signin({
      user: `${process.env["SURREAL_USER"]}`,
      pass: `${process.env["SURREAL_PASS"]}`,
    });
    await instance.db.use({ ns: "api", db: name });

    return instance;
  }

  public async CloseConnection(): Promise<void> {
    await this.db.close();
  }

  private HandleResult(result: T[]): T {
    const res: T | undefined = result[0];

    if (!res) throw new Error("NOT_FOUND");

    return res;
  }

  private GetWhereFromQuery<V extends keyof T>(query: Record<V, T[V]>): string {
    const keys: string[] = Object.keys(query);

    if (keys.length === 0) throw new Error("INVALID_QUERY");

    let stringQuery: string = " WHERE";

    keys.forEach((q: string) => {
      stringQuery += ` ${q} == $${q} AND `;
    });

    return stringQuery.replace(/AND\s$/, ";");
  }

  public async Find<V extends keyof T>(query: Record<V, T[V]>): Promise<T> {
    const stringQuery = `SELECT * FROM ${this.name}`.concat(
      this.GetWhereFromQuery<V>(query)
    );

    const [{ result = [] }] = await this.db.query<[T[]]>(stringQuery, query);

    return this.HandleResult(result);
  }

  public async FindAll(): Promise<T[]> {
    const [{ result = [] }] = await this.db.query<[T[]]>(
      `SELECT * FROM ${this.name};`
    );

    return result;
  }

  public async Update<V extends keyof T>(
    query: Record<V, T[V]>,
    up: KeyInKeys<T>
  ): Promise<T> {
    const stringQuery = `UPDATE ${this.name} MERGE $up`.concat(
      this.GetWhereFromQuery(query)
    );

    const [{ result = [] }] = await this.db.query<[T[]]>(stringQuery, { up });

    return this.HandleResult(result);
  }

  public async InsertOne(thing: T): Promise<T> {
    const [inserted] = await this.db.create<T>(this.name, thing);
    return inserted as T;
  }

  public async Delete<V extends keyof T>(query: Record<V, T[V]>): Promise<T> {
    const queryString = `DELETE ${this.name}`.concat(
      this.GetWhereFromQuery(query)
    );

    const [{ result = [] }] = await this.db.query<[T[]]>(queryString, query);

    return this.HandleResult(result);
  }
}
