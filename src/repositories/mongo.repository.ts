import * as Schemas from "../schemas/schemas.ts";
import { MongoClient } from "mongodb";
import { Repository } from "./repositories.ts";

type User = Schemas.User;
type Users = Schemas.Users;

export class MongoRepository implements Repository {
  private constructor() {}

  private static instance: MongoRepository;

  private client = new MongoClient("mongodb://127.0.0.1:27017");

  private database = this.client.db("api");

  private db = this.database.collection<User>("users");

  public static async getInstance() {
    if (!MongoRepository.instance) {
      MongoRepository.instance = new MongoRepository();
      await MongoRepository.instance.client.connect();
    }

    return MongoRepository.instance;
  }

  async closeConnection() {
    await this.client.close();
  }

  async findAll(): Promise<Users> {
    const cursor = this.db.find();

    const all = [];

    for await (const doc of cursor) {
      all.push(doc);
    }

    return all;
  }

  async findById(id: string): Promise<User> {
    const user = await this.db.findOne({ id });

    if (!user) throw new Error("USER_NOT_FOUND");

    return user;
  }

  async findByCode(code: string): Promise<User> {
    const user = await this.db.findOne({ code });

    if (!user) throw new Error("USER_NOT_FOUND");

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.db.findOne({ email });

    if (!user) throw new Error("USER_NOT_FOUND");

    return user;
  }

  async updateWithId(id: string, up: Partial<User>): Promise<User> {
    const { matchedCount } = await this.db.updateOne(
      { id },
      { $set: up },
      { upsert: false }
    );

    if (matchedCount === 0) throw new Error("USER_NOT_FOUND");

    const user = await this.findById(id);

    if (!user) throw new Error("USER_NOT_FOUND");

    return user;
  }

  async updateWithCode(code: string, up: Partial<User>): Promise<User> {
    const { matchedCount } = await this.db.updateOne(
      { code },
      { $set: up },
      { upsert: false }
    );

    if (matchedCount === 0) throw new Error("USER_NOT_FOUND");

    const user = await this.findByCode(code);

    if (!user) throw new Error("USER_NOT_FOUND");

    return user;
  }

  async insertOne(user: Schemas.User): Promise<Schemas.User> {
    const { insertedId } = await this.db.insertOne(user);

    const inserted = await this.db.findOne({ _id: insertedId });

    return inserted;
  }
}
