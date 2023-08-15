import { Repository } from "./repositories.ts";
import { type Basic } from "../schemas/schemas.ts";
import { Filter, MongoClient, OptionalUnlessRequiredId } from "mongodb";

export class MongoRepository<T extends Basic> implements Repository<T> {
  private constructor(name: string) {
    this.name = name;
    this.coll = this.database.collection(name);
  }

  name: string;

  private static instance: MongoRepository<Basic>;

  private client = new MongoClient("mongodb://127.0.0.1:27017");

  private database = this.client.db("api");

  private coll: ReturnType<typeof this.database.collection<T>>;

  public static async getInstance(name: string) {
    if (!MongoRepository.instance) {
      MongoRepository.instance = new MongoRepository(name);
      await MongoRepository.instance.client.connect();
    }

    return MongoRepository.instance;
  }

  async closeConnection(): Promise<void> {
    await this.client.close();
  }

  async find(query: Partial<T>): Promise<T> {
    const found = await this.coll.findOne(query as Filter<T>);

    if (!found) throw new Error("NOT_FOUND");

    return found as T;
  }

  async findAll(): Promise<T[]> {
    const cursor = this.coll.find();

    const all = [];

    for await (const doc of cursor) {
      all.push(doc);
    }

    return all;
  }

  async findByUuid(uuid: string): Promise<T> {
    const found = await this.coll.findOne({ uuid } as Filter<T>);

    if (!found) throw new Error("NOT_FOUND");

    return found as T;
  }

  async updateWithUuid(uuid: string, up: Partial<T>): Promise<T> {
    const { matchedCount } = await this.coll.updateOne(
      { uuid } as Filter<T>,
      { $set: up },
      { upsert: false }
    );

    if (matchedCount === 0) throw new Error("NOT_FOUND");

    const updated = await this.findByUuid(uuid);

    if (!updated) throw new Error("NOT_FOUND");

    return updated;
  }

  async insertOne(thing: T): Promise<T> {
    const { insertedId } = await this.coll.insertOne(
      thing as OptionalUnlessRequiredId<T>
    );

    const inserted = await this.coll.findOne({ _id: insertedId } as Filter<T>);

    return inserted as T;
  }
}
