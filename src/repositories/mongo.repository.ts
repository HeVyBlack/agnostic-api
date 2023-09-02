import { KeyInKeys, RepositoriesRepository, RepositoryError } from "./repositories.ts";

import { Schemas } from "@Schemas";
import Schema = Schemas.Schema;

import { Utils } from "@Utils";
import Env = Utils.Env;
import Log = Utils.Log;

import * as Mongo from "mongodb";
import { OptionalUnlessRequiredId, WithId, Filter } from "mongodb";
import { StatusCodes } from "http-status-codes";

export class MongoRepository<T extends Schema> implements RepositoriesRepository<T> {
  public name: string;
  private client: Mongo.MongoClient;
  private db: Mongo.Db;
  private coll: Mongo.Collection<T>;

  private constructor(name: string) {
    this.name = name;
    this.client = new Mongo.MongoClient(Env["MONGO_URI"]);
    this.db = this.client.db("api");
    this.coll = this.db.collection<T>(name);
  }

  public static async GetInstance<T extends Schema>(name: string): Promise<MongoRepository<T>> {
    const instance: MongoRepository<T> = new MongoRepository<T>(name);

    await instance.client.connect();

    const ping: Mongo.Document = await instance.db.command({ ping: 1 });

    Log.info(`Connection to Mongo: ${JSON.stringify(ping)}`);

    return instance;
  }

  public async CloseConnection(): Promise<void> {
    return await this.client.close();
  }

  public async Find<V extends keyof T>(query: Record<V, T[V]>): Promise<T> {
    const thing: T = (await this.coll.findOne(query as Filter<T>)) as T;
    if (!thing) throw new RepositoryError("NOT_FOUND", StatusCodes["NOT_FOUND"]);
    return thing as T;
  }

  public async FindAll(): Promise<T[]> {
    const cursor: Mongo.FindCursor<T> = this.coll.find() as Mongo.FindCursor<T>;

    const all: T[] = [];

    for await (const doc of cursor) {
      all.push(doc);
    }

    return all;
  }

  public async Update<V extends keyof T>(query: Record<V, T[V]>, up: KeyInKeys<T>): Promise<T> {
    const thing: WithId<T> | null = await this.coll.findOneAndUpdate(query as Filter<T>, up);

    if (!thing) throw new RepositoryError("NOT_FOUND", StatusCodes["NOT_FOUND"]);

    return thing as T;
  }

  public async InsertOne(thing: T): Promise<T> {
    const { acknowledged, insertedId }: Mongo.InsertOneResult<T> = await this.coll.insertOne(
      thing as OptionalUnlessRequiredId<T>
    );

    if (!acknowledged)
      throw new RepositoryError("ERROR_AT_INSERT", StatusCodes["INTERNAL_SERVER_ERROR"]);

    const inserted = await this.coll.findOne({ _id: insertedId } as Filter<T>);

    if (!inserted)
      throw new RepositoryError("ERROR_AT_INSERT", StatusCodes["INTERNAL_SERVER_ERROR"]);

    return inserted as T;
  }

  public async Delete<V extends keyof T>(query: Record<V, T[V]>): Promise<T> {
    const thing: WithId<T> | null = await this.coll.findOneAndDelete(query as Filter<T>);

    if (!thing) throw new RepositoryError("NOT_FOUND", StatusCodes["NOT_FOUND"]);

    return thing as T;
  }
}
