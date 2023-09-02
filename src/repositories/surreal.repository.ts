import {
  KeyInKeys,
  RepositoriesRepository,
  RepositoryError,
} from "./repositories.ts";

import { Schemas } from "@Schemas";
import Schema = Schemas.Schema;

import { Utils } from "@Utils";
import Env = Utils.Env;
import Log = Utils.Log;

import { Surreal } from "surrealdb.js";
import { StatusCodes } from "http-status-codes";

export class SurrealRepository<T extends Schema>
  implements RepositoriesRepository<T>
{
  public name: string;
  private db: Surreal;
  private constructor(name: string) {
    this.name = name;
    this.db = new Surreal(Env["SURREAL_URI"]);
  }

  private static ConnectionStatus: string[] = ["OPEN", "CLOSE", "RECONNECTING"];

  public static async GetInstance<T extends Schema>(name: string) {
    const instance: SurrealRepository<T> = new SurrealRepository<T>(name);

    await instance.db.signin({
      user: `${Env["SURREAL_USER"]}`,
      pass: `${Env["SURREAL_PASS"]}`,
    });
    await instance.db.use({ ns: "api", db: name });

    const status: number = instance.db.status;
    const connectionStatus: string = this.ConnectionStatus[status]!;

    Log.info(`Connection to SurrealDb: ${connectionStatus}`);

    return instance;
  }

  public async CloseConnection(): Promise<void> {
    await this.db.close();
  }

  private HandleResult(result: T[]): T {
    const res: T | undefined = result[0];

    if (!res) throw new RepositoryError("NOT_FOUND", StatusCodes["NOT_FOUND"]);

    return res;
  }

  private GetWhereFromQuery<V extends keyof T>(query: Record<V, T[V]>): string {
    const keys: string[] = Object.keys(query);

    if (keys.length === 0) throw new RepositoryError("INVALID_QUERY", StatusCodes["BAD_REQUEST"]);

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
    const stringQuery: string = `UPDATE ${this.name} MERGE $up`.concat(
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
