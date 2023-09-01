import {
  KeyInKeys,
  RepositoriesRepository,
  RepositoryError,
} from "./repositories.ts";
import { Schemas } from "@Schemas";
import Schema = Schemas.Schema;

import {
  Collection,
  Db,
  Filter,
  FindCursor,
  InsertOneResult,
  MongoClient,
  OptionalUnlessRequiredId,
  WithId,
} from "mongodb";

export class MongoRepository<T extends Schema>
  implements RepositoriesRepository<T>
{
  public name: string;
  private client: MongoClient;
  private db: Db;
  private coll: Collection<T>;

  private constructor(name: string, uri: string) {
    this.name = name;
    this.client = new MongoClient(uri);
    this.db = this.client.db("api");
    this.coll = this.db.collection<T>(name);
  }

  public static async GetInstance<T extends Schema>(
    name: string,
    uri: string
  ): Promise<MongoRepository<T>> {
    const instance: MongoRepository<T> = new MongoRepository<T>(name, uri);
    await instance.client.connect();
    return instance;
  }

  public async CloseConnection(): Promise<void> {
    return await this.client.close();
  }

  public async Find<V extends keyof T>(query: Record<V, T[V]>): Promise<T> {
    const thing: T = (await this.coll.findOne(query as Filter<T>)) as T;
    if (!thing) throw new RepositoryError("NOT_FOUND");
    return thing as T;
  }

  public async FindAll(): Promise<T[]> {
    const cursor: FindCursor<T> = this.coll.find() as FindCursor<T>;

    const all: T[] = [];

    for await (const doc of cursor) {
      all.push(doc);
    }

    return all;
  }

  public async Update<V extends keyof T>(
    query: Record<V, T[V]>,
    up: KeyInKeys<T>
  ): Promise<T> {
    const thing: WithId<T> | null = await this.coll.findOneAndUpdate(
      query as Filter<T>,
      up
    );

    if (!thing) throw new RepositoryError("NOT_FOUND");

    return thing as T;
  }

  public async InsertOne(thing: T): Promise<T> {
    const inserted: InsertOneResult<T> = await this.coll.insertOne(
      thing as OptionalUnlessRequiredId<T>
    );

    return inserted as unknown as T;
  }

  public async Delete<V extends keyof T>(query: Record<V, T[V]>): Promise<T> {
    const thing: WithId<T> | null = await this.coll.findOneAndDelete(
      query as Filter<T>
    );

    if (!thing) throw new RepositoryError("NOT_FOUND");

    return thing as T;
  }
}
